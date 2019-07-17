// Defines an abstract base controller

class BaseController {
  constructor(leftOrRight, options) {
    this.leftOrRight = leftOrRight;
    Object.assign(this, options);
  }

  selectAction(state) {
    // Given the current game state, should return
    // 1 (down), -1 (up) or 0 (nothing)
  }

  onMatchStart() {}

  onMatchEnd(won) {
    // Called when the match ends. Won is whether this player won or not.
  }
}
