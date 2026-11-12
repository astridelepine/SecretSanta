import grinch from "@/assets/Le_Grinch.webp";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-semibold text-red-800 text-center">Secret Santa inconnu</h1>
            <div className="flex space-x-2">
                <button onClick={() => navigate(`/`)} className=" text-lg text-red-800 hover:text-red-700 align-center">Réessayer</button>
            </div>
            <img src={grinch} alt="404 Not Found" className="w-1/2 h-auto" />
        </div>
    );
}

export default NotFoundPage;