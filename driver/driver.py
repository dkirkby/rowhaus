import time
import RPi.GPIO as GPIO

# Use BCM numbering so we can access the on-board LEDs
GPIO.setmode(GPIO.BCM)

SWITCH = 3 # BCM numbering

# Channel has a hardware pullup.
GPIO.setup(SWITCH, GPIO.IN)

count = 0
last_time = [0, time.time()]
last_state = -1

def edge(pin):
    global count, last_time, last_state
    new_state = GPIO.input(SWITCH)
    new_time = time.time()
    if new_state == 1 and last_state == 0:
        # Calculate elapsed times.
        elapsed = new_time - last_time[1], new_time - last_time[0]
        print(count, elapsed)
        count += 1
    last_time[new_state] = new_time
    last_state = new_state

GPIO.add_event_detect(SWITCH, GPIO.BOTH, callback=edge, bouncetime=1)

try:
    print('Hit ^C to exit')
    while True:
        #print("tick")
        time.sleep(1)
except KeyboardInterrupt:
    print('bye')

