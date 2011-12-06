// Load the configuration
var config = require('../config.js');

// Load our requirements
var daemon = require('daemon');
var fs = require('fs');
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

	// Check that we have a jail path
	if( !config.security.jailPath ) {
		Logger.log('INFO', 'Would move to a chroot jail, but none is configured.');
	} else {

		// Get the stat for the path we're configured for, sync because we want to finish before dropping root
		var message;
		try {
			var stats = fs.lstatSync(config.security.jailPath);
		} catch( e ) {
			if( e.code==='ENOENT' ) {
				message = 'Configured to chroot to "' + config.security.jailPath + '", but it does not exist.';
				Logger.log('CRITICAL', message);
				throw new Error(message);
			} else {
				throw new Error('Unknown error while checking chroot directory "' + JSON.stringify(e) + '".');
			}
		}

		// Check that it's a directory
		if( !stats.isDirectory() ) {
			message = 'Configured to chroot to "' + config.security.jailPath + '", but it does not seem to be a directory.';
			Logger.log('CRITICAL', message);
			throw new Error(message);

		// Can't think of anything else that could be wrong, maybe everything is fine
		} else {
			// Just chroot into it
			try {
				daemon.chroot(config.security.jailPath);

				Logger.log('INFO', 'Successfully switched to chroot jail "' + config.security.jailPath + '"')

			} catch (e) {
				message = 'Error while trying to chroot to "' + config.security.jailPath + '", please check root jail: ' + e.toString();
				Logger.log('CRITICAL', message);
				throw new Error(message);
			}
		}
	}

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
		Logger.log('CRITICAL', 'Failed to set UID and GID, please check logs and configuration.');
		throw( e );
	}

	// Double-check can't hurt, can it?
	if( Security.isRoot()===true ) {
		var message = 'Somehow failed to drop root privileges, but no errors occurred. Quite odd ...  isn\'t it?';
		Logger.log('CRITICAL', message);
		throw new Error(message);
	}
};

// Export the public methods that we want
module.exports = {

    /**
     * Initialize the security tools
     * @throws {Error}
     */
    initialize: function() {
		// TODO: Redesign as asynchronous, shouldn't take too much of effort

        // If we are currently running as root, we have to do something about it
        if( Security.isRoot()===true ) {

	        // Switch to a chroot jail
	        Security.jail();

            // Drop root privileges
            Security.dropRoot();

        // No root? Let's check that we can do what we need to do still...
        } else {

            // To bind to ports < 1024, we would need to be root
            if( config.server.port<1024 ) {
                throw new Error("Configured to bind to port " + config.server.port + ". Ports < 1024 require root, and we're not running as root");
            }

            Logger.log('WARNING', "Not running as root, cannot drop privileges or chroot. Please consider running as root and configuring to run as a unique user for increased security.");
        }
    }
};
