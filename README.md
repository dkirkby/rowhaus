# rowhaus
Rowing machine UI

## Installation

The only external dependency for testing is flask.  On a raspberry pi you will also need the RPi.GPIO package.

To create a testing conda environment:
```
conda create -n rowhaus python=3.7 pip ipython flask
```

## Hardware Setup

You will need a RaspberryPi with a wireless interface configured for your local network. Set the hostname to `rowhaus` so you can access the UI from any browser using http://rowhaus.local.

Remove the rowing machine display and disconnect the 2-pin header. Add jumper wires from this header to the RPi as shown here:
![wiring diagram](static/rowhaus-wiring.jpg?raw=true)

The two pins on the connector are identical so it does not matter which of the RPi pins you connect them to. Note how the RPi is connected securely to the rowing machine body with some nylon standoffs. You can also route the wiring through a hole in the body so the original display can be replaced (which is probably a good idea to keep dust out of the internal mechanism).

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
