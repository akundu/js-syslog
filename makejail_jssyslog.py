#
# Configuration for creating a js-syslog compatible chroot jail
#
# Read through the file and change the things necessary for your system
#

# Where to create the new chroot jail
chroot="/var/chroot/jssyslog"

# What files contain the users that need to be copied
userFiles=["/etc/passwd","/etc/shadow"]
# What files contain the groups that need to be copied
groupFiles=["/etc/group","/etc/gshadow"]


# The user and group that will be used by the application
# ... use the same as in config.js
users=["jssyslog"]
groups=["jssyslog"]

# Also copy these files, it is somewhat likely that you will have to change the two "libnss_compat.*" paths to be compatible with your system
# ... I figured out the name of the library needed with "strace node jssyslog.js"
forceCopy=["/etc/hosts","/etc/mime.types","/lib/x86_64-linux-gnu/libnss_compat.so.2","/lib/x86_64-linux-gnu/libnss_compat-2.13.so"]
