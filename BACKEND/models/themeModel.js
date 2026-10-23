const pool = require("../Config/database");

// Étudiants de la mention de l'évaluateur avec le thème déposé et la décision éventuelle
const list = async (codeMention) => {
    const result = await pool.query(
        `SELECT e.id_etudiant, e.matricule, e.nom, e.prenom,
                m.code_mention AS parcours,
                e.theme, e.description, e.technologies, e.lieu_stage,
                e.theme_statut, e.theme_commentaire,
                to_char(e.theme_date_decision, 'YYYY-MM-DD"T"HH24:MI:SS') AS theme_date_decision
         FROM etudiants e
         JOIN mentions m ON m.id_mention = e.id_mention
         WHERE m.code_mention = $1
         ORDER BY e.nom, e.prenom`,
        [codeMention]
    );
    return result.rows;
};

// Enregistre la décision de l'évaluateur (uniquement si l'étudiant a déposé un thème)
const decider = async (idEtudiant, statut, commentaire, idUtilisateur, codeMention) => {
    const result = await pool.query(
        `UPDATE etudiants
         SET theme_statut = $2, theme_commentaire = $3, theme_date_decision = NOW(), theme_decide_par = $4
         WHERE id_etudiant = $1 AND theme IS NOT NULL AND btrim(theme) <> ''
           AND id_mention = (SELECT id_mention FROM mentions WHERE code_mention = $5)
         RETURNING id_etudiant`,
        [idEtudiant, statut, commentaire, idUtilisateur, codeMention]
    );
    return result.rows[0];
};

module.exports = { list, decider };
