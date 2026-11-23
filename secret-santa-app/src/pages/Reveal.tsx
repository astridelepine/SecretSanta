import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { getBeneficiairefromAPI, getMdp, getNomGroupeByCode, setNewMdp, verifyMdp } from "../api/events";
import panneauPereNoel from "@/assets/panneau-pere-noel.svg";

function RevealPage() {
    const name = useParams<{ name: string }>().name || "";
    const { state } = useLocation();   // peut être null
    const nomgroupe = state?.nomgroupe?.nomgroupe || state?.nomgroupe || null;
    const key_groupe = state?.key_groupe;
    const [beneficiaire, setBeneficiaire] = useState<string | null>(null);
    const [mdp_configured, setMdp_configured] = useState<boolean>(false);
    const [log_in, setLog_in] = useState<boolean>(false);
    const [mdp, setMdp] = useState<string>("");
    const [mdpConf, setMdpConf] = useState<string>("");
    const [error, setError] = useState<string>("");
    const code = key_groupe; // Utiliser le code du groupe pour les requêtes API

    const navigate = useNavigate();

    useEffect(() => {
        getMdp(code, name).then((data) => {
        setMdp_configured(data.configured_mdp);
        });
    }, [code, name]);

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

    const handleLogin = async () => {
        if (!mdp.trim()) return setError("Mdp requis.");
        setError("");
        try {
          const newMdp = await verifyMdp(code, name, mdp);
          if (newMdp) {
            setLog_in(true);
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "");
        } finally {
          setError("");
          setMdp("");
        }
      };
    
    const handleLogOn = async () => {
        if (!mdp.trim() || !mdpConf.trim()) return setError("les deux champs sont requis.");
        if (mdp !== mdpConf) return setError("les deux champs doivent être identiques.");
        setError("");
        try {
          const newMdp = await setNewMdp(code, name, mdp);
          setLog_in(true);
          setMdp_configured(true);
        } catch (e) {
          setError(e instanceof Error ? "MDP incorrect" : "");
          console.log("MDP incorrect")
        } finally {
          setError("");
          setMdp("");
          setMdpConf("");
        }
      };

    useEffect(() => {
        if (log_in && !beneficiaire) {
            getBeneficiairefromAPI(code, name)
            .then((data) => {
                setBeneficiaire(data.giftee);
            })
        .catch((error) => {
            console.error("Erreur lors de la récupération du bénéficiaire :", error);
            setError("Erreur lors de la récupération du bénéficiaire.");
        });
    }
    }, [log_in, beneficiaire, code, name]);


    return (
        <div className="flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-bold">Secret Santa {nomgroupe}</h1>
            {mdp_configured && !log_in ? (
                <div>
                    <div className="flex gap-2">
                        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleLogin(); } }>
                            <input type="password" className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Entrez votre mot de passe" onChange={(e) => setMdp(e.target.value)} />
                            <button type="submit" className="rounded-md bg-red-800 px-4 py-2 text-white hover:bg-red-700">
                                Valider
                            </button>
                        </form>
                        {/* <input type="password" placeholder="Entrez votre mot de passe" onChange={(e) => setMdp(e.target.value)} />
                        <button onClick={() => {handleLogin()}}>
                            Valider
                        </button> */}
                    </div>
                    <p>{error}</p>
                </div>
            ) : !mdp_configured && !log_in ? (
            <div>
                <div className="flex flex-col gap-2">
                    <p>Configure ton mot de passe :</p>
                    <input type="password" className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2  focus:ring-red-500" placeholder="Entrez un mot de passe" onChange={(e) => setMdp(e.target.value)} />
                    <input type="password" className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2  focus:ring-red-500" placeholder="Confirmez le mot de passe" onChange={(e) => setMdpConf(e.target.value)} />
                    <button onClick={(e) => {e.preventDefault(); handleLogOn()}} className="rounded-md bg-red-800 px-4 py-2 text-white hover:bg-red-700" >
                        Valider
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
                <img src={panneauPereNoel} alt="Panneau du Père Noël" className="w-1/2 h-auto" />
                <p className="text-4xl font-semibold text-red-800 "> {beneficiaire}</p>
            </div>
        )}
        </div>
    );
}             

export default RevealPage;