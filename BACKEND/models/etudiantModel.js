const pool = require("../Config/database");
const createCrudModel = require("./crudModel");

const crud = createCrudModel({
    table: "etudiants",
    idColumn: "id_etudiant",
    fields: ["matricule", "nom", "prenom", "telephone", "date_naissance", "lieu_naissance", "lieu_stage", "theme", "description", "technologies", "id_mention"],
    orderBy: "nom, prenom",
    scopeColumn: "id_mention",
    // date renvoyée en texte AAAA-MM-JJ (évite le décalage de fuseau horaire du type DATE)
    selectExpr: { date_naissance: "to_char(date_naissance, 'YYYY-MM-DD')" },
});

// Import en masse (CSV) : crée ou met à jour par matricule, uniquement dans la mention donnée.
const importer = async (lignes, idMention) => {
    const client = await pool.connect();
    const bilan = { crees: 0, mis_a_jour: 0, erreurs: [] };
    try {
        await client.query("BEGIN");
        for (const [index, l] of lignes.entries()) {
            await client.query("SAVEPOINT ligne");
            try {
                const result = await client.query(
                    `INSERT INTO etudiants (matricule, nom, prenom, lieu_stage, theme, description, technologies, id_mention, telephone, date_naissance, lieu_naissance)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     ON CONFLICT (matricule) DO UPDATE
                        SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom,
                            -- fichier sans colonne téléphone / date et lieu de naissance : on garde ce que l'étudiant a saisi sur le mobile
                            telephone = COALESCE(EXCLUDED.telephone, etudiants.telephone),
                            date_naissance = COALESCE(EXCLUDED.date_naissance, etudiants.date_naissance),
                            lieu_naissance = COALESCE(EXCLUDED.lieu_naissance, etudiants.lieu_naissance),
                            lieu_stage = EXCLUDED.lieu_stage, theme = EXCLUDED.theme,
                            description = EXCLUDED.description,
                            technologies = EXCLUDED.technologies
                        WHERE etudiants.id_mention = EXCLUDED.id_mention
                     RETURNING (xmax = 0) AS insere`,
                    [l.matricule, l.nom, l.prenom, l.lieu_stage, l.theme, l.description, l.technologies, idMention, l.telephone, l.date_naissance, l.lieu_naissance]
                );
                if (result.rowCount === 0) {
                    bilan.erreurs.push({ ligne: index + 1, matricule: l.matricule, message: "Matricule d'une autre mention" });
                } else if (result.rows[0].insere) {
                    bilan.crees++;
                } else {
                    bilan.mis_a_jour++;
                }
            } catch (err) {
                await client.query("ROLLBACK TO SAVEPOINT ligne");
                console.error(`[IMPORT ERROR] ligne ${index + 1}:`, err.code, err.message, err.detail);
                bilan.erreurs.push({
                    ligne: index + 1,
                    matricule: l.matricule,
                    message: err.code === "23505" ? "Matricule déjà utilisé" : `Ligne invalide (${err.code})`,
                });
            }
        }
        await client.query("COMMIT");
        return bilan;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

// Supprime TOUS les étudiants de la mention (leurs soutenances partent avec, ON DELETE CASCADE)
const removeAll = async (idMention) => {
    const result = await pool.query("DELETE FROM etudiants WHERE id_mention = $1", [idMention]);
    return result.rowCount;
};

const getByMatricule = async (matricule) => {
    const result = await pool.query(
        `SELECT e.id_etudiant, e.matricule, e.nom, e.prenom, m.nom_mention
         FROM etudiants e JOIN mentions m ON m.id_mention = e.id_mention
         WHERE UPPER(e.matricule) = UPPER($1)`,
        [matricule]
    );
    return result.rows[0];
};

module.exports = { ...crud, importer, removeAll, getByMatricule };
