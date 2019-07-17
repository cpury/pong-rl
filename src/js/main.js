async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(document).ready(async () => {
  for (;;) {
    const match = new Match();
    await match.start();
    await sleep(500);
  }
});
