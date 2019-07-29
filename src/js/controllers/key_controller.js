// Defines a controller controlled via keys.

import BaseController from '../base_controller';

export default class KeyController extends BaseController {
  constructor(leftOrRight, options) {
    options = {
      upKey: 38,
      downKey: 40,
      ...(options || {}),
    };
    super(leftOrRight, options);

    this.isUpKeyPressed = false;
    this.isDownKeyPressed = false;

    // Set up keys:
    $(document).keydown(event => {
      if (event.which === this.upKey) {
        this.isUpKeyPressed = true;
      } else if (event.which === this.downKey) {
        this.isDownKeyPressed = true;
      }
    });

    $(document).keyup(event => {
      if (event.which === this.upKey) {
        this.isUpKeyPressed = false;
      } else if (event.which === this.downKey) {
        this.isDownKeyPressed = false;
      }
    });
  }

  selectAction(state, previousState) {
    if (this.isUpKeyPressed) return -1;
    if (this.isDownKeyPressed) return 1;
    return 0;
  }
}
