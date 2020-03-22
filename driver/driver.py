import time
import RPi.GPIO as GPIO
import multiprocessing

class SwitchMonitor(multiprocessing.Process):

    def __init__(self, queue):
        multiprocessing.Process.__init__(self)
        self.exit = multiprocessing.Event()
        self.queue = queue
        self.SWITCH = 5
        GPIO.setmode(GPIO.BOARD)
        # Channel has a hardware pullup.
        GPIO.setup(self.SWITCH, GPIO.IN)

        self.count = 0
        self.last_time = [0, time.time()]
        self.last_state = -1

    def edge(self, pin):
        if pin != self.SWITCH:
            return
        new_state = GPIO.input(self.SWITCH)
        new_time = time.time()
        if new_state == 1 and self.last_state == 0:
            # Calculate elapsed times.
            payload = self.count, new_time - self.last_time[1], new_time - self.last_time[0]
            self.queue.put(payload)
            self.count += 1
        self.last_time[new_state] = new_time
        self.last_state = new_state

    def run(self):
        GPIO.add_event_detect(self.SWITCH, GPIO.BOTH, callback=self.edge, bouncetime=1)
        while not self.exit.is_set():
            print('tick')
            time.sleep(1)
        self.queue.close()
        print('closed')

    def shutdown(self):
        self.exit.set()

        
if __name__ == '__main__':
    q = multiprocessing.Queue()
    p = SwitchMonitor(q)
    p.start()
    try:
        while True:
            count, t1, t2 = q.get()
            print(count, t1, t2)
    except KeyboardInterrupt:
       p.shutdown()
       p.join()
       print('bye')
