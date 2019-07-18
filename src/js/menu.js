window.Menu = {
  init() {
    this.$playerA = $('#playerADropdown');
    this.$playerB = $('#playerBDropdown');
    this.$selfPlay = $('#selfPlayDropdown');

    // Load player menu entries:
    Object.keys(window.controllers).forEach((controller, i) => {
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
  },

  // Returns the controller class selected for player a.
  getPlayerA() {
    const selected = this.$playerA.find(':selected').text();
    return window.controllers[selected];
  },

  // Returns the controller class selected for player b, or undefined if self-play.
  getPlayerB() {
    const isSelfPlay = this.$selfPlay.find(':selected').text() === 'Yes';

    if (!isSelfPlay) {
      const selected = this.$playerB.find(':selected').text();
      return window.controllers[selected];
    }
  },

  // Shows the menu until the play button is pressed, then returns an object describing the
  // selected options:
  async run() {
    return new Promise(resolve => {
      $('#menu').addClass('active');

      // Listen to click on play button:
      $('#playButton').click(event => {
        $('#menu').removeClass('active');

        const leftControllerClass = this.getPlayerA();
        const rightControllerClass = this.getPlayerB();

        const matchOptions = {
          leftController: new leftControllerClass(),
        };

        if (rightControllerClass) matchOptions.rightController = new rightControllerClass();
        else matchOptions.rightController = matchOptions.leftController.mirrorController();

        resolve(matchOptions);
      });
    });
  },
};
