var five = require("johnny-five"),
  board, sensor;

// global-scope variables
var current_step = 0; // counter
var DIR_PIN = 2;
var STEP_PIN = 3;


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

    // console.log("firmata? LOW", board.firmata.LOW);
    // console.log("firmata? HIGH", board.firmata.HIGH);

    startMove('down', 1, 3000);


    limitBottom.on("data", function() {
      // console.log("Bottom: ",this.value, this.raw);
      if(this.value > 1000){
        console.log(+new Date(), "BOTTOM LIMIT");
      }
    });
    limitTop.on("data", function() {
      // console.log("Top: ",this.value, this.raw);
      if(this.value > 1000){
        console.log(+new Date(), "TOP LIMIT");
      }
    });


});


    



    /*
    dir : "up" or "down"
    speed : 0 - 1
    num_steps : how far. 1000 steps = 70mm
    */
    function startMove(dir, speed, num_steps){
      // console.log("START, BOARD? ",board);
      console.log(+new Date(), "startMove. dir: "+ dir+ " speed: "+speed+" num_steps: "+num_steps);
      speed = speed || 10;
      steps = num_steps; // set the global variable
      current_step = 0;
      var direction = dir == 'up' ? 0 : 1;
      board.digitalWrite(DIR_PIN, direction);
      oneStep(speed, num_steps);
    }


    // fire one coil and then the next
    function oneStep(speed, num_steps){
      // console.log(+new Date(), "oneStep. speed: "+speed);
      board.digitalWrite(STEP_PIN, board.firmata.LOW);
      setTimeout(twoStep, speed, speed, num_steps);
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

