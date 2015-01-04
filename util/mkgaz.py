import json
import sqlite3
import sys

FILE = sys.argv[1]
QUERY = """
SELECT name n, admin1 a, country c, latitude lat, longitude lon
FROM geoname
WHERE fcode like 'PPL%'
AND population > 5000;
"""

db = sqlite3.connect(FILE)
cur = db.cursor()

cur.execute(QUERY)

r = [dict((cur.description[i][0], value) for i, value in enumerate(row))
     for row in cur.fetchall()]

print 'gaz=%s' % (json.dumps(r, separators=(',', ':')),)
