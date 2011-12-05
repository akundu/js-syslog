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
		(function(socketPath) {

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
					Logger.log('DEBUG', 'Received data from socket "' + socketPath + '": ' + data);

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
				Logger.log('INFO', 'Syslog Unix socket connection for "' + socketPath + '" closed.');
			});

			// Set up an error handler
			server.on('error', function(error) {
				Logger.log('ERROR', 'Syslog Unix socket listener for "' + socketPath + '" caught an error: ' + error);
			});

			// Connect to the socket
			server.listen(socketPath, function() {
				Logger.log('INFO', 'Syslog Unix socket for "' + socketPath + '" listening.');
			});
		})(socketPath);
	}
};

/**
 * Set up the syslog listener
 */
Server.setUpSyslogUDPListener = function() {

	// Create a UDP server
	var server = dgram.createSocket("udp4");

	var identifier = null;

	server.on("message", function(message, requestInfo) {
		// When was this message received?
		var received = Utils.getTime();

		// TODO: Push to a queue and process after dropping privileges
		// Ignore if we shouldn't accept connections yet
		if( Server.acceptConnections!==true ) {
			return;
		}

		Logger.log('DEBUG', 'Received data to UDP "' + identifier + '": ' + data);

		// Parse data from the string to a more useful format
		var parsed = glossyParser.parse(data);

		// Add the time received
		parsed.received = received;

		// Write parsed data
		Writer.write(parsed);

	});

	// Run once the server is bound and listening
	server.on("listening", function() {
		// Get the server's address information
		var addressInfo = server.address();

		// Update identifier, so it can be used for logging
		identifier = addressInfo.address + ':' + addressInfo.port;

		Logger.log('INFO', 'Syslog UDP server is listening to ' + identifier);
	});

	// If the syslog server socket is closed
	server.on("close", function() {
		Logger.log('INFO', 'Syslog UDP server socket closed');
	});

	// If the server catches an error
	server.on("error", function(exception) {
		Logger.log('ERROR', 'Syslog UDP server caught exception: ' + exception);
	});

	// Next, we bind to the syslog port

	// If there is a listen IP, also give that to bind
	if( config.servers.syslog.listenIP && config.servers.syslog.listenIP!=='0.0.0.0' ) {
		server.bind( config.servers.syslog.port, config.servers.syslog.listenIP );

	// Otherwise, bind to all interfaces
	} else {
		server.bind( config.servers.syslog.port );
	}
};

/**
 * Set up a relay listener
 */
Server.setUpJSSyslogRelayListener = function() {
	// TODO: Implement me
};

module.exports = {

	/**
	 * Bind all servers to their ports
	 */
	bind: function() {

		// And the syslog Unix sockets, if needed
		Server.setUpSyslogUnixSockets();

		// Set up the syslog UDP listener, if needed
		Server.setUpSyslogUDPListener();

		// And a listener for relayed JS-Syslog data
		Server.setUpJSSyslogRelayListener();
	},

	/**
	 * Start accepting connections, call this once extra privileges have been dropped etc. security precautions are in effect
	 */
	start: function() {
		// Tell the servers it's ok to start accepting connections
		Server.acceptConnections = true;

		Logger.log('INFO', 'Servers now accepting connections');
	}
};