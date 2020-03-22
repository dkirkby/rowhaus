import time
import RPi.GPIO as GPIO
from multiprocessing import Process, Queue

def monitor_switch(queue):
    SWITCH = 5
    GPIO.setmode(GPIO.BOARD)
    # Channel has a hardware pullup.
    GPIO.setup(SWITCH, GPIO.IN)

    count = 0
    last_time = [0, time.time()]
    last_state = -1

    def edge(pin):
        nonlocal count, last_time, last_state
        new_state = GPIO.input(SWITCH)
        new_time = time.time()
        if new_state == 1 and last_state == 0:
            # Calculate elapsed times.
            payload = count, new_time - last_time[1], new_time - last_time[0]
            queue.put(payload)
            count += 1
        last_time[new_state] = new_time
        last_state = new_state

    GPIO.add_event_detect(SWITCH, GPIO.BOTH, callback=edge, bouncetime=1)

    while True:
        time.sleep(10)

        
if __name__ == '__main__':
    q = Queue()
    p = Process(target=monitor_switch, args=(q,))
    p.start()
    try:
        while True:
            count, t1, t2 = q.get()
            print(count, t1, t2)
    except KeyboardInterrupt:
        p.join()
        print('bye')
