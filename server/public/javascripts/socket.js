/*
Socket client set up. 
based on caniuse? this will work on desktop chrome, safari as well as iOS devices. perfect


TODO: wrap this up in an object to protect the namespace

*/



		var url = 'ws://192.168.150.25:7000';

		var connected = false;
		var reconnect; // interval for reconnection
		var reconnectAttempts = {
		    num: 0,
		    last_attempt: null
		};
		connect();

		$("#up").on("click", function(){
			send({
			"type": "control",
			"action" : {
				"mast": "up"
			}
			});
		});
		$("#down").on("click", function(){
			send({
			"type": "control",
			"action" : {
				"mast": "down"
			}
			});
		});

		 // connect to socket server

		function connect() {
		    window.socket = new WebSocket(window.url);
		    window.reconnectAttempts.num++;
		    window.reconnectAttempts.last_attempt = Date.now();
		    console.log("socket connect: ", window.reconnectAttempts, window.socket);


		    // when connection opens set up our status vars
		    socket.onopen = function() {
		        console.log('socket.onopen');
		        window.connected = true;
		        clearInterval(window.reconnect); // reset our reconnect interval

		        // send one to establish us as the human controller
		        send();
		    }

		    // when we get a message, do something
		    socket.onmessage = function(msg) {
		        var o = JSON.parse(msg.data);
		        console.log('socket.onmessage', o);

		        // if(o.latency > 0){
		        // 	$("#latency").text(o.latency+"ms");
		        // 	$("#battery").text(o.volts+"v");
		        // }
		        
		    }

		    // socket close event. if we lose the connection to the server, try to reconnect
		    socket.onclose = function() {
		        console.log('socket.onclose');
		        window.connected = false;
		        startReconnecting();
		    }

		}



		// send a message over the socket. used for testing right now
		function send(o) {
		    if (window.connected) {
		        if(o == undefined){
		        	o = {
			            type: "control",
			            hello: "welcome"
			        };
		        }
		        
		        console.log("send: ", o);
		        window.socket.send(JSON.stringify(o));
		    }

		}

		// after we lose a connection, kick off a reconnection sequence
		function startReconnecting() {
		    console.log("startReconnecting");
		    clearInterval(window.reconnect);
		    window.reconnect = setInterval(connect, 1000);
		}