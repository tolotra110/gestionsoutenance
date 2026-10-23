const pool = require("../Config/database");

const LOCK_PLANNING = 7001; // même verrou que la planification : pas de réinitialisation pendant une génération

// Réinitialisation complète : soutenances, étudiants de la mention, salles et évaluateurs.
// Les comptes utilisateurs, les mentions et les responsables ne sont PAS touchés.
// Tout est fait dans une transaction : en cas d'erreur, rien n'est supprimé.
const reinitialiser = async (idMention) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock($1)", [LOCK_PLANNING]);

        const soutenances = await client.query(
            `DELETE FROM soutenances s USING etudiants e
             WHERE e.id_etudiant = s.id_etudiant AND e.id_mention = $1`,
            [idMention]
        );
        const etudiants = await client.query("DELETE FROM etudiants WHERE id_mention = $1", [idMention]);
        const salles = await client.query("DELETE FROM salles");
        const evaluateurs = await client.query("DELETE FROM evaluateurs");

        await client.query("COMMIT");
        return {
            soutenances: soutenances.rowCount,
            etudiants: etudiants.rowCount,
            salles: salles.rowCount,
            evaluateurs: evaluateurs.rowCount,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { reinitialiser };
