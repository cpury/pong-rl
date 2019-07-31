// Defines a controller that simply follows the ball on the y axis with some mistakes

import BaseController from '../base_controller.js';

export default class DumbController extends BaseController {
  constructor(leftOrRight, options) {
    options = {
      reactionTime: 1,
      hiccupChance: 0.1,
      ...(options || {}),
    };
    super(leftOrRight, options);

    this.currentAction = 0;
    this.frame = 0;
  }

  // Select action given state. Simply follows the ball with some hiccups.
  async selectAction(state) {
    // Only change your action every couple frames:
    if (++this.frame % this.reactionTime !== 0) {
      return this.currentAction;
    }

    const ball = state.ball;
    const paddle = this.leftOrRight === 'left' ? state.leftPaddle : state.rightPaddle;
    this.currentAction = paddle.y > ball.y ? -1 : 1;

    if (Math.random() < this.hiccupChance) {
      this.currentAction = -this.currentAction;
    }

    return this.currentAction;
  }
}
