// A simple deep Q-learning controller that learns while playing.

import * as tf from '@tensorflow/tfjs';

import BaseController from '../base_controller';
import ReplayMemory from './replay_memory';
import DenseDQN from './dense_dqn';

export default class DQLController extends BaseController {
  constructor(leftOrRight, options) {
    options = {
      memoryCapacity: 2000,
      trainingSetMinSize: 40,
      trainingSetMaxSize: 400,
      trainingEpochs: 1,
      trainingIterations: 4,
      ...(options || {}),
    };
    options.modelOptions = {
      nInputs: 6,
      nHiddenLayers: 3,
      nHiddenUnits: 40,
      dropout: 0.1,
      ...(options.dqnOptions || {}),
    };
    options.memoryOptions = {
      capacity: 2000,
      ...(options.memoryOptions || {}),
    };
    super(leftOrRight, options);

    this.replayMemory = this.replayMemory || new ReplayMemory(options.memoryOptions);
    this.model = this.model || new DenseDQN(options.modelOptions);

    this.previousState = null;
    this.previousAction = null;
  }

  // Create a mirrored controller of this controller for self-play.
  // Shares the underlying replay memory and model.
  mirrorController(options) {
    let leftOrRight = 'right';
    if (this.leftOrRight === 'right') this.leftOrRight = 'left';
    options = {
      ...this.options,
      replayMemory: this.replayMemory,
      model: this.model,
      trainingIterations: 0,
      ...(options || {}),
    };
    return new this.constructor(leftOrRight, options);
  }

  // Return the reward for the given state. Simple: +1 when we win, -1 when we lose.
  getReward(state) {
    if (state.winner === this.leftOrRight) return 1;
    else if (state.winner != null) return -1;
    else return 0;
  }

  // Convert a state to an array to be used as input to the DQN model.
  // Contains the ball position and force, as well as both paddle's y positions.
  stateToArray(s, side) {
    side = side || this.leftOrRight;

    const ownPaddle = side === 'left' ? 'leftPaddle' : 'rightPaddle';
    const otherPaddle = side === 'left' ? 'rightPaddle' : 'leftPaddle';
    const ballY = s.ball.y * 2 - 1;
    let ballForceX = s.ball.forceX;
    const ballForceY = s.ball.forceY;

    let ballX = s.ball.x * 2 - 1;
    const ownY = s[ownPaddle].y * 2 - 1;
    const otherY = s[otherPaddle].y * 2 - 1;

    if (side === 'right') {
      // Mirror x-based features
      ballX = -ballX;
      ballForceX = -ballForceX;
    }

    return [ballX, ballY, ballForceX, ballForceY, ownY, otherY];
  }

  // Given a batch of transitions, converts them to an x tensor.
  async transitionsToX(transitions) {
    const x = transitions.map(t => this.stateToArray(t.state, t.side));
    return tf.tensor(x);
  }

  // Given a batch of transitions, returns a y tensor of target values.
  async transitionsToY(transitions) {
    // Get the expected reward for each transition
    const expectedStateActionValues = Array(transitions.length);

    // Fill "neutral" values with previous estimates:
    const stateExpectationsTensor = tf.tidy(() => {
      const states = tf.tensor(transitions.map(t => this.stateToArray(t.state, t.side)));
      let stateExpectations = this.model.predict(states);
      stateExpectations = tf.sub(stateExpectations, tf.mean(stateExpectations));
      return stateExpectations;
    });

    // Estimate Q values for resulting states:
    const newStateExpectationsTensor = tf.tidy(() => {
      const newStates = tf.tensor(transitions.map(t => this.stateToArray(t.newState, t.side)));
      let newStateExpectations = this.model.predict(newStates);
      newStateExpectations = tf.sub(newStateExpectations, tf.mean(newStateExpectations));
      return newStateExpectations;
    });

    // Wait for the computations to be done:
    const [stateExpectations, newStateExpectations] = await Promise.all([
      stateExpectationsTensor.array(),
      newStateExpectationsTensor.array(),
    ]);

    tf.dispose([stateExpectationsTensor, newStateExpectationsTensor]);

    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i];

      // Bootstrap the target Q values
      const directReward = transition.reward;
      const winner = transition.newState && transition.newState.winner;
      expectedStateActionValues[i] = stateExpectations[i];
      const actionIndex = [-1, 0, 1].indexOf(transition.action);
      const nextStateQ = winner ? 0 : Math.max(...newStateExpectations[i]);
      expectedStateActionValues[i][actionIndex] = Math.max(
        -1,
        Math.min(directReward + nextStateQ, 1),
      );
    }

    return tf.tensor(expectedStateActionValues);
  }

  // Select action given state
  async selectAction(state) {
    const reward = this.getReward(state);

    if (this.previousState) {
      // Remember this transition so we can learn from it:
      this.replayMemory.push(
        this.leftOrRight,
        this.previousState,
        this.previousAction,
        state,
        reward,
      );
    }

    // Let the model pick the next action
    const action = await this.model.sampleAction(this.stateToArray(state), 1);

    this.previousState = state;
    this.previousAction = action;

    return action;
  }

  // Train the model
  async trainModel() {
    // Training set should not be bigger than our replay memory:
    const trainingSetSize = Math.round(
      Math.min(this.replayMemory.memory.length, this.trainingSetMaxSize),
    );

    // Let's not train if we didn't collect enough examples yet:
    if (trainingSetSize < this.trainingSetMinSize) return;

    // Train the model
    return new Promise((resolve, reject) => {
      const trainingSet = this.replayMemory.sample(trainingSetSize);

      Promise.all([this.transitionsToX(trainingSet), this.transitionsToY(trainingSet)]).then(
        ([x, y]) => {
          this.model
            .fit(x, y, { epochs: this.trainingEpochs })
            .then(resolve)
            .catch(reject)
            .finally(() => {
              // Clear tensors from memory:
              tf.dispose([x, y]);
            });
        },
      );
    });
  }

  async onMatchEnd(won) {
    this.previousState = null;
    this.previousAction = null;

    // Train model a few times since the default values get updated in each step
    for (let i = 0; i < this.trainingIterations; i++) await this.trainModel();
  }
}
