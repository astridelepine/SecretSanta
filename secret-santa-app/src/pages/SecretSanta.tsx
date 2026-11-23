import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getNomGroupeByCode, getParticipantByCode } from "../api/events";
import { useEffect, useState } from "react";
import type { ParticipantIn } from "../types";

function SecretSantaPage() {
  const code = useParams<{ id: string }>().id || "";
  const { state } = useLocation();   // peut être null
  const nomgroupe = state?.nomgroupe;
  const key_groupe = state?.key_groupe;
  const [personnes, setPersonnes] = useState<ParticipantIn[]>([]);

  useEffect(() => {
    if (nomgroupe === null) {
      getNomGroupeByCode(key_groupe).then((data: any) => {
        if (data) {
          state.nomgroupe = data.nomgroupe;
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du nom du groupe :", error);
        navigate(`/NotFound`,);
      });
    }
  }, [key_groupe, nomgroupe, state]);

  useEffect(() => {
    getParticipantByCode(code).then((data) => {
      setPersonnes(data);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des participants :", error)
      navigate(`/NotFound`,)
    });
  }, [code]);
  const navigate = useNavigate();

  if (!personnes || personnes.length === 0) {
    navigate(`/SantaNotFound`,);
  }
    return (
        <div className="container mx-auto flex flex-col items-center space-y-4">
            <h1 className="text-4xl">Secret Santa {nomgroupe?.nomgroupe}</h1>
            <p className="text-2xl"> Qui est tu ?</p>
            <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-sm">
              {personnes.map((p) => (
                  <button key={p.name} className="w-full truncate rounded-md bg-red-800 px-4 py-2 text-base text-white hover:bg-red-700 sm:text-lg" onClick={() => navigate(`/reveal/${code}/${p.name}`, { state: { nomgroupe: nomgroupe, key_groupe: key_groupe } })}>
                      {p.name}
                  </button>
              ))}
            </div>
        </div>
    );
}

export default SecretSantaPage;