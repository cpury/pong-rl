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

    // TODO Listen to selfplay dropdown and enable / disable player b
  },
};
