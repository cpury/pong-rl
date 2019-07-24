import '../scss/style.scss';

import DumbController from './controllers/dumb_controller.js';
import Menu from './menu.js';
import Match from './match.js';

const controllers = {
  DumbController,
};

// Async sleep function :)
async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(document).ready(async () => {
  Menu.init(controllers);
  const matchOptions = await Menu.run();
  await sleep(500);
  $('#menu').remove();
  $('#game').addClass('active');
  for (;;) {
    const match = new Match(matchOptions);
    await match.run();
    await sleep(500);
  }
});
