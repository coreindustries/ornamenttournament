#!/bin/sh
## basic node startup script

# MAKE SURE YOU INCLUDE A .foreverignore file in the save folder. 
# contains "*.log"

# update F to be the base folder for the project
F='/home/corey/ornamenttournament/video/'
app="stream-server.js"

echo $F$app
forever -w -l $F"output.log" --sourceDir $F -a --minUptime 5000 --spinSleepTime 2000 start $app

#ffmpeg -i in.mp4 -f mpeg1video -vf "crop=iw-mod(iw\,2):ih-mod(ih\,2)" -b 0 out.mpg

echo "starting ffmpeg encoder"
#nohup ffmpeg -s 640x480 -f video4linux2 -i /dev/video0 -f mpeg1video \-b 800k -r 30 http://127.0.0.1:8082/s3cret/640/480/ &
ffmpeg -s 1280x720 -f video4linux2 -i /dev/video0 -f mpeg1video \-b 1000k -r 30 http://127.0.0.1:8082/s3cret/1280/720/ 