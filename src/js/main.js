import '../scss/style.scss';

import Menu from './menu';
import Match from './match';
import Stats from './stats';

import { sleep } from './util';

import KeyController from './controllers/key_controller';
import DumbController from './controllers/dumb_controller';
import DQLController from './controllers/dql_controller';
import VisualDQLController from './controllers/visual_dql_controller';

const controllers = {
  DQLController,
  VisualDQLController,
  DumbController,
  KeyController,
};

$(document).ready(async () => {
  Menu.init(controllers);
  const matchOptions = await Menu.run();
  let liveMode = true;

  $('#liveDropdown').change(event => {
    liveMode = event.currentTarget.value === 'Yes';
  });

  await sleep(500);
  $('#menu').remove();
  $('#game').addClass('active');

  matchOptions.stats = new Stats();

  for (;;) {
    window.currentMatch = new Match({
      ...matchOptions,
      live: liveMode,
    });
    await window.currentMatch.run();
  }
});
