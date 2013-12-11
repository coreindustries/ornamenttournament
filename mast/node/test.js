var arduino = require('duino');

var board = new arduino.Board({
  debug: false
});

var led = new arduino.Led({
  board: board,
  pin: 3
});




var current_step = 0;	// counter
var DIR_PIN = 2;
var STEP_PIN = 3;


board.pinMode(DIR_PIN, 'out');
board.pinMode(STEP_PIN, 'out');




board.on('ready', function(){
	board.log("READY", board.HIGH, board.digitalWrite);
	// console.log("DATE? ", +new Date(), new Date());
	// led.blink(1);			// WORKS!
	// board.digitalWrite(DIR_PIN, board.LOW);

	startMove('up', 1, 3000);
});


board.on('data', function(m){
	board.log(' data: '+m);
});


/*
dir : "up" or "down"
speed : 0 - 1
num_steps : how far
*/
function startMove(dir, speed, num_steps){
	console.log(+new Date(), "startMove. dir: "+ dir+ " speed: "+speed+" num_steps: "+num_steps);
	speed = speed || 10;
	steps = num_steps; // set the global variable
	current_step = 0;
	var direction = dir == 'up' ? board.LOW : board.HIGH;
	board.digitalWrite(DIR_PIN, direction);
	oneStep(speed, num_steps);
}


function oneStep(speed, num_steps){
	console.log(+new Date(), "oneStep. speed: "+speed);
	board.digitalWrite(STEP_PIN, board.LOW);
	setTimeout(twoStep, speed, speed, num_steps);
}

function twoStep(speed, num_steps){
	console.log(+new Date(), "twoStep: "+num_steps);
	board.digitalWrite(STEP_PIN, board.HIGH);
	// stop me if I've gone too far
	++current_step;
	if(current_step == num_steps){
		console.log(+new Date(), "exited after "+current_step+" steps");
		current_step = 0;
		return true;
	}else{
		oneStep(speed, num_steps);
	}
	
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





