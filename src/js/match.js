// Represents a single match. Updates and keeps the game state. Draws to a canvas.

import { sleep } from './util';

export default class Match {
  constructor(options) {
    options = {
      paddleHeight: 0.25,
      canvasId: 'gameCanvas',

      // How often the game should be updated / redrawn
      updateFrequency: 40, // = 25 FPS
      // Ask controllers every X frames for an updated action:
      controllerFrameInterval: 5, // 25 FPS / 5 = 5 times per second

      // How fast the paddles and the ball can move
      paddleSpeed: 1,
      ballSpeed: 0.8,
      ballSpeedIncrease: 1.001,
      ballSpeedMax: 2,

      ...options,
    };

    Object.assign(this, options);

    // Find the canvas and get its drawing context.
    this.canvas = document.getElementById(this.canvasId);
    this.ctx = this.canvas.getContext('2d');

    // How much time has passed at each update. Fixed so we get same results
    // on every machine.
    this.timeFactor = this.updateFrequency / 1000;

    // Keep track of the ball and two paddles.
    this.leftPaddle = {
      x: 0.02,
      y: 0.5,
      height: this.paddleHeight,
      width: 0.0375,
      forceY: 0,
      previousAction: null,
      speed: this.paddleSpeed,
    };
    this.rightPaddle = {
      x: 0.98,
      y: 0.5,
      height: this.paddleHeight,
      width: 0.0375,
      forceY: 0,
      previousAction: null,
      speed: this.paddleSpeed,
    };
    this.ball = {
      x: 0.5,
      y: 0.5,
      height: 0.05,
      width: 0.0375,
      forceX: 0,
      forceY: 0,
      speed: this.ballSpeed,
    };

    // Start the ball in a random direction.
    const forceX = 0.5 + Math.random() * 0.25;
    const forceY = 0.9 + Math.random() * 0.25;
    const norm = Math.sqrt(Math.pow(forceX, 2) + Math.pow(forceY, 2));
    this.ball.forceX = ((Math.random() > 0.5 ? 1 : -1) * forceX) / norm;
    this.ball.forceY = ((Math.random() > 0.5 ? 1 : -1) * forceY) / norm;

    // Keep track of the last two game states
    this.currentState = this.getState();
    this.previousState = null;
    this.currentFrame = 0;
    this.winner = null;

    this.draw();
  }

  // Given a difficulty level from 1 to 3, generates an options object to instantiate
  // a new Match object with.
  static createOptions(difficulty) {
    let q = 1;
    if (difficulty === 2) q = 1.15;
    if (difficulty === 3) q = 1.5;
    const nq = 1 / q;

    let ballSpeedIncrease = 1.0001;
    if (difficulty === 2) ballSpeedIncrease = 1.001;
    if (difficulty === 3) ballSpeedIncrease = 1.01;

    return {
      paddleHeight: 0.33 * nq,
      paddleSpeed: 1.25 * nq,
      ballSpeed: 0.8 * q,
      ballSpeedMax: 1.5 * q,
      ballSpeedIncrease,
    };
  }

  // Return the current state of the game.
  getState() {
    return {
      ball: {
        x: this.ball.x,
        y: this.ball.y,
        forceX: this.ball.forceX * this.ball.speed,
        forceY: this.ball.forceY * this.ball.speed,
      },
      leftPaddle: {
        x: this.leftPaddle.x,
        y: this.leftPaddle.y,
      },
      rightPaddle: {
        x: this.rightPaddle.x,
        y: this.rightPaddle.y,
      },
      winner: this.getWinner(),
      timePassed: this.currentFrame * this.timeFactor,
    };
  }

  // Check if the given side's paddle is colliding with the ball.
  // Pass 'left' or 'right' (since the logic is slightly different)
  checkCollision(leftOrRight) {
    const paddle = leftOrRight === 'left' ? this.leftPaddle : this.rightPaddle;
    const ball = this.ball;

    const paddleWidth = paddle.width;
    const paddleHeight = paddle.height * 1.1;
    const ballWidth = ball.width;
    const ballHeight = ball.height;

    // First, check on the x dimension if a collision is possible:
    if (leftOrRight === 'left' && ball.x - ballWidth / 2 > paddle.x + paddleWidth / 2) {
      // It's too far from the left paddle
      return false;
    }
    if (leftOrRight === 'right' && ball.x + ballWidth / 2 < paddle.x - paddleWidth / 2) {
      // It's too far from the right paddle
      return false;
    }

    // Now check on the y dimension:
    if (ball.y - ballHeight / 2 > paddle.y + paddleHeight / 2) {
      // The top of the ball is below the bottom of the paddle
      return false;
    }
    if (ball.y + ballHeight / 2 < paddle.y - paddleHeight / 2) {
      // The bottom of the ball is above the top of the paddle
      return false;
    }

    // Check if its too far behind the paddle
    if (leftOrRight === 'left' && ball.x - ballWidth / 2 < paddle.x - paddleWidth / 2) {
      // It's past the left paddle
      return false;
    }
    if (leftOrRight === 'right' && ball.x + ballWidth / 2 > paddle.x + paddleWidth / 2) {
      // It's past the right paddle
      return false;
    }

    return true;
  }

  // Move the given object by its force, checking for collisions and potentially
  // updating the force values.
  moveObject(obj, timeFactor, isBall) {
    if (obj.forceX) {
      obj.x += obj.forceX * obj.speed * timeFactor;

      // A ball should bounce off paddles
      const sideToCheck = obj.forceX > 0 ? 'right' : 'left';
      if (this.checkCollision(sideToCheck)) {
        obj.forceX = -obj.forceX;
      }
    }

    if (obj.forceY) {
      obj.y += obj.forceY * obj.speed * timeFactor;

      const radiusY = obj.height / 2;

      // When hitting a wall, a paddle stops, a ball bounces back:
      if (!isBall) {
        obj.y = Math.max(radiusY, Math.min(1 - radiusY, obj.y));
      } else if (obj.y < radiusY || obj.y > 1 - radiusY) {
        obj.forceY = -obj.forceY;
      }
    }
  }

  // Checks if one side one won and returns 'left' or 'right' if so.
  getWinner() {
    const ballWidth = this.ball.width / 2;
    const paddleWidth = this.leftPaddle.width / 2;

    if (this.ball.forceX < 0 && this.ball.x - ballWidth < this.leftPaddle.x - paddleWidth) {
      return 'right';
    }
    if (this.ball.forceX > 0 && this.ball.x + ballWidth > this.rightPaddle.x + paddleWidth) {
      return 'left';
    }
  }

  // Moves objects, checks for collisions, etc.
  async update() {
    this.previousState = this.currentState;
    this.currentState = this.getState();

    // Check if match ended:
    const winner = this.currentState.winner;
    if (winner) this.winner = winner;

    // Ask controllers for action based on current state.
    // Either every few frames or if there's a winner (to give them a chance to register the win)
    let leftAction = this.leftPaddle.lastAction || 0;
    let rightAction = this.rightPaddle.lastAction || 0;

    if (this.currentState.winner || this.currentFrame % this.controllerFrameInterval === 0) {
      if (this.leftController)
        leftAction = await this.leftController.selectAction(this.currentState);
      if (this.rightController)
        rightAction = await this.rightController.selectAction(this.currentState);
    }

    this.leftPaddle.forceY = leftAction;
    this.rightPaddle.forceY = rightAction;

    this.leftPaddle.lastAction = leftAction;
    this.rightPaddle.lastAction = rightAction;

    // Update each object:
    this.moveObject(this.leftPaddle, this.timeFactor);
    this.moveObject(this.rightPaddle, this.timeFactor);
    this.moveObject(this.ball, this.timeFactor, true);

    // Increase ball speed
    this.ballSpeed = Math.min(this.ballSpeedMax, this.ballSpeed * this.ballSpeedIncrease);
    this.ball.speed = this.ballSpeed;

    this.currentFrame += 1;

    this.stats && this.stats.onFrame(this.currentFrame * this.updateFrequency);
  }

  // Given an object with coordinates and size, draw it to the canvas
  drawObject(obj) {
    const width = obj.width * this.canvas.width;
    const height = obj.height * this.canvas.height;
    const x = obj.x * this.canvas.width - width / 2;
    const y = obj.y * this.canvas.height - height / 2;
    this.ctx.fillRect(x, y, width, height);
  }

  // Redraw the game based on the current state
  draw() {
    this.ctx.fillStyle = '#e5e5e6';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObject(this.ball);
    this.drawObject(this.leftPaddle);
    this.drawObject(this.rightPaddle);
  }

  // Call periodically. Will update the state and draw every few frames
  async updateAndDraw() {
    await this.update();
    this.draw();
  }

  // Starts the game and runs until completion.
  async run() {
    let updateInProgress = false;

    return new Promise((resolve, reject) => {
      this.leftController && this.leftController.onMatchStart();
      this.rightController && this.rightController.onMatchStart();

      const updateInterval = setInterval(() => {
        if (updateInProgress) return;

        let error = null;
        updateInProgress = true;

        this.updateAndDraw()
          .then(() => {
            updateInProgress = false;
          })
          .catch(e => {
            error = e;
            console.error(e);
          })
          .finally(() => {
            // Check if the match is finished or there was an error
            if (error) {
              clearInterval(updateInterval);
              reject(error);
            } else if (this.winner) {
              clearInterval(updateInterval);
              this.stats &&
                this.stats.onMatchEnd(this.winner, this.currentFrame * this.updateFrequency);
              Promise.all([
                sleep(250),
                this.leftController && this.leftController.onMatchEnd(this.winner === 'left'),
                this.rightController && this.rightController.onMatchEnd(this.winner === 'right'),
              ]).then(() => resolve(this.winner));
            }
          });
      }, this.updateFrequency);
    });
  }
}
