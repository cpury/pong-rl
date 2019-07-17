async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(document).ready(async () => {
  while (true) {
    const match = new Match();
    await match.start();
    await sleep(500);
  }
});
