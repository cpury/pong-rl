// Defines an abstract base controller

// eslint-disable-next-line no-unused-vars
export default class BaseController {
  constructor(leftOrRight, options) {
    this.leftOrRight = leftOrRight;
    this.options = options;
    Object.assign(this, options);

    // Set this to true if you require image information in your states
    this.isVisual = false;
  }

  // Create a mirrored controller of this controller for self-play.
  // For RL agents, make sure this also links the underlying models.
  mirrorController(options) {
    let leftOrRight = 'right';
    if (this.leftOrRight === 'right') this.leftOrRight = 'left';
    options = {
      ...this.options,
      ...(options || {}),
    };
    return new this.constructor(leftOrRight, options);
  }

  // Given the current game state, should return
  // 1 (down), -1 (up) or 0 (nothing)
  // eslint-disable-next-line no-unused-vars
  async selectAction(state) {}

  async onMatchStart() {}

  // Called when the match ends. Won is whether this player won or not.
  // eslint-disable-next-line no-unused-vars
  async onMatchEnd(won) {}
}
