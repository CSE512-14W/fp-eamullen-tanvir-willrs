import os, sys, inspect, time, math
import threading, datetime

class Data():
  def __init__(self):
    self.sources = dict()
    self.watchers = dict()
    self.time_diffs = dict()
    self.begin_time = dict()
    self.to_send = []
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

    #take in a thing, return if it is one of the two main
    #power lines
    def is_main_power(th):
      return (int(th.split(".")[1]) < 3)

    def is_chan_1(th):
      return (int(th.split(".")[1]) == 1)

    #main power channels
    chan_1 = {}
    chan_2 = {}

    chan_1_thing = None

    #read new data, enqueue to send if now time to do so
    source_copy = self.sources.copy()
    for thing in source_copy:
      #TODO: deal with running off end / repeating day
      timestamp = self.current_time(thing) - 1
      #print "current time is: ", self.current_time(thing)
      while (float(timestamp) < self.current_time(thing)):
        line = self.sources[thing].readline()
        (timestamp,data) = line.split(" ")
        if (float(timestamp) > self.begin_time[thing]):
          if is_main_power(thing):
            if is_chan_1(thing):
              chan_1[int(timestamp)] = data
              chan_1_thing = thing
            else:
              chan_2[int(timestamp)] = data
          else:
            for cb in self.watchers[thing]:
              self.to_send.append((cb,thing,(timestamp,data)))

    sent = []

    #send single appliance level data
    for x in self.to_send:
      if (float(x[2][0]) < self.current_time(thing)):
        x[0](x[1],x[2])
        sent.append(x)
    
    for x in sent:
      self.to_send.remove(x)

    #send main line power info
    for k in chan_1:
      if k in chan_2:
        chan_1[k] += chan_2[k]

    if (chan_1_thing != None):
      for cb in self.watchers[chan_1_thing]:
        for k in chan_1:
          cb(chan_1_thing,(k,chan_1[k]))

    #return time until next emit
    return delay

  #get a summary of a certain channel, from begin to end, with num data points
  def summary(self, house, channel, begin, end, num):
    path = "data/house_" + str(house) + "/channel_" + str(channel) + ".dat"
    if os.path.exists(path):
      try:
        data = open(path)
      except:
        return []

      t = begin-1
      while (t < begin):
        line = data.readline()
        (t,d) = line.split(" ")
        t = int(t)
        d = float(d)

      all_data = []

      while (t < end):
        line = data.readline()
        (t,d) = line.split(" ")
        t = int(t)
        d = float(d)
        all_data.append((t,d))


      #number of data points per point in output
      freq = float(len(all_data))/num
      
      freq_incr = 0
      loc_tot = []
      n = 0

      to_ret = []

      def avg(l):
        t = 0
        d = 0
        length = len(l)
        for dat in l:
          t += dat[0]
          d += dat[1]
        return (float(t)/length,float(d)/length)

      for dat in all_data:
        loc_tot.append(dat)
        n += 1
        
        if (n > freq_incr):
          freq_incr += freq
          to_ret.append(avg(loc_tot))
          loc_tot = []

      if (channel == 1):
        summ_2 = self.summary(house,2,begin,end,num)
        def agg(x):
          (a,b) = x
          return (a[0],a[1]+b[1])
        to_ret = map(agg,zip(to_ret,summ_2))
          
      return to_ret

    #failure case
    return []
      

  def track(self, thing, cb):
    try:
      (house, channel, begining_of_time, start_time) = thing.split(".")
      if (channel == "2"):
        return
      if thing not in self.sources and os.path.exists("data/house_" + house + "/channel_" + channel + ".dat"):
        self.sources[thing] = open("data/house_" + house + "/channel_" + channel + ".dat")
      #keep actual time started and posted time started
      #for each connection
      self.time_diffs[thing] = time.time() - int(start_time)
      self.begin_time[thing] = int(start_time)
      if thing not in self.watchers:
        self.watchers[thing] = []
      self.watchers[thing].append(cb)
      
      #send summary from begining_of_time to start_time
      summ = self.summary(int(house),int(channel),int(begining_of_time),int(start_time),300)
      #print "sending summary: ", summ
      cb(thing, summ)

    except:
      e = sys.exc_info()[0]
      #print str(e)
      raise

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
