#!/usr/bin/python3

from http import server

class Handler(server.SimpleHTTPRequestHandler):
  def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    server.SimpleHTTPRequestHandler.end_headers(self)

server.test(HandlerClass=Handler)
