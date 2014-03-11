import os, sys, inspect, time, math
import threading, datetime

class Data():
  def __init__(self):
    print "running init"
    self.sources = dict()
    self.watchers = dict()
    self.time_diffs = dict()
    self.begin_time = dict()
    self.run()
  
  #get current time in data time
  def current_time(self,conn):
    return time.time() - self.time_diffs[conn]

  def run(self):
    if not hasattr(self, 'next'):
      self.next = time.time()
    delay = self.emit()
    threading.Timer(delay, self.run).start()

  def emit(self):
    #default delay until next emit in seconds
    #TODO: set to something else by looking at data
    delay = 1

    #keep a list of everything to send this time
    to_send = []

    #read new data, enqueue to send if now time to do so
    for thing in self.sources:
      #TODO: deal with running off end / repeating day
      timestamp = self.current_time(thing) - 1
      #print "current time is: ", self.current_time(thing)
      while (float(timestamp) < self.current_time(thing)):
        line = self.sources[thing].readline()
        (timestamp,data) = line.split(" ")
        if (float(timestamp) > self.begin_time[thing]):
          for cb in self.watchers[thing]:
            to_send.append((cb,thing,(timestamp,data)))

    #send everything that is enqueued to send
    #this ends up sending data 1 second early
    #not a big deal
    for x in to_send:
      x[0](x[1],x[2])

    #return time until next emit
    return delay

  def track(self, thing, cb):
    print "tracking: ", thing
    try:
      (house, channel, begining_of_time, start_time) = thing.split(".")
      if thing not in self.sources and os.path.exists("data/house_" + house + "/channel_" + channel + ".dat"):
        self.sources[thing] = open("data/house_" + house + "/channel_" + channel + ".dat")
      #keep actual time started and posted time started
      #for each connection
      self.time_diffs[thing] = time.time() - int(start_time)
      self.begin_time[thing] = int(begining_of_time)
      if thing not in self.watchers:
        self.watchers[thing] = []
      self.watchers[thing].append(cb)
    except:
      pass

  def clean(self, cb):
    toclose = [];
    for thing in self.watchers:
      try:
        self.watchers[thing].remove(cb)
        if len(self.watchers[thing]) == 0:
          toclose.append(thing);
      except:
        pass
    for thing in toclose:
      try:
        self.sources[thing].close()
        del self.sources[thing]
        del self.watchers[thing]
      except:
        pass
