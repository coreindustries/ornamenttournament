var five = require("johnny-five"),
  board, sensor;

// global-scope variables
var current_step = 0; // counter
var DIR_PIN = 2;
var STEP_PIN = 3;
var safe_to_move  = false; // flag for limit switches
var bottom_limit  = false; // flag for bottom limit
var top_limit     = false; // flag for top limit

board = new five.Board();

board.on("ready", function() {

    // Create a new `sensor` hardware instance.
    limitBottom = new five.Sensor({
      pin: "A5",
      freq: 250
    });

    limitTop = new five.Sensor({
      pin: "A4",
      freq: 250
    });

    // Inject the `sensor` hardware into the Repl
    board.repl.inject({
      sensor: sensor
    });

    // let's kick this off
    startMove('up', 2, 10000);


    limitBottom.on("data", function() {
      if(this.value > 1000){
        console.log(+new Date(), "BOTTOM LIMIT");
        bottom_limit = true;
      }else{
        bottom_limit = false;
      }
      // console.log("Bottom value: "+bottom_limit);
    });
    limitTop.on("data", function() {
      if(this.value > 1000){
        console.log(+new Date(), "TOP LIMIT");
        top_limit = true;
      }else{
        top_limit = false;
      }
      // console.log("Top value: "+top_limit);
    });


});


    



/*
dir : "up" or "down"
speed : 0 - 1
num_steps : how far. 1000 steps = 70mm
*/
function startMove(dir, speed, num_steps){
  // console.log("START, BOARD? ",board);
  if(!atLimit()){
    console.log(+new Date(), "startMove. dir: "+ dir+ " speed: "+speed+" num_steps: "+num_steps);
    speed = speed || 10;
    steps = num_steps; // set the global variable
    current_step = 0;
    var direction = dir == 'up' ? 0 : 1;
    board.digitalWrite(DIR_PIN, direction);
    oneStep(speed, num_steps);
  }else{
    console.log("StartMove, but at limit. Doing nothing");
  }
  
}



// fire one coil and then the next
function oneStep(speed, num_steps){
  // console.log(+new Date(), "oneStep. speed: "+speed);
  if(!atLimit()){
    board.digitalWrite(STEP_PIN, board.firmata.LOW);
    setTimeout(twoStep, speed, speed, num_steps);
  }
}



// fire second coil
function twoStep(speed, num_steps){
  // console.log(+new Date(), "twoStep: "+num_steps);
  board.digitalWrite(STEP_PIN, board.firmata.HIGH);
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


/**
* Are we currently at the bottom or top limit?
*
*/
function atLimit(){
  if(bottom_limit === true || top_limit === true){
    value = true;
  }else{
    value = false;
  }
  console.log(+new Date(), "at Limit: "+value);
  return value;
}

