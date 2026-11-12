import sqlite3
import os
from utils import create_table_groupe, create_table_personne, create_table_exclusion

conn = sqlite3.connect('secretSanta.db')

cursor = conn.cursor()

create_table_groupe(conn)
create_table_personne(conn)
create_table_exclusion(conn)


conn.commit()