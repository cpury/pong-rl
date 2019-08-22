// Dense Q-Network that can be used to do Q-Learning on a fixed feature set.

import * as tf from '@tensorflow/tfjs';

// Custom loss function that ignores NaN values.
// Since AFAIK tfjs doesn't use null values, we simply choose everything below -5
// to be masked.
const maskedHuberLoss = (labels, predictions) =>
  tf.tidy(() => {
    const mask = tf.less(labels, -5);
    const zeros = tf.zerosLike(labels);
    const maskedLabels = tf.where(mask, zeros, labels);
    const maskedPredictions = tf.where(mask, zeros, predictions);

    return tf.losses.huberLoss(maskedLabels, maskedPredictions);
  });

export default class DenseDQN {
  constructor(options) {
    options = {
      nInputs: 6,
      nHiddenLayers: 2,
      nHiddenUnits: 100,
      hiddenActivation: 'relu',
      dropout: 0.2,
      lr: 0.01,
      batchSize: 80,
      ...(options || {}),
    };
    Object.assign(this, options);

    // Build a dense model with three outputs (one for each action)

    this.model = tf.sequential();

    this.model.add(
      tf.layers.dense({
        units: this.nHiddenUnits,
        inputShape: [this.nInputs],
        initialization: tf.initializers.heNormal(),
        activation: this.hiddenActivation,
      }),
    );
    this.model.add(tf.layers.dropout(this.dropout));

    for (let i = 0; i < this.nHiddenLayers - 1; i++) {
      this.model.add(
        tf.layers.dense({
          units: this.nHiddenUnits,
          initialization: tf.initializers.heNormal(),
          activation: this.hiddenActivation,
        }),
      );
      this.model.add(tf.layers.dropout(this.dropout));
    }

    this.model.add(
      tf.layers.dense({
        units: 3,
        initialization: tf.initializers.heNormal(),
        activation: 'tanh',
      }),
    );
    this.model.compile({ loss: maskedHuberLoss, optimizer: tf.train.adam(this.lr) });

    this.loss = null;
  }

  // Train the model with the given tensors
  async fit(x, y, options) {
    options = {
      epochs: 10,
      batchSize: this.batchSize,
      shuffle: true,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          this.loss = logs.loss;
        },
      },
      ...(options || {}),
    };
    options.batchSize = Math.min(x.shape[0], options.batchSize);

    return await this.model.fit(x, y, options);
  }

  // Predict the output for the given tensor
  predict(x) {
    return this.model.predict(x);
  }

  // Given an x array representing a single state, sample the next action
  async sampleAction(x, temperature) {
    const actionIndexTensor = await tf.tidy(() => {
      x = tf.tensor(x);
      let predictions = tf.squeeze(this.predict(x.expandDims(0)));

      if (this.isGreedy) {
        return tf.argMax(predictions).arraySync()[0];
      }

      // Scale to [0, 1]
      predictions = tf.div(tf.add(1, predictions), 2);
      // Due to noise, can still be larger/smaller
      const min = tf.min(predictions);
      const max = tf.max(predictions);
      predictions = tf.div(tf.sub(predictions, min), tf.sub(max, min));

      // Now sample with the given temperature
      const logProbs = tf.div(tf.log(predictions), temperature);
      const expProbs = tf.exp(logProbs);
      const sumExpProbs = tf.sum(expProbs);
      const probs = tf.div(expProbs, sumExpProbs);

      return tf.multinomial(probs, 1, null, true);
    });
    const actionIndex = (await actionIndexTensor.array())[0];
    actionIndexTensor.dispose();

    return [-1, 0, 1][actionIndex];
  }

  setLearningRate(lr) {
    this.lr = lr;
    this.model.compile({ loss: maskedHuberLoss, optimizer: tf.train.adam(lr) });
  }
}
