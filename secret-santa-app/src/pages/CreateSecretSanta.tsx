import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSecretSanta } from "../api/events";
import type { Participant, Exclusion } from "../types";

function CreateSecretSantaPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [nameSecretSanta, setNameSecretSanta] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Met à jour l'état local et prévient le parent en une seule fois
  const update = (p: Participant[], e: Exclusion[]) => {
    setParticipants(p);
    setExclusions(e);
  };

  // --- Participants ---
  const addParticipant = (ev: React.FormEvent) => {
    ev.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Ce nom existe déjà.");
      return;
    }
    setError("");
    update([...participants, { id: Date.now(), name: trimmed }], exclusions);
    setName("");
  };

  const removeParticipant = (id: number) => {
    update(
      participants.filter((p) => p.id !== id),
      exclusions.filter(([a, b]) => a !== id && b !== id) // on retire aussi ses exclusions
    );
  };

  // --- Exclusions ---
  const isPair = (e: Exclusion, a: number, b: number) =>
    (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a);

  const hasExclusion = (a: number, b: number) => exclusions.some((e) => isPair(e, a, b));

  const addExclusion = (a: number, b: number) => {
    if (!hasExclusion(a, b)) update(participants, [...exclusions, [a, b]]);
  };

  const removeExclusion = (a: number, b: number) =>
    update(participants, exclusions.filter((e) => !isPair(e, a, b)));

  const excludedFor = (id: number) =>
    exclusions
      .filter((e) => e[0] === id || e[1] === id)
      .map((e) => (e[0] === id ? e[1] : e[0]));

  const nameOf = (id: number) => participants.find((p) => p.id === id)?.name ?? "?";

  const handleSubmit = async () => {
    if (!nameSecretSanta.trim()) return setError("Donnez un nom à l'événement.");
    if (participants.length < 3) return setError("Il faut au moins 3 participants.");

    setLoading(true);
    setError("");
    try {
      const event = await addSecretSanta(participants, exclusions, nameSecretSanta.trim());
      navigate(`/created/${event.id}`, { state: { nomgroupe: nameSecretSanta.trim(), key: event.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* Ajout */}
      <form onSubmit={addParticipant} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Nom du participant"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
        />
        <button
          type="submit"
          className="rounded-md bg-red-800 px-4 py-2 text-white hover:bg-red-700"
        >
          Ajouter
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* Liste + exclusions */}
      <ul className="space-y-3">
        {participants.map((p) => {
          const excluded = excludedFor(p.id);
          const available = participants.filter(
            (o) => o.id !== p.id && !hasExclusion(p.id, o.id)
          );

          return (
            <li key={p.id} className="rounded-md border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <button
                  type="button"
                  onClick={() => removeParticipant(p.id)}
                  className="text-sm text-red-700 hover:underline"
                >
                  Supprimer
                </button>
              </div>

              {participants.length > 1 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs text-gray-500">
                    Ne peut pas tirer / être tiré par :
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {excluded.map((otherId) => (
                      <span
                        key={otherId}
                        className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
                      >
                        {nameOf(otherId)}
                        <button
                          type="button"
                          onClick={() => removeExclusion(p.id, otherId)}
                          aria-label={`Retirer ${nameOf(otherId)}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}

                    {available.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => addExclusion(p.id, Number(e.target.value))}
                        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="" disabled>
                          + Ajouter
                        </option>
                        {available.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {participants.length > 0 && (
        <p className="text-sm text-gray-500">
          {participants.length} participant{participants.length > 1 ? "s" : ""},{" "}
          {exclusions.length} exclusion{exclusions.length > 1 ? "s" : ""}
        </p>
      )}
      <div>
      {participants.length >= 2 && (
        <div className="flex items-center gap-4">
          <input 
            type="text"
            value={nameSecretSanta}
            onChange={(e) => setNameSecretSanta(e.target.value)}
            placeholder="Nom de Secret Santa " className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700"
          />
          <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 self-center"
          >
            {loading ? "Création..." : "Lancer le tirage"}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export default CreateSecretSantaPage;