/*
after server is running, connect webcam like this:

sudo ffmpeg -s 640x480 -f video4linux2 -i /dev/video0 -f mpeg1video -b 800k -r 30 http://127.0.0.1:8082/s3cret/640/480/
ERROR sudo avconv -s 640x480 -f video4linux2 -i /dev/video0 -f mpeg1video -b 800k -r 30 http://127.0.0.1:8082/s3cret/640/480/
sudo ffmpeg -s 1280x960 -f video4linux2 -i /dev/video0 -f mpeg1video -b 800k -r 30 http://127.0.0.1:8082/s3cret/1280/960/
sudo ffmpeg -s 1280x960 -f video4linux2 -i /dev/video0 -f mpeg1video -b 1500k -r 30 http://127.0.0.1:8082/s3cret/1280/960/

** sudo ffmpeg -s 1280x720 -f video4linux2 -i /dev/video0 -f mpeg1video -b 3500k -r 30 http://127.0.0.1:8082/s3cret/1280/720/
*/
var STREAM_PORT = 8082,
	STREAM_SECRET = 's3cret', // CHANGE THIS!
	WEBSOCKET_PORT = 8084,
	STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

var clients = {};
var width = 320,
	height = 240;

// Websocket Server
var socketServer = new (require('ws').Server)({port: WEBSOCKET_PORT});
var _uniqueClientId = 1;

var socketError = function() { /* ignore */ };
socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);
	socket.send(streamHeader, {binary:true}, socketError);

	// Remember client in 'clients' object
	var clientId = _uniqueClientId++;
	clients[clientId] = socket;
	console.log(
		'WebSocket Connect: client #' + clientId + 
		' ('+Object.keys(clients).length+' total)'
	);

	// Delete on close
	socket.on('close', function(code, message){
		delete clients[clientId];
		console.log(
			'WebSocket Disconnect: client #' + clientId +
			' ('+Object.keys(clients).length+' total)'
		);
	});
});


// HTTP Server to accept incomming MPEG Stream
var streamServer = require('http').createServer( function(request, response) {
	var params = request.url.substr(1).split('/');
	width = (params[1] || 320)|0;
	height = (params[2] || 240)|0;

	if( params[0] == STREAM_SECRET ) {
		console.log(
			'Stream Connected: ' + request.socket.remoteAddress + 
			':' + request.socket.remotePort + ' size: ' + width + 'x' + height
		);
		request.on('data', function(data){
			for( c in clients ) {
				clients[c].send(data, {binary:true}, socketError);
			}
		});
	}
	else {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress + 
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}
}).listen(STREAM_PORT);

console.log('Listening for MPEG Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>/<width>/<height>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
