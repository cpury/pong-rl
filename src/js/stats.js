// A UI to keep track of some stats.

// Moving average
class MovingAverage {
  constructor(length) {
    this.buffer = [];
    this.length = length;
  }

  push(x) {
    this.buffer.push(x);
    if (this.buffer.length > this.length) this.buffer.shift();
  }

  getAverage() {
    if (this.buffer.length === 0) return 0;
    return this.buffer.reduce((x, prev) => x + prev) / this.buffer.length;
  }
}

function convertTimeToText(d, digits) {
  return (d / 1000).toFixed(digits) + 's';
}

export default class Stats {
  constructor(options) {
    options = {
      divId: 'stats',
      movingAverageLength: 20,
      frameUpdateInterval: 5,
      ...options,
    };

    Object.assign(this, options);

    this.$div = $(`#${this.divId}`);

    this.stats = {
      match: 0,
      matchFrame: 0,
      matchTime: 0,
      wins: {
        left: 0,
        right: 0,
      },
      lastDurations: new MovingAverage(this.movingAverageLength),
    };
  }

  // Updates the UI with the current stats
  async updateUi() {
    this.$div.find('.stats-match').text(this.stats.match);
    this.$div.find('.stats-time').text(convertTimeToText(this.stats.matchTime, 1));
    this.$div
      .find('.stats-match-duration')
      .text(convertTimeToText(this.stats.lastDurations.getAverage(), 1));

    return new Promise(resolve => {
      window.requestAnimationFrame(resolve);
    });
  }

  // Call this to update the match time at every frame
  async onFrame(currentTime) {
    this.stats.matchTime = currentTime;
    this.stats.matchFrame += 1;

    if (this.stats.matchFrame % this.frameUpdateInterval === 0) {
      return await this.updateUi();
    }
  }

  // Call at the end of each match with the winner and duration of the match.
  // Will update the stats and UI.
  async onMatchEnd(winner, duration) {
    this.stats.match += 1;
    this.stats.wins[winner] += 1;
    this.stats.lastDurations.push(duration);
    this.stats.matchTime = duration;

    await this.updateUi();
    this.stats.matchTime = 0;
    this.stats.matchFrame = 0;
  }
}
