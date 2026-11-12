import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    const joinSecretSanta = (ev: React.FormEvent) => {
        ev.preventDefault();
        const form = ev.target as HTMLFormElement;
        const input = form.elements.namedItem("eventId") as HTMLInputElement;
        const code = input.value.trim();
        if (code) {
            navigate(`/secret-santa/${code}`, { state: {key_groupe: code, nomgroupe: null } });
        }
    };

    return (
        <div>
            <div className="container mx-auto flex flex-col items-center justify-between p-24 space-y-6">
                <button className="rounded-md bg-red-800 px-4 py-2 text-white hover:bg-red-700" onClick={() => navigate("/create")}>Créer un Secret Santa</button>
                <div>
                    <form className="flex flex-col items-center gap-4" onSubmit={joinSecretSanta}>
                        <label htmlFor="eventId" className="text-lg font-semibold">Rejoindre un Secret Santa</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="eventId"
                                placeholder="Code du Secret Santa"
                                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <button type="submit" className="rounded-md bg-red-800 px-4 py-2 text-white hover:bg-red-700">Rejoindre</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default HomePage;