const pool = require("../Config/database");

const COLONNES = `id_rapport AS id, id_soutenance, statut,
                  decision, mention, note::float AS note, cree_le, maj_le, soumis_le`;

// Crée les rapports manquants pour les soutenances assignées à l'évaluateur
const assurerRapports = async (idUtilisateur) => {
    await pool.query(
        `INSERT INTO rapports (id_soutenance, id_evaluateur, statut)
         SELECT s.id_soutenance, $1, 'A_REDIGER'
         FROM soutenances s
         JOIN evaluateurs ev ON ev.id_evaluateur = s.id_evaluateur
         WHERE ev.id_utilisateur = $1
         ON CONFLICT (id_soutenance, id_evaluateur) DO NOTHING`,
        [idUtilisateur]
    );
};

const list = async (idUtilisateur) => {
    await assurerRapports(idUtilisateur);
    const result = await pool.query(
        `SELECT ${COLONNES} FROM rapports WHERE id_evaluateur = $1 ORDER BY id_soutenance`,
        [idUtilisateur]
    );
    return result.rows;
};

const getById = async (id, idUtilisateur) => {
    const result = await pool.query(
        `SELECT ${COLONNES} FROM rapports WHERE id_rapport = $1 AND id_evaluateur = $2`,
        [id, idUtilisateur]
    );
    return result.rows[0];
};

// Enregistrement d'un brouillon : décision, mention et note (interdit si déjà soumis)
const update = async (id, donnees, idUtilisateur) => {
    const result = await pool.query(
        `UPDATE rapports
         SET decision = $1, mention = $2, note = $3, maj_le = NOW(), statut = 'EN_COURS'
         WHERE id_rapport = $4 AND id_evaluateur = $5 AND statut <> 'SOUMIS'
         RETURNING ${COLONNES}`,
        [
            donnees.decision || null,
            donnees.mention || null,
            donnees.note === "" || donnees.note === undefined ? null : donnees.note,
            id,
            idUtilisateur,
        ]
    );
    return result.rows[0];
};

// Soumission : décision + note + mention (calculée si absente)
const soumettre = async (id, donnees, idUtilisateur) => {
    const result = await pool.query(
        `UPDATE rapports
         SET decision = $1,
             mention = COALESCE(NULLIF($2, ''),
                 CASE WHEN $3 >= 18 THEN 'Excellent'
                      WHEN $3 >= 16 THEN 'Très bien'
                      WHEN $3 >= 14 THEN 'Bien'
                      WHEN $3 >= 12 THEN 'Assez bien'
                      WHEN $3 >= 10 THEN 'Passable'
                      ELSE 'Insuffisant' END),
             note = $3, statut = 'SOUMIS', maj_le = NOW(), soumis_le = NOW()
         WHERE id_rapport = $4 AND id_evaluateur = $5 AND statut <> 'SOUMIS'
         RETURNING ${COLONNES}`,
        [
            donnees.decision,
            donnees.mention ?? "",
            donnees.note,
            id,
            idUtilisateur,
        ]
    );
    return result.rows[0];
};

module.exports = { list, getById, update, soumettre };
