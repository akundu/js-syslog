#!/usr/bin/env bash

# Find makeroot
makejail=$(which makejail)

if [ ! -f "${makejail}" ]; then
	echo "Failed to find makejail, please check that it is installed, or find another way to configure your root jail."
	exit 1
fi

echo "Make sure you have edited config.js and makejail_jssyslog.py according to your needs."
echo "Also, make sure you have created the user and group for jssyslog prior to running this."
echo
echo "Press enter to continue, or CTRL+C to abort."
read

# Run makejail
makejail makejail_jssyslog.py

echo "This alone doesn't actually seem to work while it should, try also doing the following:"
echo
echo "grep your_user /etc/passwd >> /path/to/chroot/jail/etc/passwd"
echo "grep your_user /etc/shadow >> /path/to/chroot/jail/etc/shadow"
echo "grep your_group /etc/group >> /path/to/chroot/jail/etc/group"
echo "grep your_group /etc/gshadow >> /path/to/chroot/jail/etc/gshadow"
echo ""
echo "... or if your user and group has the name \"jssyslog\" and your jail is \"/var/chroot/jssyslog\", you can use this:"
echo 'NAME="jssyslog"; DEST="/var/chroot/jssyslog"; for $file in "/etc/passwd/ /etc/shadow /etc/group /etc/gshadow"; do grep $NAME $file >> $DEST$file; done'

