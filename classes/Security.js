// Load the configuration
var config = require('../config.js');

// Load our requirements
var Logger = require('../classes/Logger.js');

var Security = {};

/**
 * Check if the current user is root
 */
Security.isRoot = function() {
	// Get UID, and GID
    var uid = process.getuid();
    var gid = process.getgid();

	Logger.log('INFO', 'Currently running with UID ' + uid + ' and GID ' + gid);

	// Root is always UID 0
	if( uid===0 ) {
		return true;
	}

	return false;
};

/**
 * Move to a chroot jail
 */
Security.jail =	function() {
	Logger.log('INFO', 'Would love to move to a chroot jail at "' + config.security.jailPath + '", but someone forgot to implement this feature.');
};

/**
 * Drop root privileges
 */
Security.dropRoot = function() {

	// Load config settings
	var uid = config.security.user;
	var gid = config.security.group;

	Logger.log('INFO', 'Trying to switch process UID to ' + uid + ' and GID to ' + gid);

	try {

		// Set the UID and GID
		process.setgid(gid); // (Set GID before dropping root permissions)
		process.setuid(uid);

	} catch ( e ) {
		console.log('Failed to set UID and GID, please check logs and configuration.');
		throw( e );
	}
};

// Export the public methods that we want
module.exports = {

    /**
     * Initialize the security tools
     * @throws {Error}
     */
    initialize: function() {

        // If we are currently running as root, we have to do something about it
        if( Security.isRoot()===true ) {

	        // Switch to a chroot jail
	        Security.jail();

            // Drop root priviliges
            Security.dropRoot();

        // No root? Let's check that we can do what we need to do still...
        } else {

            // To bind to ports < 1024, we would need to be root
            if( config.server.port<1024 ) {
                throw new Error("Configured to bind to port " + config.server.port + ". Ports < 1024 require root, and we're not running as root");
            }

            Logger.log('INFO', "Not running as root, cannot drop privileges or chroot. Please consider running as root and dropping privileges to a separate user for increased security.");
        }
    }
};
