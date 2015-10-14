import cherrypy
from dbHelper import dbHelper

db = dbHelper()

class Api():
	@cherrypy.expose
	@cherrypy.tools.json_out()
	def get_news_sources(self):
		sql = """ SELECT
					DISTINCT(source) 
			  	  FROM
			  		temp_news
			  """
		return db.execute(sql)

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def count_news_by_source(self, source):
		sql = """ SELECT
					COUNT(*)
			  	  FROM
			  		temp_news
			  	  WHERE
			  	  	source = '%s'
			  """ % source
		return db.execute(sql)

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def get_newest_news(self, top = 10):
		sql = """ SELECT
					*
				  FROM
				  	temp_news
				  ORDER BY
				  	pubtime DESC
				  LIMIT 0, %d
			  """ % top
		return db.execute(sql)

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def get_news_by_id(self, outer_id):
		sql = """ SELECT
					*
				  FROM
				  	temp_news
				  WHERE
				  	outer_id = '%s'
			  """ % outer_id
		return db.execute(sql)