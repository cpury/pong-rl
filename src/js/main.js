// Async sleep function :)
async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(document).ready(async () => {
  let leftController = new DumbController('left');
  let rightController = new DumbController('right');
  for (;;) {
    const match = new Match({ leftController, rightController });
    await match.start();
    await sleep(500);
  }
});
