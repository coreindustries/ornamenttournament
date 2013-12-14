var five = require("johnny-five"),
  board, sensor;

// global-scope variables
var current_step = 0;         // counter
var current_direction = 0;    // 0 is up, 1 is down
var last_reverse_time = null; // dont reverse for at least a second
var DIR_PIN = 2;
var STEP_PIN = 3;
var finding_limits  = false;  // flag for findLimits routine
var bottom_limit  = false;    // flag for bottom limit
var top_limit     = false;    // flag for top limit


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
    // startMove('down', 1, 10000);
    findLimits();


    // handle our top and bottom limits
    limitBottom.on("data", function() {
      if(this.value > 1000){
        console.log(+new Date(), "BOTTOM LIMIT");
        bottom_limit = true;
      }else{
        bottom_limit = false;
      }
    });
    limitTop.on("data", function() {
      if(this.value > 1000){
        console.log(+new Date(), "TOP LIMIT");
        top_limit = true;
      }else{
        top_limit = false;
      }
    });


});



// kick this off to find the limits
function findLimits(){
  console.log("findLimits()");
  finding_limits = true;

  // are we at the top or bottom already?
  if(atLimit()){
    if(bottom_limit){
      console.log("findLimits() at bottom limit, moving up");
      startMove('up', 1, 3000);
    }
    if(top_limit){
      console.log("findLimits() at top limit, moving down");
      startMove('down', 1, 3000);
    }
  }else{
  // we're not at the top or bottom, start moving and see what happens
    console.log("findLimits() someplace in the middle, moving down");
    startMove('down', 1, 3000); // arbitrarily pick down first

  }

}


function reverseDirection(){
  console.log(+new Date(), "reverseDirection current_direction "+ current_direction);
  
  if(+new Date() - last_reverse_time > 1000){ // wait at least 1 second before reversing
    current_direction = current_direction === 0 ? 1 : 0; // reverse
    console.log(" new direction current_direction "+ current_direction);
    board.digitalWrite(DIR_PIN, current_direction);
    last_reverse_time = new Date();
  }
}
    



/*
dir : "up" or "down"
speed : 0 - 1
num_steps : how far. 1000 steps = 70mm
*/
function startMove(dir, speed, num_steps){
  // console.log("START, BOARD? ",board);
  if(!atLimit() || finding_limits){
    console.log(+new Date(), "startMove. dir: "+ dir+ " speed: "+speed+" num_steps: "+num_steps);
    speed = speed || 10;
    steps = num_steps; // set the global variable
    current_step = 0;
    current_direction = dir == 'up' ? 0 : 1;
    board.digitalWrite(DIR_PIN, current_direction);
    oneStep(speed, num_steps);
  }else{
    console.log("StartMove, but at limit. Doing nothing");
  }
  
}



// fire one coil and then the next
function oneStep(speed, num_steps){
  // console.log(+new Date(), "oneStep. speed: "+speed);
  if(atLimit() && finding_limits){
    console.log(+new Date(), "oneStep. atLimit? ", atLimit(), " finding_limits? ", finding_limits);
    reverseDirection();
  }

  if(!atLimit() || finding_limits){   // IS THIS A GOOD IDEA
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
  if(current_step == num_steps && !finding_limits){       // don't stop if we're limit hunting
    console.log(+new Date(), "exited after "+current_step+" steps");
    current_step = 0;
    return true;
  }else{
    if(finding_limits){
      // console.log(" **twoStep finding_limits ", num_steps);
    }
    oneStep(speed, num_steps);
  }
}


/**
* Are we currently at the bottom or top limit?
*
*/
function atLimit(){
  if(bottom_limit || top_limit){
    console.log(+new Date(), "at Limit: "+value);
    value = true;
  }else{
    value = false;
  }
  return value;
}

