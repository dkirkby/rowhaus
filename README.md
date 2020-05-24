# rowhaus

A replacement front-end graphical user interface for the [Sunny SF-RW5515 rowing machine](https://www.amazon.com/Sunny-Health-Fitness-Magnetic-SF-RW5515/dp/B017HSNIEW).

## Hardware Setup

You will need a RaspberryPi with a wireless interface configured for your local network. Set the hostname to `rowhaus` so you can access the UI from any browser using http://rowhaus.local.

Remove the rowing machine display and disconnect the 2-pin header. Add jumper wires from this header to the RPi as shown here:
![wiring diagram](static/rowhaus-wiring.jpg?raw=true)

The two pins on the connector are identical so it does not matter which of the RPi pins you connect them to. Note how the RPi is connected securely to the rowing machine body with some nylon standoffs. You can also route the wiring through a hole in the body so the original display can be replaced (which is probably a good idea to keep dust out of the internal mechanism).

## Software Setup

The only external dependency are [flask]() and [RPi.GPIO](https://sourceforge.net/p/raspberry-gpio-python/wiki/Home/):
```
pip install 
pip install RPi.GPIO
```
You also need to install this package:
```
git clone https://github.com/dkirkby/rowhaus.git
```

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
$ nohup sudo ./server > /home/pi/rowhaus/server.log &
```

## Software Development

To develop and test this package on a non-RPi platform, create a suitable conda env:
```
conda create -n rowhaus python=3.7 pip ipython flask
```
To run the server in development mode:
```
./server --test --debug
```
This will simulate the periodic messages from the RPi and allow you to connect via http://127.0.0.1:5000/

To update the version on the RPi:
```
ssh -A pi@rowhaus.local
$ ps aux | fgrep python
$ sudo kill N N+1
$ cd rowhaus
$ git pull
$ nohup sudo ./server > /home/pi/rowhaus/server.log &
```
