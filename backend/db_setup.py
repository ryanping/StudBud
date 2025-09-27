

import sqlite3
import os


DB_FOLDER = os.path.join(os.path.dirname(__file__), 'database')
DB_FILE = os.path.join(DB_FOLDER, 'studbud.db')
SCHEMA_FILE = os.path.join(DB_FOLDER, 'schema.sql')


os.makedirs(DB_FOLDER, exist_ok=True)


connection = sqlite3.connect(DB_FILE)


with open(SCHEMA_FILE) as f:
    connection.executescript(f.read())

print("Database 'studbud.db' created successfully!")

connection.close()