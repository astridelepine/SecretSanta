import sqlite3
from xmlrpc.client import Boolean, Integer
from sqlalchemy import Column, String, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base, DeclarativeMeta, DeclarativeBase

class Base(DeclarativeBase):
  pass


class Personne(Base):
  __tablename__ = 'personnes'

  id = Column(Integer, primary_key=True)
  prenom = Column(String)
  mdp = Column(String)
  cadeaua = Column(String)
  key_groupe = Column(String, ForeignKey('groupe.key_groupe'))
  attribuer = Column(Boolean, default=False)

  def __repr__(self):
    return f"<Personne(prenom='{self.prenom}', mdp='{self.mdp}', cadeaua='{self.cadeaua}', key_groupe='{self.key_groupe}', attribuer='{self.attribuer}')>"

class Groupe(Base):
  __tablename__ = 'groupe'

  id = Column(Integer, primary_key=True)
  nomgroupe = Column(String)
  key_groupe = Column(String, unique=True)

  def __repr__(self):
    return f"<Groupe(nomgroupe='{self.nomgroupe}', key_groupe='{self.key_groupe}')>"

class Exclusion(Base):
  __tablename__ = 'exclusion'

  id = Column(Integer, primary_key=True)
  prenom1 = Column(String)
  prenom2 = Column(String)
  key_groupe = Column(String, ForeignKey('groupe.key_groupe'))

  def __repr__(self):
    return f"<Exclusion(prenom1='{self.prenom1}', prenom2='{self.prenom2}', key_groupe='{self.key_groupe}')>"


DATABASE_URL = "./secretsanta.db"
engine = create_engine(DATABASE_URL, echo=True)

# Création des tables dans le fichier SQLite
def init_db():
    Base.metadata.create_all(engine)

if __name__ == "__main__":
    init_db()
    print("Base de données SQLite et table 'utilisateurs' créées avec succès !")