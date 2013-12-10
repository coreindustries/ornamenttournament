var arduino = require('duino');

var board = new arduino.Board({
  debug: true
});

var led = new arduino.Led({
  board: board,
  pin: 3
});

led.blink();