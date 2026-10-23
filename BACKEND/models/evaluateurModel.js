const createCrudModel = require("./crudModel");

module.exports = createCrudModel({
    table: "evaluateurs",
    idColumn: "id_evaluateur",
    fields: ["nom", "prenom", "specialite", "email", "telephone", "disponibilite", "statut", "id_mention"],
    scopeColumn: "id_mention", // un responsable ne gère que les évaluateurs de sa mention
    orderBy: "nom, prenom",
    defaults: { statut: "disponible" },
});
