import '../scss/style.scss';

import Menu from './menu';
import Match from './match';
import Stats from './stats';

import KeyController from './controllers/key_controller';
import DumbController from './controllers/dumb_controller';
import DQLController from './controllers/dql_controller';

const controllers = {
  KeyController,
  DumbController,
  DQLController,
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

  matchOptions.stats = new Stats();

  for (;;) {
    const match = new Match(matchOptions);
    await match.run();
    await sleep(500);
  }
});
