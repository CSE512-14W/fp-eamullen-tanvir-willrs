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

default_port = 8080
if 'PORT' in os.environ:
  default_port = os.environ['PORT']
define("port", default=default_port, help="port", type=int)

rootLogger = logging.getLogger('')
rootLogger.setLevel(logging.ERROR)

tornado.web.Application([
    (r"/", MainHandler),
    (r"/data/([a-zA-Z0-9_]*)", DataHandler)
])

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

class DataHandler(tornado.websocket.WebSocketHandler):
    self.data = Data()

    def allow_draft76(self):
        return True

    def open(self):
        print "Open"
        self.watching = []

        self.write_message({thing: 0, data: 'connected'});

    def on_finish(self):
        self.on_close()

    def on_close(self):
        for item in self.watching:
            DataHandler.data.clean(item)

    # On incoming message
    def on_message(self, msg):
        val = tornado.escape.json_decode(msg)
        def onItem(thing, msg):
            self.write_message({thing: thing, data: msg})
        DataHandler.data.track(val['thing'], onItem)

if __name__ == "__main__":
    tornado.options.parse_command_line()
    application.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()