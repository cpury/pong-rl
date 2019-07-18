// Defines an abstract base controller

// eslint-disable-next-line no-unused-vars
class BaseController {
  constructor(leftOrRight, options) {
    this.leftOrRight = leftOrRight;
    this.options = options;
    Object.assign(this, options);
  }

  mirrorController(options) {
    // Create a mirrored controller of this controller for self-play.
    // For RL agents, make sure this also links the underlying models.
    let leftOrRight = 'right';
    if (this.leftOrRight === 'right') this.leftOrRight = 'left';
    options = {
      ...this.options,
      ...(options || {}),
    };
    return new this.constructor(leftOrRight, options);
  }

  // eslint-disable-next-line no-unused-vars
  async selectAction(state) {
    // Given the current game state, should return
    // 1 (down), -1 (up) or 0 (nothing)
  }

  async onMatchStart() {}

  // eslint-disable-next-line no-unused-vars
  async onMatchEnd(won) {
    // Called when the match ends. Won is whether this player won or not.
  }
}
