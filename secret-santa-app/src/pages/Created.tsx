import { useLocation, useParams, useNavigate} from "react-router-dom";

function CreatedPage() {
  const code = useParams<{ id: string }>().id;
  const { state } = useLocation();   // peut être null
  const nomgroupe = state?.nomgroupe;
  const navigate = useNavigate();
    return (
        <div className="container mx-auto flex flex-col items-center space-y-4">
            <h1 className="text-4xl">{nomgroupe} a été créé !</h1>
            <p className="text-2xl font-semibold text-red-800">Code d'accès : {code}</p>
            <p className="font-bold text-center text-gray-500">Partagez ce code avec vos amis pour qu'ils puissent consulter leur secret santa.</p>
            <button onClick={() => navigate(`/secret-santa/${code}`, { state: { nomgroupe:nomgroupe, key_groupe: code } })} className="rounded-md bg-red-800 px-4 py-2 text-white hover:bg-red-700">Consulte ton secret santa</button>
        </div>
    );
}

export default CreatedPage;