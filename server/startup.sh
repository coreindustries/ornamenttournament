#!/bin/sh
## basic node startup script

# MAKE SURE YOU INCLUDE A .foreverignore file in the save folder. 
# contains "*.log"

# update F to be the base folder for the project
F='/home/corey/ornamenttournament/server/'
app="app.js"

echo $F"app.js"
exec forever -w -l $F"output.log" --sourceDir $F -a \
--minUptime 5000 --spinSleepTime 2000 start $app

# -w --watchDirectory $F --watchIgnorePatterns ".log" 