from fastapi import FastAPI, Path, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import utils 
from schemas import CreateEventResponse, EventCreate, ParticipantIn

def main():
    print("Hello from secretsanta-api!")


if __name__ == "__main__":
    main()


bd = r'secretsanta.db'
#conn = sqlite3.connect('appliNoel.db')
#cursor = conn.cursor()
#fonction.create_connection(bd)
# print(bd)   
# print(type(bd))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/beneficiaire/{key_groupe}/{prenom}")
def getbeneficiaire(key_groupe, prenom) :
    conn = utils.create_connection(bd)
    cursor = conn.cursor()
    beneficiaire = utils.getPersonneInfo(key_groupe, prenom, "cadeaua",cursor)
    return {"giftee": beneficiaire}

@app.get("/prenom/{key_groupe}/{prenom}")
def getprenom(key_groupe, prenom) :
    conn =utils.create_connection(bd)
    cursor = conn.cursor()
    result = utils.getPersonneInfo(key_groupe, prenom, "prenom",cursor)
    return result

@app.get("/user/{groupe}/{prenom}/{mdp}")
def getuser(groupe, prenom, mdp) :
    conn =utils.create_connection(bd)
    cursor = conn.cursor()
    result = utils.recupinfoviaprenom(groupe, prenom, "personne", "mdp",cursor)
    if result == mdp :
        return utils.recupinfoviaprenom(groupe, prenom, "personne", "cadeaua",cursor)
    else :
        return False

@app.get("/compatibilite/{groupe}/{prenom}")
def getcompatibilite(groupe, prenom) :
    conn = utils.create_connection(bd)
    cursor = conn.cursor()
    result = utils.recupinfoviaprenom(groupe, prenom, "compatibilite", "compatible",cursor)
    result = list(result.strip())
    return result 

@app.get("/groupes/")
def getcompatibilite() :
    conn = utils.create_connection(bd)
    cursor = conn.cursor()
    result = utils.recupNomsGroupes(cursor)
    return result 

@app.get("/nomgroupe/{key_groupe}")
def getnomgroupe(key_groupe) :
    conn = utils.create_connection(bd)
    result = utils.getNomGroupe(key_groupe, conn)
    return {"nomgroupe": result}

@app.get("/mdp/{key_groupe}/{prenom}")
def getmdp(key_groupe, prenom) :
    conn = utils.create_connection(bd)
    print(f"Fetching existing password for group: {key_groupe}, prenom: {prenom}")
    result = utils.get_existing_mdp(key_groupe, prenom, conn)
    print("Existing mdp:", result)
    return {"configured_mdp": result}

@app.put("/mdp/{key_groupe}/{prenom}/{mdp}")
def updatemdp(key_groupe, prenom, mdp) :
    conn = utils.create_connection(bd)
    result = utils.set_mdp(prenom, mdp, key_groupe, conn)
    print("Update result:", result)
    return result

@app.get("/verify-mdp/{key_groupe}/{prenom}/{mdp}")
def verifmdp(key_groupe, prenom, mdp) :
    conn = utils.create_connection(bd)
    result = utils.verifmdp(key_groupe, prenom, mdp, conn)
    print("Verification result:", result)
    return result

@app.post("/secret-santa/", response_model=CreateEventResponse, status_code=status.HTTP_201_CREATED)
def add_secret_santa(data: EventCreate) :
    conn = utils.create_connection(bd)
    result = utils.create_secretsanta(data.name, [p.name for p in data.participants], [(e.person_a, e.person_b) for e in data.exclusions], conn)
    return result

@app.get("/secret-santa/{key_groupe}", response_model=list[ParticipantIn], status_code=status.HTTP_200_OK)
def get_secret_santa(key_groupe: str):
    print(f"Fetching participants for secret key: {key_groupe}")
    conn = utils.create_connection(bd)
    result = utils.get_participants_by_code(key_groupe, conn)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Secret Santa not found")
    return result

@app.put("/personne/{groupe}/{prenom}/{mdp}")
def updatepersonne(groupe, prenom, mdp) :
    conn = utils.create_connection(bd)
    cursor = conn.cursor()
    result = utils.update_personne(groupe, prenom, mdp, cursor, conn)
    return result

@app.post("/tirage/{groupe}")
def run_tirage(nomgroupe):
    conn = utils.create_connection(bd)
    cursor = conn.cursor()
    result = utils.run_tirage(conn, nomgroupe, cursor)
    return result