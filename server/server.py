#!/usr/bin/env python
"""
  Web server for Energy Data Access
"""

import os, sys, inspect, time, math
import base64
import logging
import json
import os.path
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import uuid
from tornado.options import define, options
from data import Data

default_port = 8080
if 'PORT' in os.environ:
  default_port = os.environ['PORT']
define("port", default=default_port, help="port", type=int)

rootLogger = logging.getLogger('')
rootLogger.setLevel(logging.ERROR)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("../index.html")

class LabelHandler(tornado.web.RequestHandler):
    def get(self, thing):
      try:
        self.render("data/house_" + str(int(thing)) + "/labels.dat")
      except:
        self.render("../index.html")

class DataHandler(tornado.websocket.WebSocketHandler):
    data = Data()

    def allow_draft76(self):
        return True

    def open(self, thing):
        #print "asked for ", thing
        self.watching = []

        self.write_message({'thing': 0, 'data': 'connected'});

    def on_finish(self):
        self.on_close()

    def on_close(self):
        if hasattr(self, 'watching'):
          for item in self.watching:
            DataHandler.data.clean(item)
          self.watching = []

    # On incoming message
    def on_message(self, msg):
        val = tornado.escape.json_decode(msg)
        if val['thing'] == 'reset':
          self.on_close()
        else:
          def onItem(thing, msg):
            try:
              self.write_message({'thing': thing, 'data': msg})
            except:
              pass
          DataHandler.data.track(val['thing'], onItem)
          self.watching.append(onItem)

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/lib/(.*)", tornado.web.StaticFileHandler, {'path': '../lib/'}),
    (r"/script/(.*)", tornado.web.StaticFileHandler, {'path': '../script'}),
    (r"/static/(.*)", tornado.web.StaticFileHandler, {'path': '../static'}),
    (r"/label/(.*)", LabelHandler),
    (r"/data/([a-zA-Z0-9_]*)", DataHandler)
])

if __name__ == "__main__":
    tornado.options.parse_command_line()
    application.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()