
/**
 * Module dependencies.
 */

 /*
l.info("info");
l.debug("Debug");
l.trace('Trace');
l.warn('Warn');
l.error('Error');
l.fatal('Fatal');
*/
var log4js = require('log4js');
var WebSocketServer = require('ws').Server;

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var l = log4js.getLogger('robot');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  l.info('Express server listening on port ' + app.get('port'));
});




/* ------------------------------ */
// CONTROLS / SOCKET
/* ------------------------------ */
var wss = new WebSocketServer({port: 7000});

wss.on('connection', function(ws) {
	l.info("socket connection: ".data, ws.upgradeReq.headers); // output a status

	// when a new message comes over the socket, handle it appropriately
    ws.on('message', function(message) {
        var message = JSON.parse(message);
        l.log("message", message);
        if(message.type !== undefined){
        switch (message.type){
            case "status":
                handleStatusMessage(ws, message);
                break;
            case "control":
                handeControlMessage(ws, message);
                break;
            }
        }else{
            l.warn("WARN: unrecognized socket message : ", message);
        }
    });

    ws.on('close', function(message) {
        var message = JSON.parse(message);
        l.error("socket disconnected");
    });

});


// messages with type: "control" get routed here
// control messages are created by human operators
// and sent to the robot
function handeControlMessage(ws, o){
	l.log("CONTROL: ", o.action);
	/* 	LOOP OVER ACTION OBJECT 
		handle multiple controls here
	   	{ action: { mast: 'up' } }
	   	{ action: { move: {angle: 55, thrust: 20}, look: {pan: 30, tilt: 40} } }
	*/
	for(var k in o.action){
		if(k == "mast"){
			l.warn(" action: ", o.action[k]);
			if(o.action[k] == 'up'){
				startMove('up', 1, 500);
			}
			if(o.action[k] == 'down'){
				startMove('down', 1, 300);
			}
		}
	}

}



/* ------------------------------ */
// MAST CONTROLS
/* ------------------------------ */

var five = require("johnny-five"),
  board, sensor;

// global-scope variables
var current_step = 0;         // counter
var current_direction = 0;    // 0 is up, 1 is down
var last_reverse_time = null; // dont reverse for at least a second
var bottom_limit_current_step = null; // step of the bottom limit
var top_limit_current_step = null; // step of the top limit
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
        bottom_limit_current_step = current_step;
        l.info("BOTTOM LIMIT ", bottom_limit_current_step);
        bottom_limit = true;
      }else{
        bottom_limit = false;
      }
    });
    limitTop.on("data", function() {
      if(this.value > 1000){
        top_limit_current_step = current_step;
        l.info("TOP LIMIT ", top_limit_current_step);
        top_limit = true;
      }else{
        top_limit = false;
      }
    });


});



// kick this off to find the limits
function findLimits(){
  l.info("findLimits()");
  finding_limits = true;

  // are we at the top or bottom already?
  if(atLimit()){
    if(bottom_limit){
      l.info("findLimits() at bottom limit, moving up");
      startMove('up', 1, 3000);
    }
    if(top_limit){
      l.info("findLimits() at top limit, moving down");
      startMove('down', 1, 3000);
    }
  }else{
  // we're not at the top or bottom, start moving and see what happens
    l.info("findLimits() someplace in the middle, moving down");
    startMove('down', 1, 3000); // arbitrarily pick down first

  }

}


function reverseDirection(){
  // l.debug("reverseDirection current_direction "+ current_direction);
  if(+new Date() - last_reverse_time > 1000){ // wait at least 1 second before reversing
    current_direction = current_direction === 0 ? 1 : 0; // reverse
    // console.log(" new direction current_direction "+ current_direction);
    board.digitalWrite(DIR_PIN, current_direction);
    last_reverse_time = new Date();
  }
}
    



/*
dir : "up" or "down"
speed : 1 - 20. 1 is fastest (least delay)
num_steps : how far. 1000 steps = 70mm
*/
function startMove(dir, speed, num_steps){
  // do some sanity checks. if we're at the limit, make sure we're going in the other direction
  // or if we're finding our limits, it's ok to hit our limit because we'll reverse
  // or if we're not at a limit, all good
  if( (top_limit && dir == 'down') || (bottom_limit && dir == 'up') || !atLimit() || finding_limits){
    // good to go
    // console.log(+new Date(), "startMove. dir: "+ dir+ " speed: "+speed+" num_steps: "+num_steps);
    l.debug("startMove. dir: "+ dir+ " speed: "+speed+" num_steps: "+num_steps);
    speed = speed || 10;
    steps = num_steps; // set the global variable
    current_step = 0;
    current_direction = dir == 'up' ? 0 : 1;
    board.digitalWrite(DIR_PIN, current_direction);
    oneStep(speed, num_steps);
  }else{
    l.warn("StartMove, but at limit. Doing nothing. top_limit ", top_limit, " bottom_limit ", bottom_limit, " dir ", dir);
  }
  
}



// fire one coil and then the next
function oneStep(speed, num_steps){
  // console.log(+new Date(), "oneStep. speed: "+speed);
  if(atLimit() && finding_limits){
    // l.debug("oneStep. atLimit? ", atLimit(), " finding_limits? ", finding_limits);
    reverseDirection();
  }

  if(atLimit()){
    // console.log("atLimit, checking...");
    if((top_limit && current_direction == 1) || (bottom_limit && current_direction == 0) || finding_limits){
      // console.log("atLimit, but we're ok to move");
      // we're ok
      board.digitalWrite(STEP_PIN, board.firmata.LOW);
      setTimeout(twoStep, speed, speed, num_steps);
    }
  }else{
    // we're ok
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
    l.warn("exited after "+current_step+" steps");
    current_step = 0;
    // process.exit();
    return true; // this stop us
  }else{
    if(finding_limits){
      // handle how to shut down the finding_limits routine
      if(bottom_limit_current_step && top_limit_current_step){
        finding_limits = false;
        l.warn("Finding limits complete. stopping");
        console.log("top: ",top_limit_current_step, " bottom: ", bottom_limit_current_step);
        var distance = top_limit_current_step - bottom_limit_current_step;
        var half = Math.floor(distance/2);
        console.log("distance: ", distance);
        console.log("half: ", half);
        var dir = current_direction === 1 ? 'up' : 'down'; // good idea?
        setTimeout(startMove, 500, dir, 1, half);
        return true;
      }
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
    // console.log(+new Date(), "at Limit: "+value);
    value = true;
  }else{
    value = false;
  }
  return value;
}


