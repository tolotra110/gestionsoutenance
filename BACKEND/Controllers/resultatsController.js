const model = require("../models/resultatsModel");
const { handleError } = require("./_helpers");

// Liste des résultats de la mention de l'utilisateur connecté
// (req.mention est chargée par le middleware requireMention).
const list = async (req, res) => {
    try {
        res.json(await model.list(req.mention.id_mention));
    } catch (e) {
        handleError(res, e);
    }
};

// Décisions des évaluateurs sur les thèmes (étudiants de la mention connectée)
const themes = async (req, res) => {
    try {
        res.json(await model.listThemes(req.mention.id_mention));
    } catch (e) {
        if (e.code === "42703") {
            return res.status(500).json({ message: "Colonnes manquantes : exécutez migrations/015_Add_Theme_Validation_Etudiants.sql" });
        }
        handleError(res, e);
    }
};

// Données des procès-verbaux de soutenance (rapports soumis de la mention connectée)
const pv = async (req, res) => {
    try {
        res.json(await model.listPv(req.mention.id_mention));
    } catch (e) {
        handleError(res, e);
    }
};

// Mémorise le lieu de naissance d'un étudiant pour le PV
const lieuNaissance = async (req, res) => {
    try {
        const lieu = String(req.body?.lieu_naissance ?? "").trim().slice(0, 100);
        const ok = await model.setLieuNaissance(req.mention.id_mention, Number(req.params.idEtudiant), lieu || null);
        if (!ok) return res.status(404).json({ message: "Étudiant introuvable dans votre mention" });
        res.json({ message: "Lieu de naissance enregistré" });
    } catch (e) {
        if (e.code === "42703") {
            return res.status(500).json({ message: "Colonne manquante : exécutez migrations/016_Add_Lieu_Naissance_Etudiants.sql" });
        }
        handleError(res, e);
    }
};

module.exports = { list, themes, pv, lieuNaissance };
