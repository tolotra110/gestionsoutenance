const model = require("../models/rapportModel");
const resultats = require("../models/resultatsModel");
const { assurerProfilEvaluateur } = require("../models/utilisateurModel");
const { handleError } = require("./_helpers");

const DECISIONS = ["ADMIS", "AJOURNE"];

const estEvaluateur = (req) =>
    String(req.user?.role || "").trim().toLowerCase() === "evaluateur";

const list = async (req, res) => {
    try {
        if (!estEvaluateur(req)) {
            return res.status(403).json({ message: "Accès réservé aux évaluateurs" });
        }
        await assurerProfilEvaluateur(req.user.id_utilisateur).catch((e) => console.error("Profil évaluateur :", e.message));
        res.json(await model.list(req.user.id_utilisateur));
    } catch (e) {
        handleError(res, e);
    }
};

const show = async (req, res) => {
    try {
        if (!estEvaluateur(req)) {
            return res.status(403).json({ message: "Accès réservé aux évaluateurs" });
        }
        const row = await model.getById(Number(req.params.id), req.user.id_utilisateur);
        if (!row) return res.status(404).json({ message: "Rapport introuvable" });
        res.json(row);
    } catch (e) {
        handleError(res, e);
    }
};

const validerSoumission = (d) => {
    if (!DECISIONS.includes(d.decision)) {
        return "Décision invalide (ADMIS ou AJOURNE)";
    }
    const note = Number(d.note);
    if (d.note === null || d.note === undefined || d.note === "" || Number.isNaN(note) || note < 0 || note > 20) {
        return "La note doit être comprise entre 0 et 20";
    }
    return null;
};

const update = async (req, res) => {
    try {
        if (!estEvaluateur(req)) {
            return res.status(403).json({ message: "Accès réservé aux évaluateurs" });
        }
        const id = Number(req.params.id);
        const d = req.body || {};
        // Brouillon : décision, mention et note sont facultatives, mais doivent être valides si elles sont données
        if (d.decision && !DECISIONS.includes(d.decision)) {
            return res.status(400).json({ message: "Décision invalide (ADMIS ou AJOURNE)" });
        }
        if (d.note !== null && d.note !== undefined && d.note !== "") {
            const n = Number(d.note);
            if (Number.isNaN(n) || n < 0 || n > 20) {
                return res.status(400).json({ message: "La note doit être comprise entre 0 et 20" });
            }
        }
        const row = await model.update(id, d, req.user.id_utilisateur);
        if (!row) {
            const existant = await model.getById(id, req.user.id_utilisateur);
            if (!existant) return res.status(404).json({ message: "Rapport introuvable" });
            return res.status(409).json({ message: "Rapport soumis : lecture seule" });
        }
        res.json(row);
    } catch (e) {
        handleError(res, e);
    }
};

const soumettre = async (req, res) => {
    try {
        if (!estEvaluateur(req)) {
            return res.status(403).json({ message: "Accès réservé aux évaluateurs" });
        }
        const id = Number(req.params.id);
        const erreur = validerSoumission(req.body || {});
        if (erreur) return res.status(400).json({ message: erreur });

        const row = await model.soumettre(id, req.body, req.user.id_utilisateur);
        if (!row) {
            const existant = await model.getById(id, req.user.id_utilisateur);
            if (!existant) return res.status(404).json({ message: "Rapport introuvable" });
            return res.status(409).json({ message: "Rapport déjà soumis" });
        }
        res.json(row);
    } catch (e) {
        handleError(res, e);
    }
};

// Données du procès-verbal d'un rapport soumis (l'évaluateur télécharge le PV de son étudiant)
const pv = async (req, res) => {
    try {
        if (!estEvaluateur(req)) {
            return res.status(403).json({ message: "Accès réservé aux évaluateurs" });
        }
        const row = await resultats.pvRapport(Number(req.params.id), req.user.id_utilisateur);
        if (!row) return res.status(404).json({ message: "Le PV est disponible une fois le rapport soumis" });
        res.json(row);
    } catch (e) {
        handleError(res, e);
    }
};

module.exports = { list, show, update, soumettre, pv };
