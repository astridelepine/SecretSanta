import hmac
from os import error
import sqlite3, random
from sqlite3 import Error
import hashlib
from schemas import CreateEventResponse, ParticipantIn

def create_connection(db_file):
  """Créer une connexion à un fichier de base de données"""
  conn = None
  try:
    conn = sqlite3.connect(db_file)
  except Error as e:
    print(e)
  return conn

def create_table_groupe(conn):
    try:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS groupe(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nomgroupe VARCHAR, 
                key_groupe TEXT UNIQUE
            )
        """)
        conn.commit()
    except Error as e:
        print(e)

def create_table_personne(conn):
  try:
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS personnes(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prenom TEXT,
            mdp TEXT,
            cadeaua TEXT,
            key_groupe TEXT REFERENCES groupe(key_groupe),
            attribuer BOOLEAN DEFAULT 0,
            UNIQUE (prenom, key_groupe)
        )
    """)
    conn.commit()
  except Error as e:
    print(e)

def create_table_exclusion(conn):
    try:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS exclusion(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prenom1 VARCHAR,
                prenom2 VARCHAR,
                key_groupe TEXT REFERENCES groupe(key_groupe),
                UNIQUE (prenom1, prenom2, key_groupe)
            )
        """)
        conn.commit()
    except Error as e:
        print(e)

def create_personnes(prenoms, secret_key, conn):
    try:
        c = conn.cursor()
        c.executemany("""
            INSERT INTO personnes (prenom, key_groupe)
            VALUES (?, ?)
        """, [(prenom, secret_key) for prenom in prenoms])
        conn.commit()
    except Error as e:
        print("creation des personnes échouée :", e)

def create_exclusion(exclusions, secret_key, conn):
    try:
        c = conn.cursor()
        c.executemany("""
            INSERT INTO exclusion (prenom1, prenom2, key_groupe)
            VALUES (?, ?, ?)
        """, [(exclusion[0], exclusion[1], secret_key) for exclusion in exclusions])
        conn.commit()
    except Error as e:
        print("creation des exclusions échouée :", e)

def create_groupe(nomgroupe, secret_key, conn):
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO groupe (nomgroupe, key_groupe)
            VALUES (?, ?)
        """, (nomgroupe, secret_key))
        conn.commit()
    except Error as e:
        print(e)

def create_secretsanta(nomgroupe, prenoms, exclusions,  conn):
    try:
        secret_key = generate_secret_key()
        create_groupe(nomgroupe, secret_key, conn)
        conn.commit()
        create_personnes(prenoms, secret_key, conn)
        conn.commit()
        if exclusions != []:
            create_exclusion(exclusions, secret_key, conn)
            conn.commit()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM exclusion WHERE key_groupe = ?", (secret_key,))
        secret_key = run_tirage(secret_key, conn.cursor(), conn)
        return CreateEventResponse(id=secret_key)
        
    except Error as e:
        return e

def set_mdp(prenom, mdp, key_groupe, conn):
    try:
        c = conn.cursor()
        mdp_existant = c.execute("SELECT mdp FROM personnes WHERE prenom = ? AND key_groupe = ?", (prenom, key_groupe)).fetchone()
        if mdp_existant[0] is not None:
            return False
        mdp_hash = hashlib.sha256(mdp.encode('utf-8')).hexdigest()
        c.execute("""
            UPDATE personnes
            SET mdp = ?
            WHERE prenom = ? AND key_groupe = ?
        """, (mdp_hash, prenom, key_groupe))
        conn.commit()
        return True
    except Error as e:
        print(e)
        return False

def get_participants_by_code(secret_key, conn):
    try:
        c = conn.cursor()
        c.execute("SELECT prenom FROM personnes WHERE key_groupe = ?", (secret_key,))
        rows = c.fetchall()
        if not rows:
            return None
        return [ParticipantIn(name=row[0]) for row in rows]
    except Error as e:
        print(e)
        return None
    
def getNomGroupe(secret_key, conn):
    try:
        c = conn.cursor()
        c.execute("SELECT nomgroupe FROM groupe WHERE key_groupe = ?", (secret_key,))
        row = c.fetchone()
        if row is None:
            return None
        return {"nomgroupe": row[0]}
    except Error as e:
        print(e)
        return None

def get_existing_mdp (key_groupe, prenom, conn) :
    try :
      cur = conn.cursor()
      cur.execute("SELECT mdp FROM personnes where lower(prenom) = lower(?) and key_groupe = ?", (prenom, key_groupe, ))
      row = cur.fetchone()
      rep = row[0]
      if rep is not None :
          rep = True
      else :
          rep = False
    except :
        rep = 'nulleeee'
    return rep

def verifmdp (key_groupe, prenom, mdp, conn) :
    try :
      mdp = hashlib.sha256(mdp.encode('utf-8')).hexdigest()
      cur = conn.cursor()
      cur.execute("SELECT mdp FROM personnes where lower(prenom) = lower(?) and key_groupe = ?", (prenom, key_groupe, ))
      row = cur.fetchone()
      mdp_hash = row[0]
      rep = hmac.compare_digest(mdp_hash, mdp)
    except error as e:
        rep = 'nulleeee'
    return rep

def getPersonneInfo (key_groupe, prenom, nomcol, cur) :
    try :
      cur.execute(f"SELECT {nomcol} FROM personnes where lower(prenom) = lower(?) and key_groupe = ?", (prenom, key_groupe, ))
      row = cur.fetchone()
      rep = row[0]
    except :
        rep = 'nulleeee'
    return rep


def recupNomsGroupes(cur) :
   try :
      cur.execute("SELECT nomgroupe FROM personne group by nomgroupe")
      rows = cur.fetchall()
      listgp = []
      for row in rows : 
         listgp.append(row[0])
      rep = listgp
      
   except :
        rep = 'null'
   return rep

def getColFromPerosnne(secret_key, numcol, cur) :
    liste = []
    cur.execute("SELECT * FROM personnes where key_groupe = ?", (secret_key, ))
    rows = cur.fetchall()
    for row in rows:
      #verifier que numcol soit un entier !!! ??
      liste.append(row[numcol])
    return liste

def tireHasard(secret_key, cur, conn, liste) :   
    for i in liste :
        tabpossible = []
        cur.execute("""
            SELECT p.prenom
            FROM personnes p
            WHERE p.key_groupe = ?
            AND p.attribuer = 0
            AND lower(p.prenom) != lower(?)
            AND NOT EXISTS (
                SELECT 1
                FROM exclusion e
                WHERE e.key_groupe = p.key_groupe
                    AND (
                        (lower(e.prenom1) = lower(?) AND lower(e.prenom2) = lower(p.prenom))
                    OR (lower(e.prenom1) = lower(p.prenom) AND lower(e.prenom2) = lower(?))
                    )
            )
        """, (secret_key, i, i, i))
        tabpossible = [row[0] for row in cur.fetchall()]
            
        nbgens = len(tabpossible)
        if nbgens == 0 :
            cur.execute("UPDATE personnes SET cadeaua = NULL, attribuer = 0 where key_groupe = ?", (secret_key,))
            conn.commit()
            tireHasard(secret_key, cur, conn, liste)
        else :
            n = random.randint(0,nbgens-1)
            personneattribuer = tabpossible[n]
            
            sql = f"UPDATE personnes SET cadeaua = ? where lower(prenom) = lower(?) and key_groupe = ? "
            info = (personneattribuer, i, secret_key)
            cur.execute(sql, info)

            sql = f"UPDATE personnes SET attribuer = ? where lower(prenom) = lower(?) and key_groupe = ? "
            info = (1, personneattribuer, secret_key)
            cur.execute(sql, info)

            cur = conn.cursor()
            cur.execute("SELECT * FROM personnes where key_groupe = ?", (secret_key,))

def generate_secret_key():
    """Génère une clé secrète aléatoire"""
    return ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))


def run_tirage(secret_key, cur, conn) :
    listepersonne = getColFromPerosnne(secret_key, 1,cur)
    tireHasard(secret_key, cur, conn, listepersonne)
    conn.commit()
    return secret_key
