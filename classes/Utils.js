var Utils = function() {
	/**
	 * Left-pad a string with something up to a certain length
	 * @param string The string to pad
	 * @param padWith The string to pad with
	 * @param padLength The length to pad until
	 */
	this.leftPad = function( string, padWith, padLength ) {

		// Loop until the string is long enough
	    while(string.length < padLength) {
		    // Prepend it with the padWith string
		    string = padWith + string;
	    }

		// Return result
	    return string;
	};

	/**
	 * Right-pad a string with something up to a certain length
	 * @param string The string to pad
	 * @param padWith The string to pad with
	 * @param padLength The length to pad until
	 */
	this.rightPad = function( string, padWith, padLength ) {

		// Loop until the string is long enough
	    while(string.length < padLength) {
		    // Append the padWith string
		    string = string + padWith;
	    }

		// Return result
	    return string;
	};

	/**
	 * Get the current timestamp
	 */
	this.getTime = function() {
		return this.rightPad( String((new Date().getTime()) / 1000), "0", 14);
	}

};

// Instancify the Utils to exports
module.exports = new Utils();