// Réponses d'erreur homogènes (codes d'erreur PostgreSQL -> messages lisibles)
const handleError = (res, error) => {
    if (error.code === "23505") return res.status(409).json({ message: "Cette valeur existe déjà (doublon)" });
    if (error.code === "23503") return res.status(409).json({ message: "Élément lié à d'autres données (suppression ou référence impossible)" });
    if (error.code === "23514" || error.code === "22P02" || error.code === "22007" || error.code === "22008") {
        return res.status(400).json({ message: "Données invalides" });
    }
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
};

// "" / espaces -> null ; sinon texte nettoyé
const texte = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === "" ? null : s;
};

// Date de naissance -> « AAAA-MM-JJ » ou null si absente / invalide.
// Accepte AAAA-MM-JJ (champ date du web), JJ/MM/AAAA ou JJ-MM-AAAA (saisie à la main, mobile)
// et le numéro de série Excel (cellule de date d'un fichier .xlsx importé).
const dateIso = (v) => {
    const s = texte(v);
    if (!s) return null;
    let a, m, j;
    let r;
    if ((r = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(s))) [, a, m, j] = r;
    else if ((r = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/.exec(s))) [, j, m, a] = r;
    else if (/^\d{5}$/.test(s)) {
        // numéro de série Excel : jours depuis le 30/12/1899
        const d = new Date(Date.UTC(1899, 11, 30) + Number(s) * 86400000);
        [a, m, j] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
    } else return null;

    a = Number(a); m = Number(m); j = Number(j);
    const d = new Date(Date.UTC(a, m - 1, j));
    const valide = d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j;
    if (!valide || a < 1900 || d > new Date()) return null;
    return `${String(a).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
};

// Numéro de téléphone : chiffres, espaces, + ( ) . - (6 à 30 caractères) ou null
const telephone = (v) => {
    const s = texte(v);
    return s && /^[+0-9 ().-]{6,30}$/.test(s) ? s : null;
};

module.exports = { handleError, texte, dateIso, telephone };
