# rowhaus
Rowing machine UI

## Installation

The only external dependency for testing is flask.  On a raspberry pi you will also need the RPi.GPIO package.

To create a testing conda environment:
```
conda create -n rowhhaus python=3.7 pip ipython flask
```

## Hardware Setup

Add jumper wires from 

## Running

To have the server start automatically after a reboot, edit the [crontab](https://www.dexterindustries.com/howto/auto-run-python-programs-on-the-raspberry-pi/):
```
ssh pi@rowhaus.local
$ sudo crontab -e
```
and add the following line to the end of this file:
```
@reboot sudo /home/pi/rowhaus/server > /home/pi/rowhaus/server.log
```

To manually start the server:
```
ssh pi@rowhaus.local
$ cd rowhaus
$ nohup sudo ./server &
```
