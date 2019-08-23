# pong-rl

Reinforcement Learning with Pong in the browser via TensorFlow.js by @cpury 🚀

**Demo: https://cpury.github.io/pong-rl/**

**With the default options, watch it learn the game in ~10 minutes!**

Blog post coming soon 📝

Color scheme: https://coolors.co/3a3c3f-e5e5e6-f06543-2ec0f9-e7e247

<p align="center">
  <img width="320" height="568" src="https://github.com/cpury/pong-rl/blob/master/screenshot.png?raw=true">
</p>

## Details

Implements a Pong-like game as well as a controller interface to add arbitrary controllers to the game.

### Available controllers:

- `KeyController` to controll via keyboard
- `DumbController` a simple controller that just follows the ball with some hiccups
- `DQLController` a first Deep-Q-Learning controller that learns on hard-coded features (position of the ball, force of the ball and positions of the paddles).
- `VisualDQLController` Deep-Q-Learning directly on the pixels. **SLOW!**

### Other features:

- Three difficulty levels
- Live mode: When disabled, learning happens without drawing or waiting for user

### Technologies used:

- [TensorFlow.js](https://www.tensorflow.org/js/) for neural networks
- [Bulma](https://bulma.io/) as CSS framework
- [Parcel.js](https://parceljs.org/) for bundling

## Running locally

First, install dependencies:

```sh
npm install
```

To run in hot module reloading mode:

```sh
npm start
```

To create a production build:

```sh
npm run build-prod
```

## Contributing controllers

Contributions welcome! If you'd like to add a new controller, add a new class that inherits from `BaseController` and create a pull request.
