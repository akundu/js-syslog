/*
 * Application configuration
 */
var config = {

	/* Security settings */
    security: {

        // UID or name of the user to run as, it is recommended that you create a new user for this
        user: 'nobody',

        // GID or name of the group to run as, it is recommended that you create a new user for this
        group: 'nogroup',

	    // Path to chroot to, if possible ... null to disable chroot (not recommended)
	    jailPath: '/var/empty'
    },

	/* Servers */
    servers: {

	    /* Normal Syslog protocol */
	    syslog: {

	        // IP address to listen to
	        // null or '0.0.0.0' to listen to all interfaces
	        listenIP: '0.0.0.0',

	        // What port to listen to
	        port: 514,

		    // What Unix sockets to listen to ...
		    // On linux, /dev/log is the typical Syslog socket
		    sockets: ['/dev/log']
	    },

	    /* JS-Syslog relay protocol */
	    relay: {

		    // IP address to listen to
			// null or '0.0.0.0' to listen to all interfaces
			listenIP: '127.0.0.1',

			// What port to listen to
			port: 5140
	    }

    },

	/* Writers, where to save the logs */
	writers: [

		// This is a list of destinations to write to
		// Each item should be an object with:
		// - type: file | relay | mongodb
		// - destination: for files, full path to log file, host:port for relay and mongodb
		// - filters: what messages go here, e.g. auth.*, '*' for everything
		// - database: MONGO ONLY - The name of the database
		// - collection: MONGO ONLY - The name of the collection

		{type: 'file', destination: '/var/log/test.log', filters: ['*']},

		{type: 'mongodb', destination: 'localhost', filters: ['*'], database: 'logs', collection: 'logs'}

		// To set up relaying, uncomment and edit the line below
		//, {type: 'relay', destination: '192.168.1.1:5140', filters: ['*']}
	],

	/* Logging settings */
	log: {

		// What to log and where, each log level (DEBUG, INFO, WARNING, ERROR, CRITICAL) can have their own array of destinations
		// Use an empty array to discard immediately
		// Special keywords 'STDOUT' and 'STDERR' work as one could expect from such special keywords

		'DEBUG': ['app.log', 'STDOUT'],
		'INFO': ['app.log', 'STDOUT'],
		'WARNING': ['app.log', 'STDOUT'],
		'ERROR': ['app.log', 'STDERR'],
		'CRITICAL': ['app.log', 'STDERR']

	}
};

// Export the config
module.exports = config;
