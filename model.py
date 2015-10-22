# -*- coding: utf-8 -*-
import cherrypy
import json
import jinja2
import os

from cherrypy.lib.static import serve_file
from jinja2 import Template, Environment, FileSystemLoader

local_dir = os.path.dirname(__file__)
abs_dir = os.path.join(os.getcwd(), local_dir)
current_dir = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(current_dir, 'front/html')

env = Environment(loader = FileSystemLoader(template_dir), trim_blocks = True)

class Count(object):
	@cherrypy.expose
	def category(self):
		return env.get_template('category.html').render()

	@cherrypy.expose
	def source(self):
		return env.get_template('source.html').render()