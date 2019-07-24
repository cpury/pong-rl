// Defines a ReplayMemory that stores state transitions.

import _ from 'lodash';

export default class ReplayMemory {
  constructor(options) {
    options = {
      capacity: 2000,
      ...(options || {}),
    };
    Object.assign(this, options);

    this.memory = Array(this.capacity);
    this.position = 0;
  }

  // Store a transition from a state via an action to another state and a reward.
  push(side, state, action, newState, reward) {
    // Stores a transition
    this.memory[this.position] = {
      side,
      state,
      action,
      newState,
      reward,
    };
    this.position = (this.position + 1) % this.capacity;
  }

  // Returns a random sample of the given size
  sample(n) {
    return _.sampleSize(this.memory, n);
  }
}
