var arduino = require('duino');

var board = new arduino.Board({
  debug: false
});

var led = new arduino.Led({
  board: board,
  pin: 3
});




var DIR_PIN = 2;
var STEP_PIN = 3;


board.pinMode(DIR_PIN, 'out');
board.pinMode(STEP_PIN, 'out');


board.on('ready', function(){
	board.log("READY", board.HIGH, board.digitalWrite);

	// console.log("DATE? ", +new Date(), new Date());

	// led.blink(1);			// WORKS!

	board.digitalWrite(DIR_PIN, board.LOW);




	for(var i=0; i<500; i++){
		oneStep();
		// oneStep();
		// board.digitalWrite(STEP_PIN, 0);
		// board.delay(100);
		// board.digitalWrite(STEP_PIN, 255);
		// board.delay(100);
	}
	

});

board.on('data', function(m){
	board.log(' data: '+m);
});


function oneStep(speed){
	speed = speed || 100;
	console.log("oneStep. speed: "+speed);
	board.digitalWrite(STEP_PIN, 0);
	setTimeout(board.digitalWrite(STEP_PIN, 255), speed);
}


function rotateDeg(deg, speed){
	board.log("rotateDegree ", deg, speed);
  //rotate a specific number of degrees (negitive for reverse movement)
  //speed is any number from .01 -> 1 with 1 being fastest - Slower is stronger
  var dir = (deg > 0)? board.HIGH : board.LOW;
  board.digitalWrite(DIR_PIN, dir);

  var steps = Math.abs(deg)*(1/0.225);
  var usDelay = (1/speed) * 70;

  for(var i=0; i < steps; i++){
	board.digitalWrite(STEP_PIN, board.HIGH);
	board.delay(usDelay);

	board.digitalWrite(STEP_PIN, board.LOW);
	board.delay(usDelay);
  }
}



function rotate(steps, speed){
  //rotate a specific number of microsteps (8 microsteps per step) - (negitive for reverse movement)
  //speed is any number from .01 -> 1 with 1 being fastest - Slower is stronger
  var dir = (steps > 0)? board.HIGH : board.LOW;
  steps = Math.abs(steps);

  board.digitalWrite(DIR_PIN, dir);

  var usDelay = (1/speed) * 70;

  for(var i=0; i < steps; i++){
    board.digitalWrite(STEP_PIN, board.HIGH);
    board.delay(usDelay);

    board.digitalWrite(STEP_PIN, board.LOW);
    board.delay(usDelay);
  }
}





