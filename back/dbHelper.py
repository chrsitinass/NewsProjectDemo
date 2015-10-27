#-*- coding: UTF-8 -*-
import MySQLdb
import chardet
import traceback
import MySQLdb.cursors
import json

# staging
DB_HOST = "172.31.19.9"
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "newsProject"
CHARSET = "utf8"
CURSOR_CLASS = MySQLdb.cursors.DictCursor

# test
"""
DB_HOST = "127.0.0.1"
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "newsProject"
CHARSET = "utf8"
CURSOR_CLASS = MySQLdb.cursors.DictCursor
"""

class dbHelper():
	def trans(self, result):
		data = []
		for d in result:
			data.append(json.dumps(d, ensure_ascii = False))
		return data

	def execute(self, operation):
		self.conn = MySQLdb.connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, 
					charset = CHARSET, cursorclass = CURSOR_CLASS)
		cursor = self.conn.cursor()
		try:
			if isinstance(operation, unicode):
				operation = operation.encode('utf-8')
			cursor.execute(operation)
		except MySQLdb.Error, e:
			traceback.print_exc(file = open('../log.txt', 'w+'))
			raise

		results = cursor.fetchall()
		self.conn.commit()
		cursor.close()
		return results
