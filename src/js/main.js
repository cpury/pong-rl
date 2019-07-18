// Async sleep function :)
async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(document).ready(async () => {
  // Load player menu entries:
  const $playerADropdown = $('#playerADropdown');
  const $playerBDropdown = $('#playerBDropdown');

  Object.keys(window.controllers).forEach((controller, i) => {
    $('.player.select select').append(
      $('<option>', {
        value: i,
        text: controller,
      }),
    );
  });
  $('.player.select').removeClass('is-loading');

  const leftController = new DumbController('left');
  const rightController = leftController.mirrorController();

  for (;;) {
    const match = new Match({ leftController, rightController });
    await match.run();
    await sleep(500);
  }
});
