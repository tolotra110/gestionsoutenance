import { API_URL } from "./config";

async function appeler(chemin, options) {
    let res;
    try {
        res = await fetch(`${API_URL}/api/mobile${chemin}`, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });
    } catch {
        throw new Error("Serveur injoignable. Vérifiez votre connexion et l'adresse du serveur.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Une erreur est survenue");
    return data;
}

export const getParcours = () => appeler("/parcours");
export const getFiche = (matricule) => appeler(`/etudiant/${encodeURIComponent(matricule.trim())}`);
export const getPlanning = (matricule) => appeler(`/planning/${encodeURIComponent(matricule.trim())}`);
export const envoyerFiche = (fiche) => appeler("/etudiant", { method: "POST", body: JSON.stringify(fiche) });
