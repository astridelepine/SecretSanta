const BASE = import.meta.env.VITE_API_URL;

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Erreur API");
  return res.json();
}