const model = require("../models/themeModel");
const { handleError } = require("./_helpers");
const { PARCOURS_VERS_MENTION } = require("../Middleware/mentionMiddleware");

const DECISIONS = ["VALIDE", "MODIFICATIONS", "REJETE"];

// Espace évaluateur uniquement
const reserverEvaluateur = (req, res) => {
    if (String(req.user?.role || "").trim().toLowerCase() !== "evaluateur") {
        res.status(403).json({ message: "Accès réservé aux évaluateurs" });
        return false;
    }
    return true;
};

// Mention (INFO, MNGT, COMM) de l'évaluateur, d'après le parcours choisi à l'inscription
const mentionEvaluateur = (req, res) => {
    const code = PARCOURS_VERS_MENTION[String(req.user?.parcours || "").trim().toUpperCase()];
    if (!code) res.status(403).json({ message: "Parcours de l'évaluateur inconnu" });
    return code;
};

const erreurBase = (res, e) => {
    if (e.code === "42703") {
        return res.status(500).json({ message: "Colonnes manquantes : exécutez migrations/015_Add_Theme_Validation_Etudiants.sql" });
    }
    return handleError(res, e);
};

const list = async (req, res) => {
    try {
        if (!reserverEvaluateur(req, res)) return;
        const code = mentionEvaluateur(req, res);
        if (!code) return;
        res.json(await model.list(code));
    } catch (e) {
        erreurBase(res, e);
    }
};

const decider = async (req, res) => {
    try {
        if (!reserverEvaluateur(req, res)) return;

        const code = mentionEvaluateur(req, res);
        if (!code) return;

        const id = Number(req.params.id);
        const decision = String(req.body?.decision || "");
        const commentaire = String(req.body?.commentaire || "").trim();

        if (!Number.isInteger(id)) return res.status(400).json({ message: "Étudiant invalide" });
        if (!DECISIONS.includes(decision)) return res.status(400).json({ message: "Décision inconnue" });
        // Le commentaire est facultatif : s'il existe, l'étudiant le voit dans l'application mobile

        const row = await model.decider(id, decision, commentaire || null, req.user.id_utilisateur, code);
        if (!row) return res.status(404).json({ message: "Étudiant introuvable dans votre parcours ou thème non déposé" });
        res.json({ message: "Décision enregistrée" });
    } catch (e) {
        erreurBase(res, e);
    }
};

module.exports = { list, decider };
