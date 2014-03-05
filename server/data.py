import os, sys, inspect, time, math
import threading, datetime

class Data():
  def __init__(self):
    self.sources = dict()
    self.watchers = dict()
    self.run()
  
  def run(self):
    if not next in self:
      self.next = time.time()
    self.emit()
    self.next += 1
    threading.Timer(next - time.time(), self.run).start()

  def emit(self):
    for thing in self.sources:
      line = self.sources[thing].readline()
      #TODO: deal with running off end / repeating day
      for cb in self.watchers[thing]:
        cb(thing, line.split(" ")[1])

  def track(self, thing, cb):
    try:
      (house, channel) = thing.split(".")
      if thing not in self.sources and os.path.exists("data/house_" + house + "/channel_" + channel + ".dat"):
        self.sources[thing] = open("data/house_" + house + "/channel_" + channel + ".dat", "r")
      #TODO: jump to requested day & time.
      if thing not in self.watchers:
        self.watchers[thing] = []
      self.watchers[thing].append(cb)
    except:
      pass

  def clean(self, cb):
    for thing in self.watchers:
      self.watchers[thing].remove(cb)
      if len(self.watchers[thing]) == 0:
        self.sources[thing].close()
        del self.sources[thing]
        del self.watchers[thing]
