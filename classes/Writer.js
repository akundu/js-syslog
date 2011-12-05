// Load the configuration
var config = require('../config.js');

// And our requirements
var Logger = require('../classes/Logger.js'); // Internal logger
var mongodb = require('mongodb');
var fs = require('fs');

Writer = {};
// List of writers
Writer.writerFunctions = [];

// Separate host and port from destination
Writer.parseHostPort = function(destination, defaultPort) {
	// Find a colon
	var colon = destination.indexOf(':');

	// The host and port
	var host, port;

	// If found
	if( colon!==-1 ) {

		// Host is before the colon, port after it
		host = destination.substr(0, colon);
		port = destination.substr(colon + 1);

	// If not found
	} else {
		// Host is the whole destination, port is the default
		host = destination;
		port = defaultPort;
	}

	// Return
	return {
		host: host,
		port: port
	};
};

// Determine whether this data matches the given filters or not
Writer.filter = function(data, filters) {
	// If no filters, can never match
	if( filters.length===0 ) {
		return false;
	}

	// Loop through the filters
	for( var i=0, count=filters.length; i<count; ++i ) {
		// Get the current filter
		var filter = filters[i];

		// If the filter is *, automatically allow all
		if( filter==='*' ) {
			return true;
		}

		// TODO: Implement the rest of the filtering
	}
};

// Initialize the writer
Writer.initialize = function() {
	// Loop through all destinations
	for( var i=0, count=config.writers.length; i<count; ++i ) {
		var writer = config.writers[i];

		switch( writer.type ) {
			case 'file':
				// Create a new writer function in a new scope
				Writer.writerFunctions.push((function(){

					var writerConfig = writer;

					// {type: 'file', destination: '/var/log/test.log', filters: ['*']},
					var stream = fs.createWriteStream(writerConfig.destination, {
						flags: 'a',
						mode: 0600,
						encoding: 'utf8'
					});

					// Format the data to output in file
					var fileFormatter = function(data) {
						// TODO: Implement proper formatting
						return data.received + ' ' + data.facility + '.' + data.severity + ': ' + data.message + "\n";
					};

					// The actual writer function
					return function(data) {
						if( Writer.filter(data, writerConfig.filters) ) {
							// Pass data through formatting and write to stream
							stream.write( fileFormatter(data) );
						}
					}
				})());
				break;

			case 'relay':
				// Create a new writer function in a new scope
				Writer.writerFunctions.push((function(){

					// TODO: Create the relay sending function

					var writerConfig = writer;

					// The actual writer function
					return function(data) {
						Logger.log('DEBUG', 'Would write data to relay, but someone forgot to implement it: ' + JSON.stringify(data));
					}
				})());
				break;

			case 'mongodb':
				// Create a new writer function in a new scope
				Writer.writerFunctions.push((function(){

					var writerConfig = writer;

					// Parse Host & Port from the destination
					var hostPort = Writer.parseHostPort(writerConfig.destination, 27017);

					// Connect to the mongodb server
					var client = new mongodb.Db(writerConfig.database, new mongodb.Server(hostPort.host, hostPort.port, {}));

					// Handle to the collection
					var collectionHandle = null;

					// Run this once the collection is opened
					var onCollectionOpen = function(error, collection) {
						collectionHandle = collection;
					};

					// Wait for connection to open
					client.open(function(error, p_client) {
						client.collection(writerConfig.collection, onCollectionOpen)
					});

					var identifier = writerConfig.destination + ':/' + writerConfig.database + '/' + writerConfig.collection;

					// The actual writer function
					return function(data) {
						// Make sure we're connected to the collection
						if( collectionHandle!==null ) {

							// Then insert the data
							collectionHandle.insert(data, function(error, documents) {
								// Documents = list of inserted documents
								if( error!==null ) {
									Logger.log('ERROR', 'Caught an error while inserting to mongodb at ' + identifier + ': ' + JSON.stringify(error));
									console.log(error);
								}
							});
						}
					}
				})());
				break;
		}
	}
};


// Export the functions we want to expose
module.exports = {
	/**
	 * Initialize the writer
	 */
	initialize: function() {
		Writer.initialize();
	},

	/**
	 * Write something
	 * @param data An object containing at least the following: facility, severity, time
	 */
	write: function(data) {
		Logger.log('DEBUG', 'Writer got data: ' + JSON.stringify(data));

		// Pass data to all the writer functions
		for( var i=0, count=Writer.writerFunctions.length; i<count; ++i ) {
			Writer.writerFunctions[i](data);
		}
	}
};
