What this application should do:
 - Receive any and all messages a normal syslog server would, local and UDP port 514
	- Should follow the standard strictly on the UDP packets, e.g. max length
 - Save the syslog messages to MongoDB, in a format that should allow easy searching of data
 - Allow a secure alternative to deliver messages over the network
	- Ability to relay any and all messages going through it to another instance of JSMongoSyslog over a secure connection
	- Ability to receive such relayed messages and direct that traffic to it's own storage, be that another relay, or mongo
 - Be as secure as possible without insane amounts of effort, but stuff like packet source should be handled in the firewall.
 - Everything that doesn't require an insane amount of effort to do so, should be configurable.

Installation:
 - This application requires the glossy nodejs library, if you have npm installed, you can install glossy with "npm install glossy"
