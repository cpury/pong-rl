// Async sleep function :)
async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(document).ready(async () => {
  window.Menu.init();

  const leftController = new DumbController('left');
  const rightController = leftController.mirrorController();

  for (;;) {
    const match = new Match({ leftController, rightController });
    await match.run();
    await sleep(500);
  }
});
