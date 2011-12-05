// Load our requirements
var Security = require('./classes/Security.js');
var Writer = require('./classes/Writer.js');
var Logger = require('./classes/Logger.js');
var Server = require('./classes/Server.js');
var config = require('./config.js');

// Start up
try {

	// Open our log files
	Logger.initialize();

	Logger.log('INFO', 'JSMongoSyslog starting up.');

	// Bind to our configured host & port
	Server.bind();

	Logger.log('INFO', 'All configured servers have successfully bound to addresses.');

	// Initialize writer
	Writer.initialize();

	Logger.log('INFO', 'Writer initialized.');

	// Do some security settings
	Security.initialize();

	Logger.log('INFO', 'Security settings loaded.');

	// Now start accepting connections
	Server.start();

	Logger.log('INFO', 'Servers accepting connections.');

} catch( e ) {
	var message = "Uncaught error: " + e;
	Logger.log('CRITICAL', message)
	console.log(message);

	// Rethrow for backtrace etc
	throw( e );
}
