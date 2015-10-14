# -*- coding: utf-8 -*-
import cherrypy
import jinja2
import os
from back.api import Api
from cherrypy.lib.static import serve_file
from jinja2 import Template, Environment, FileSystemLoader

local_dir = os.path.dirname(__file__)
abs_dir = os.path.join(os.getcwd(), local_dir)
current_dir = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(current_dir, 'front/html')

env = Environment(loader = FileSystemLoader(template_dir), trim_blocks = True)

class NewsProject(object):
	def __init__(self):
		self.api = Api()

	@cherrypy.expose
	def index(self):
		return env.get_template('index.html').render()

if __name__ == '__main__':
	conf = {
		'/': {
			'tools.sessions.on': True,
			'tools.response_headers.on': True
		},
		'/front': {
			'tools.staticdir.on': True,
			'tools.staticdir.dir': os.path.join(abs_dir, 'front')
		}
	}
	cherrypy.quickstart(NewsProject(), '/', conf)