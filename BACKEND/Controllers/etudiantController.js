const model = require("../models/etudiantModel");
const crudController = require("./crudController");
const { handleError, texte, dateIso, telephone } = require("./_helpers");

const nettoyer = (d) => ({
    matricule: texte(d.matricule)?.toUpperCase() ?? null,
    nom: texte(d.nom),
    prenom: texte(d.prenom),
    telephone: telephone(d.telephone),
    date_naissance: dateIso(d.date_naissance),
    lieu_naissance: texte(d.lieu_naissance)?.slice(0, 100) ?? null,
    lieu_stage: texte(d.lieu_stage) ?? '',
    theme: texte(d.theme) ?? '',
    description: texte(d.description) ?? '',
    technologies: texte(d.technologies) ?? '',
});

const crud = crudController({
    model,
    label: "Étudiant",
    required: ["matricule", "nom", "prenom"],
    prepare: nettoyer,
    scoped: true,
});

const importer = async (req, res) => {
    try {
        const lignes = req.body?.etudiants;
        if (!Array.isArray(lignes) || lignes.length === 0) {
            return res.status(400).json({ message: "Aucun étudiant à importer" });
        }
        if (lignes.length > 2000) return res.status(400).json({ message: "Import limité à 2000 lignes" });

        const valides = [];
        const erreurs = [];
        lignes.forEach((l, i) => {
            const d = nettoyer(l || {});
            if (!d.matricule || !d.nom || !d.prenom) {
                erreurs.push({ ligne: i + 1, matricule: d.matricule, message: "Matricule, nom et prénom obligatoires" });
            } else {
                valides.push(d);
            }
        });

        const bilan = await model.importer(valides, req.mention.id_mention);
        bilan.erreurs = [...erreurs, ...bilan.erreurs];
        res.json(bilan);
    } catch (e) {
        handleError(res, e);
    }
};

const removeAll = async (req, res) => {
    try {
        const supprimes = await model.removeAll(req.mention.id_mention);
        res.json({ message: `${supprimes} étudiant(s) supprimé(s)`, supprimes });
    } catch (e) {
        handleError(res, e);
    }
};

module.exports = { ...crud, importer, removeAll };
