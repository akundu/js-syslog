// Load the configuration
var config = require('../config.js');

// And our requirements
var Logger = require('../classes/Logger.js'); // Internal logger
var Writer = require('../classes/Writer.js'); // Log writer
var dgram = require('dgram'); // UDP / Datagram Sockets
var net = require('net'); // And general networking
var glossyParser = require('glossy').Parse; // Glossy = Syslog message parser
var Utils = require('../classes/Utils.js');

// Server class
var Server = {
	// If it's ok to accept connections at the moment
	acceptConnections: false
};

/**
 * Set up any Unix sockets we should listen to
 */
Server.setUpSyslogUnixSockets = function() {

	// Loop through any sockets we should listen to
	for( var i=0, count=config.servers.syslog.sockets.length; i<count; ++i ) {

		// Get the socket path
		var socketPath = config.servers.syslog.sockets[i];

		// Create a new closure so we can store the path in it
		(function() {
			var path = socketPath;

			// Create a new socket
			var server = new net.createServer();

			// On connect listener
			server.on('connection', function(socket) {
				// When was this message received?
				var received = Utils.getTime();

				// TODO: Push to a queue and process after dropping privileges
				// Ignore if we shouldn't accept connections yet
				if( Server.acceptConnections!==true ) {
					return;
				}

				// Create a function to read the data from the socket
				socket.on('data', function(data) {
					Logger.log('DEBUG', 'Received data from socket "' + path + '": ' + data);

					// Parse data from the string to a more useful format
					var parsed = glossyParser.parse(data);

					// Add the time received
					parsed.received = received;

					// Write parsed data
					Writer.write(parsed);
				});

			});

			// On closing listener
			server.on('close', function() {
				Logger.log('INFO', 'Syslog Unix socket connection for "' + path + '" closed.');
			});

			// Set up an error handler
			server.on('error', function(error) {
				Logger.log('ERROR', 'Syslog Unix socket listener for "' + path + '" caught an error: ' + error);
			});

			// Connect to the socket
			server.listen(socketPath, function() {
				Logger.log('INFO', 'Syslog Unix socket for "' + path + '" listening.');
			});
		})();
	}
};

/**
 * Set up the syslog listener
 */
Server.setUpSyslogUDPListener = function() {

	// Create a UDP server
	var server = dgram.createSocket("udp4");


	var firstRequest = null;
	var requestCount = 0;

	server.on("message", function(message, requestInfo) {
		// TODO: Push to a queue and process after dropping privileges
		// Ignore if we shouldn't accept connections yet
		if( Server.acceptConnections!==true ) {
			return;
		}

		++requestCount;
		var time = new Date().getTime();
		if( !firstRequest ) {
			firstRequest = time;
		} else if ( requestCount%5000 === 0 ) {
			var elapsedTime = (time - firstRequest) / 1000;
			var reqPerSec = requestCount / elapsedTime;

			console.log( "Elapsed time: " + elapsedTime + " seconds" );
			console.log( "Requests: " + requestCount );
			console.log( "Req/s: " + reqPerSec );
			console.log( "" );
		}
	});

	// Run once the server is bound and listening
	server.on("listening", function() {
		var addressInfo = server.address();

		Logger.log('INFO', 'Syslog UDP server is listening to ' + addressInfo.address + ':' + addressInfo.port);
	});

	// If the syslog server socket is closed
	server.on("close", function() {
		Logger.log('INFO', 'Syslog UDP server socket closed');
	});

	// If the server catches an error
	server.on("error", function(exception) {
		Logger.log('ERROR', 'Syslog UDP server caught exception: ' + exception);
	});

	// Bind to the syslog port
	server.bind( config.servers.syslog.port );
};

/**
 * Set up a relay listener
 */
Server.setUpJSMongoSyslogRelayListener = function() {

};

module.exports = {
	bind: function() {

		// And the syslog Unix sockets, if needed
		Server.setUpSyslogUnixSockets();

		// Set up the syslog UDP listener, if needed
		Server.setUpSyslogUDPListener();

		// And a listener for relayed JSMongoSyslog data
		Server.setUpJSMongoSyslogRelayListener();
	},

	start: function() {
		// Tell the servers it's ok to start accepting connections
		Server.acceptConnections = true;

		Logger.log('INFO', 'Servers now accepting connections');
	}
};