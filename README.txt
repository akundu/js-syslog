===JS-Syslog===
A better syslog daemon in JavaScript by Janne Enberg / lietu

==The goals of this application are==
 * Receive any and all messages a normal syslog server would (Unix socket & UDP port 514)
    * Should follow the standard strictly on the UDP packets, e.g. max length
 * Save the messages to many destinations, including to files in the typical format, MongoDB, "normal" syslog servers via Unix sockets, or relaying them over a secure connection to a centralized js-syslog server.
 * Allow a secure alternative to deliver messages over the network
   * Ability to relay any and all messages going through it to another instance of JS-Syslog over a secure connection
   * Ability to receive such relayed messages and direct that traffic to it's own storage, be that another relay, or mongo
 * Be secure, as long as it doesn't require a lot of effort for little gain, e.g. incoming packet rate limiting should be done in your firewall, not in js-syslog
 * Everything that doesn't require an insane amount of effort to do so, should be configurable.
 * Good internal logging, that should be easily tunable, so if there are any issues, it shouldn't be a pain to figure out what's wrong.

==Current status==

The application can currently replace your plain old syslog-ng/rsyslog/whatever, but it's not recommended to do so, as the stored data might not be very useful. Suggested to run on development boxes only.

===What's done===
 * Receive any and all messages a normal syslog server would, local Unix sockets, and UDP port 514 (UDP untested, but should work, and at least not require a lot of work to finish)
 * Save the syslog messages to MongoDB in an ok format, save the messages to files but in a horrible format
 * Good internal logging ... or at least pretty good
 * Dropping privileges after binding to ports, opening files and sockets, if running as root

===What needs work===
 * The UDP protocol standards compliancy has not been tested, it might not work perfectly
 * The secure relaying protocol between JS-Syslog servers should be designed, and then implemented
 * Switching to a chroot jail after dropping privileges
 * Some sort of basic init scripts that can be used as a base to replace any current Syslog daemons with this

==Installation==
 * This application requires the glossy and mongodb nodejs libraries, if you have npm installed, you can install glossy with "npm install glossy" and "npm install mongodb" 

==License==
Licensed under "The MIT License", aka. the "Expat license". This license is available in LICENSE.txt distributed with the code, and at http://www.opensource.org/licenses/mit-license.php

==Project page==
http://code.google.com/p/js-syslog/
