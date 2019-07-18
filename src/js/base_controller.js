// Defines an abstract base controller

class BaseController {
  constructor(leftOrRight, options) {
    this.leftOrRight = leftOrRight;
    Object.assign(this, options);
  }

  // eslint-disable-next-line no-unused-vars
  selectAction(state) {
    // Given the current game state, should return
    // 1 (down), -1 (up) or 0 (nothing)
  }

  onMatchStart() {}

  // eslint-disable-next-line no-unused-vars
  onMatchEnd(won) {
    // Called when the match ends. Won is whether this player won or not.
  }
}

window.BaseController = BaseController;
