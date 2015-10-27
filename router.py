# -*- coding: utf-8 -*-
import cherrypy
import jinja2
import os
from back.api import Api
from model import Count
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
		self.count = Count()

	@cherrypy.expose
	def index(self):
		return env.get_template('index.html').render()

	@cherrypy.expose
	def news_page(self, outer_id):
		return env.get_template('single_news.html').render(outer_id = outer_id)

	@cherrypy.expose
	def wordcloud(self, outer_id):
		return env.get_template('wordcloud.html').render(outer_id = outer_id)

	@cherrypy.expose
	def news_list(self):
		return env.get_template('news_list.html').render()

if __name__ == '__main__':
	conf = {
			'/': {
				'tools.sessions.on': True,
				'tools.response_headers.on': True,
				'tools.staticdir.index': 'index.html'
			},
			'/front': {
				'tools.staticdir.on': True,
				'tools.staticdir.dir': os.path.join(abs_dir, 'front')
			},
			'/favicon.ico': {
				'tools.staticfile.on': True,
				'tools.staticdir.dir': '/front/img/favicon.png'
			}
		}
	"""
	cherrypy.config.update({'server.socket_host': "172.31.19.37",
							'server.socket_port': 8080})
	"""
	cherrypy.engine.start()
	wsgiapp = cherrypy.tree.mount(NewsProject(), '/', conf)