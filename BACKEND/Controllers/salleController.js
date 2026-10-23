const model = require("../models/salleModel");
const crudController = require("./crudController");
const { texte } = require("./_helpers");

module.exports = crudController({
    model,
    label: "Salle",
    required: ["nom_salle"],
    prepare: (d) => {
        const capacite = parseInt(d.capacite, 10);
        return {
            nom_salle: texte(d.nom_salle),
            capacite: Number.isInteger(capacite) && capacite > 0 ? capacite : null,
            localisation: texte(d.localisation),
            equipement: texte(d.equipement),
            statut: d.statut === "indisponible" ? "indisponible" : "disponible",
        };
    },
});
