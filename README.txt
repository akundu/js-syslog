Goals for this application:
 - Receive any and all messages a normal syslog server would, local and UDP port 514
	- Should follow the standard strictly on the UDP packets, e.g. max length
 - Save the syslog messages to MongoDB, in a format that should allow easy searching of data
 - Possibly save the messages to a file in the typical format
 - Relay the messages to a "normal" syslog daemon though a Unix socket, e.g. /dev/log, in case someone would want to use that
 - Allow a secure alternative to deliver messages over the network
	- Ability to relay any and all messages going through it to another instance of JS-Syslog over a secure connection
	- Ability to receive such relayed messages and direct that traffic to it's own storage, be that another relay, or mongo
 - Be as secure as possible without insane amounts of effort, but stuff like packet source should be handled in the firewall.
 - Everything that doesn't require an insane amount of effort to do so, should be configurable.
 - Good internal logging, that should be easily tunable, so if there are any issues, it shouldn't be a pain to figure out what's wrong.

What of this is done:
 - Receive any and all messages a normal syslog server would, local and UDP port 514 (UDP untested)
 - Save the syslog messages to MongoDB, in a format that should allow easy searching of data
 - Possibility to save the messages to a file, but in a horrible format
 - Good internal logging ... or at least pretty good

Installation:
 - This application requires the glossy nodejs library, if you have npm installed, you can install glossy with "npm install glossy"
