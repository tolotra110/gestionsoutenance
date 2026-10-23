const model = require("../models/evaluateurModel");
const crudController = require("./crudController");
const { texte } = require("./_helpers");
const { synchroniserProfilsMention } = require("../models/utilisateurModel");

const base = crudController({
    model,
    label: "Évaluateur",
    required: ["nom", "prenom"],
    scoped: true,
    prepare: (d) => ({
        nom: texte(d.nom),
        prenom: texte(d.prenom),
        specialite: texte(d.specialite),
        email: texte(d.email)?.toLowerCase() ?? null,
        telephone: texte(d.telephone),
        disponibilite: texte(d.disponibilite),
        statut: d.statut === "indisponible" ? "indisponible" : "disponible",
    }),
});

// Avant d'afficher la liste, rattache les comptes évaluateurs de la mention qui n'ont pas encore de fiche
module.exports = {
    ...base,
    list: async (req, res) => {
        try {
            await synchroniserProfilsMention(req.mention.code_mention);
        } catch (e) {
            console.error("Synchronisation des évaluateurs :", e.message);
        }
        return base.list(req, res);
    },
};
