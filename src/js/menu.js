// A global menu that runs before the game starts to select controllers etc.

import Match from './match';

export default {
  // Pass a dictionary of controller classes that can be selected
  init(controllers) {
    this.$playerA = $('#playerADropdown');
    this.$playerB = $('#playerBDropdown');
    this.$selfPlay = $('#selfPlayDropdown');
    this.$difficulty = $('#difficultyDropdown');
    this.controllers = controllers;

    // Load player menu entries:
    Object.keys(this.controllers).forEach((controller, i) => {
      $('.player.select select').append(
        $('<option>', {
          value: i,
          text: controller,
        }),
      );
    });
    $('.player.select').removeClass('is-loading');
    $('#playButton').removeClass('is-loading');

    // Listen to selfplay dropdown and enable / disable player b
    this.$selfPlay.change(event => {
      if (event.currentTarget.value === 'Yes') {
        // Disable playerB and set to same controller type:
        this.$playerB.val(this.$playerA.val());
        this.$playerB.attr('disabled', 'disabled');
      } else {
        // Enable select again
        this.$playerB.removeAttr('disabled');
      }
    });
    this.$selfPlay.change();
  },

  // Returns the controller class selected for player a.
  getPlayerA() {
    const selected = this.$playerA.find(':selected').text();
    return this.controllers[selected];
  },

  // Returns the controller class selected for player b, or undefined if self-play.
  getPlayerB() {
    const isSelfPlay = this.$selfPlay.find(':selected').text() === 'Yes';

    if (!isSelfPlay) {
      const selected = this.$playerB.find(':selected').text();
      return this.controllers[selected];
    }
  },

  // Returns the difficulty level from 1 to 3
  getDifficulty() {
    const difficultyText = this.$difficulty.find(':selected').text();
    if (difficultyText === 'Easy') return 1;
    if (difficultyText === 'Medium') return 2;
    return 3;
  },

  // Shows the menu until the play button is pressed, then returns a matchOptions
  // object based on the user's choices.
  async run() {
    return new Promise(resolve => {
      $('#menu').addClass('active');

      // Listen to click on play button:
      $('#playButton').click(event => {
        $('#menu').removeClass('active');

        const leftControllerClass = this.getPlayerA();
        const rightControllerClass = this.getPlayerB();
        const difficulty = this.getDifficulty();

        const matchOptions = {
          ...Match.createOptions(difficulty),
          leftController: new leftControllerClass('left'),
        };

        if (rightControllerClass) matchOptions.rightController = new rightControllerClass('right');
        else matchOptions.rightController = matchOptions.leftController.mirrorController();

        resolve(matchOptions);
      });
    });
  },
};
