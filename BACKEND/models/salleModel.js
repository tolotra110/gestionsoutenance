const createCrudModel = require("./crudModel");

module.exports = createCrudModel({
    table: "salles",
    idColumn: "id_salle",
    fields: ["nom_salle", "capacite", "localisation", "equipement", "statut"],
    orderBy: "nom_salle",
    defaults: { statut: "disponible" },
});
