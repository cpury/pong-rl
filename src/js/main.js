// Async sleep function :)
async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(document).ready(async () => {
  window.Menu.init();
  const matchOptions = await window.Menu.run();

  await sleep(500);
  $('#menu').remove();
  $('#game').addClass('active');

  for (;;) {
    const match = new Match(matchOptions);
    await match.run();
    await sleep(500);
  }
});
