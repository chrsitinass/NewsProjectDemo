# -*- coding: utf-8 -*-
import cherrypy
import json
from dbHelper import dbHelper

db = dbHelper()
category_mapping = {
	u"热点": "hot",
	u"财经": "finance",
	u"军事": "military",
	u"社会": "society",
	u"科技": "tech",
	u"体育": "sports",
	u"教育": "education",
	u"娱乐": "entertainment",
	u"法律": "law",
	u"旅游": "travel",
	u"国内": "china",
	u"国际": "internation",
	u"港澳台": "gangao",
	u"其他": "other"
}
category = [
	u"热点", u"财经", u"军事", u"社会", u"科技",
	u"体育", u"教育", u"娱乐", u"法律", u"旅游",
	u"国内", u"国际", u"港澳台", u"其他"
]
source = [
	u"腾讯网", u"网易", u"中国新闻网", u"凤凰网", u"人民网", u"新华网", u"新浪网"
]

class Api():
	def __init__(self):
		sql = """ 
				SELECT
					DISTINCT(cate)
				FROM
				  	temp_news
			  """
		result = db.execute(sql)
		category = []
		for d in result:
			category.append(d['cate'])

		sql = """ 
				SELECT
					DISTINCT(source)
				FROM
				  	temp_news
			  """
		result = db.execute(sql)
		source = []
		for d in result:
			source.append(d['source'])
		self.category = category
		self.source = source 

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def get_lastest_news(self, top=20):
		data = {}
		for cate in self.category:
			c = category_mapping[cate]
			sql = """
					SELECT 
						outer_id, title, source, pubtime, URL
					FROM
						temp_news
					WHERE
						cate = '%s'
					ORDER BY
						pubtime DESC
					LIMIT
						1, %d
				  """ % (cate, top)
			result = db.execute(sql)
			for d in result:
				d['pubtime'] = str(d['pubtime'])
			data[c] = result
		return data

	def gen_filter(self, filter):
		if filter == None:
			return ""
		conditions = []
		for (key, value) in filter.items():
			temp = key + " = "
			value = value.encode('utf-8')
			temp = temp + "'" + value + "'"
			conditions.append(temp)

		filters = ""
		if len(conditions) > 0:
			filters = " AND ".join(conditions)
			filters = "WHERE " + filters
		return filters

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def count_news_by_filter(self, filter):
		filters = self.gen_filter(filter)
		sql = """
				SELECT
					COUNT(*)
				FROM
					temp_news
				%s
			  """ % filters
		result = db.execute(sql)
		return result[0]["COUNT(*)"]

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def get_news_by_filter(self, filter=None):
		filter = json.loads(filter)
		filters = self.gen_filter(filter)
		sql = """
				SELECT
					outer_id, title, source, pubtime, URL
				FROM
					temp_news
				%s
				ORDER BY
					id DESC
			  """ % filters
		result = db.execute(sql)
		for d in result:
			d['pubtime'] = str(d['pubtime'])
		return result

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def count_news_by_source(self):
		count = {}
		filter = {
			'source': '',
			'cate': ''
		}
		for source in self.source:
			count[source] = {}
			filter['source'] = source
			total = 0
			for category in self.category:
				filter['cate'] = category
				num = self.count_news_by_filter(filter)
				total += num
				count[source][category] = num
			count[source]['total'] = total
		return count

	@cherrypy.expose
	@cherrypy.tools.json_out()
	def count_news_by_category(self):
		count = {}
		filter = {}
		for category in self.category:
			count[category] = {}
			filter['cate'] = category
			total = 0
			for source in self.source:
				filter['source'] = source
				num = self.count_news_by_filter(filter)
				total += num
				count[category][source] = num
			count[category]['total'] = total
		return count