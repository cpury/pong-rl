// Represents a single match. Updates and keeps the game state. Draws to a canvas.
class Match {
  constructor(options) {
    options = {
      paddleHeight: 0.25,
      canvasId: 'gameCanvas',

      // How often the game should be updated / redrawn
      updateFrequency: 20, // = 50 FPS
      // Only redraw every couple frames to improve performance
      drawFrequency: 2, // Every second update -> 25 FPS

      // How fast the paddles and the ball can move
      paddleSpeed: 1,
      ballSpeed: 0.8,

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
    };
    this.rightPaddle = {
      x: 0.98,
      y: 0.5,
      height: this.paddleHeight,
      width: 0.0375,
      forceY: 0,
      previousAction: null,
    };
    this.ball = {
      x: 0.5,
      y: 0.5,
      height: 0.05,
      width: 0.0375,
      forceX: 0,
      forceY: 0,
    };

    // Start the ball in a random direction.
    const forceX = 0.3 + Math.random() * 0.25;
    const forceY = 1.1 + Math.random() * 0.25;
    this.ball.forceX = (Math.random() > 0.5 ? 1 : -1) * forceX * this.ballSpeed;
    this.ball.forceY = (Math.random() > 0.5 ? 1 : -1) * forceY * this.ballSpeed;

    // Keep track of the last two game states
    this.currentState = this.getState();
    this.previousState = null;
    this.currentFrame = 0;
    this.winner = null;

    this.draw();
  }

  getState() {
    // Return the state of the game.
    return {
      ball: {
        x: this.ball.x,
        y: this.ball.y,
        forceX: this.ball.forceX,
        forceY: this.ball.forceY,
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

  checkCollision(leftOrRight) {
    // Check if the given side's paddle is colliding with the ball.
    // Pass 'left' or 'right' (since the logic is slightly different)
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

  moveObject(obj, timeFactor, isBall) {
    // Move the given object by its force, checking for collisions and potentially
    // updating the force values.
    if (obj.forceX) {
      obj.x += obj.forceX * timeFactor;

      // A ball should bounce off paddles
      const sideToCheck = obj.forceX > 0 ? 'right' : 'left';
      if (this.checkCollision(sideToCheck)) {
        obj.forceX = -obj.forceX;
      }
    }

    if (obj.forceY) {
      obj.y += obj.forceY * timeFactor;

      const radiusY = obj.height / 2;

      // When hitting a wall, a paddle stops, a ball bounces back:
      if (!isBall) {
        obj.y = Math.max(radiusY, Math.min(1 - radiusY, obj.y));
      } else if (obj.y < radiusY || obj.y > 1 - radiusY) {
        obj.forceY = -obj.forceY;
      }
    }
  }

  getWinner() {
    // Checks if one side one won and returns 'left' or 'right' if so.
    const ballWidth = this.ball.width / 2;
    const paddleWidth = this.leftPaddle.width / 2;

    if (this.ball.x - ballWidth < this.leftPaddle.x - paddleWidth) {
      return 'right';
    }
    if (this.ball.x + ballWidth > this.rightPaddle.x + paddleWidth) {
      return 'left';
    }
  }

  update() {
    // Moves objects, checks for collisions, etc.
    this.previousState = this.currentState;
    this.currentState = this.getState();

    // Check if match ended last frame:
    const winner = this.previousState && this.previousState.winner;
    if (winner) {
      this.winner = winner;
    } else {
      // TODO Ask for input based on current state
    }

    // Update each object:
    this.moveObject(this.leftPaddle, this.timeFactor);
    this.moveObject(this.rightPaddle, this.timeFactor);
    this.moveObject(this.ball, this.timeFactor, true);

    this.currentFrame += 1;
  }

  drawObject(obj) {
    // Given an object with coordinates and size, draw it to the canvas
    const width = obj.width * this.canvas.width;
    const height = obj.height * this.canvas.height;
    const x = obj.x * this.canvas.width - width / 2;
    const y = obj.y * this.canvas.height - height / 2;
    this.ctx.fillRect(x, y, width, height);
  }

  draw() {
    // Redraw the game based on the current state
    this.ctx.fillStyle = '#e5e5e6';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObject(this.ball);
    this.drawObject(this.leftPaddle);
    this.drawObject(this.rightPaddle);
  }

  updateAndDraw() {
    // Call periodically. Will update the state and draw every few frames
    this.update();
    if (this.currentFrame % this.drawFrequency === 0 || this.winner) this.draw();
  }

  start() {
    // Start or continue the game. Returns a promise that resolves
    return new Promise((resolve, reject) => {
      const updateInterval = setInterval(() => {
        let error = null;

        try {
          this.updateAndDraw();
        } catch (e) {
          error = e;
          console.error(error);
        }
        if (error || this.winner) {
          clearInterval(updateInterval);
          resolve(this.winner);
        }
      }, this.updateFrequency);
    });
  }
}
