const pool = require("../Config/database");

const LOCK_PLANNING = 7001; // verrou applicatif : un seul planificateur à la fois (évite les doubles réservations)

const SELECT = `
    SELECT s.id_soutenance,
           to_char(s.date_soutenance, 'YYYY-MM-DD') AS date_soutenance,
           to_char(s.heure_debut, 'HH24:MI') AS heure_debut,
           to_char(s.heure_fin, 'HH24:MI') AS heure_fin,
           s.statut,
           s.theme,
           e.theme AS theme_etudiant,
           e.id_etudiant, e.matricule, e.nom AS etudiant_nom, e.prenom AS etudiant_prenom,
           m.code_mention AS parcours,
           sa.id_salle, sa.nom_salle, sa.localisation,
           ev.id_evaluateur, ev.nom AS evaluateur_nom, ev.prenom AS evaluateur_prenom,
           COALESCE((SELECT json_agg(json_build_object('nom', jm.nom, 'role', jm.role))
                     FROM jury_membres jm WHERE jm.id_soutenance = s.id_soutenance),
                    '[]'::json) AS jury
    FROM soutenances s
    JOIN etudiants e ON e.id_etudiant = s.id_etudiant
    JOIN mentions m ON m.id_mention = e.id_mention
    JOIN salles sa ON sa.id_salle = s.id_salle
    JOIN evaluateurs ev ON ev.id_evaluateur = s.id_evaluateur`;

const list = async (idMention) => {
    const result = await pool.query(
        `${SELECT} WHERE e.id_mention = $1 ORDER BY s.date_soutenance, s.heure_debut, sa.nom_salle`,
        [idMention]
    );
    return result.rows;
};

const getById = async (id, idMention, db = pool) => {
    const result = await db.query(`${SELECT} WHERE s.id_soutenance = $1 AND e.id_mention = $2`, [id, idMention]);
    return result.rows[0];
};

// Transaction + verrou : fn reçoit un client dédié
const avecVerrou = async (fn) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock($1)", [LOCK_PLANNING]);
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

// Soutenances qui se chevauchent (même date) sur la salle, l'évaluateur ou l'étudiant
const trouverConflits = async (db, { date, debut, fin, id_salle, id_evaluateur, id_etudiant, excludeId = 0 }) => {
    const result = await db.query(
        `SELECT (s.id_salle = $4) AS salle, (s.id_evaluateur = $5) AS evaluateur, (s.id_etudiant = $6) AS etudiant,
                to_char(s.heure_debut, 'HH24:MI') AS heure_debut, to_char(s.heure_fin, 'HH24:MI') AS heure_fin,
                e.nom || ' ' || e.prenom AS etudiant_nom
         FROM soutenances s JOIN etudiants e ON e.id_etudiant = s.id_etudiant
         WHERE s.date_soutenance = $1 AND s.heure_debut < $3::time AND s.heure_fin > $2::time
           AND s.statut <> 'annulee' AND s.id_soutenance <> $7
           AND (s.id_salle = $4 OR s.id_evaluateur = $5 OR s.id_etudiant = $6)`,
        [date, debut, fin, id_salle, id_evaluateur, id_etudiant, excludeId]
    );
    return result.rows;
};

const insert = async (db, d, idResponsable) => {
    const result = await db.query(
        `INSERT INTO soutenances
            (date_soutenance, heure_debut, heure_fin, statut, id_etudiant, id_salle, id_evaluateur, id_responsable, theme)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_soutenance`,
        [d.date_soutenance, d.heure_debut, d.heure_fin, d.statut || "planifiee", d.id_etudiant, d.id_salle, d.id_evaluateur, idResponsable, d.theme]
    );
    return result.rows[0].id_soutenance;
};

const update = async (db, id, d) => {
    await db.query(
        `UPDATE soutenances
         SET date_soutenance = $1, heure_debut = $2, heure_fin = $3, statut = $4,
             id_etudiant = $5, id_salle = $6, id_evaluateur = $7, theme = $8
         WHERE id_soutenance = $9`,
        [d.date_soutenance, d.heure_debut, d.heure_fin, d.statut || "planifiee", d.id_etudiant, d.id_salle, d.id_evaluateur, d.theme, id]
    );
};

const remove = async (id, idMention) => {
    const result = await pool.query(
        `DELETE FROM soutenances s USING etudiants e
         WHERE s.id_soutenance = $1 AND e.id_etudiant = s.id_etudiant AND e.id_mention = $2
         RETURNING s.id_soutenance`,
        [id, idMention]
    );
    return result.rows[0];
};

const getResponsableId = async (idUtilisateur, idMention, db = pool) => {
    const result = await db.query(
        "SELECT id_responsable FROM responsables_mention WHERE id_utilisateur = $1 AND id_mention = $2",
        [idUtilisateur, idMention]
    );
    return result.rows[0]?.id_responsable ?? null;
};

// Données nécessaires à la génération automatique
const donneesGeneration = async (db, idMention, dateDebut) => {
    const [etudiants, salles, evaluateurs, existantes] = await Promise.all([
        db.query(
            `SELECT e.id_etudiant FROM etudiants e
             WHERE e.id_mention = $1 AND NOT EXISTS (SELECT 1 FROM soutenances s WHERE s.id_etudiant = e.id_etudiant)
             ORDER BY e.nom, e.prenom`,
            [idMention]
        ),
        db.query("SELECT id_salle FROM salles WHERE statut = 'disponible' ORDER BY nom_salle"),
        db.query("SELECT id_evaluateur FROM evaluateurs WHERE statut = 'disponible' AND id_mention = $1 ORDER BY nom, prenom", [idMention]),
        db.query(
            `SELECT to_char(date_soutenance, 'YYYY-MM-DD') AS date_soutenance,
                    to_char(heure_debut, 'HH24:MI') AS heure_debut, to_char(heure_fin, 'HH24:MI') AS heure_fin,
                    id_salle, id_evaluateur
             FROM soutenances WHERE statut <> 'annulee' AND date_soutenance >= $1`,
            [dateDebut]
        ),
    ]);
    return {
        etudiants: etudiants.rows,
        salles: salles.rows,
        evaluateurs: evaluateurs.rows,
        existantes: existantes.rows,
    };
};

// Profil évaluateur rattaché à un compte utilisateur (JWT)
const getEvaluateurByUtilisateur = async (idUtilisateur) => {
    const result = await pool.query(
        "SELECT id_evaluateur, id_utilisateur, nom, prenom, specialite, email, telephone, disponibilite, statut FROM evaluateurs WHERE id_utilisateur = $1",
        [idUtilisateur]
    );
    return result.rows[0];
};

// Soutenances assignées à un évaluateur (espace évaluateur)
const getMesSoutenances = async (idEvaluateur) => {
    const result = await pool.query(
        `${SELECT} WHERE ev.id_evaluateur = $1 ORDER BY s.date_soutenance, s.heure_debut, sa.nom_salle`,
        [idEvaluateur]
    );
    return result.rows;
};

const getEtudiantMention = async (db, id) =>
    (await db.query("SELECT id_etudiant, id_mention FROM etudiants WHERE id_etudiant = $1", [id])).rows[0];
const getSalle = async (db, id) =>
    (await db.query("SELECT id_salle, nom_salle, statut FROM salles WHERE id_salle = $1", [id])).rows[0];
const getEvaluateur = async (db, id) =>
    (await db.query("SELECT id_evaluateur, id_mention, nom, prenom, statut FROM evaluateurs WHERE id_evaluateur = $1", [id])).rows[0];

// Planning visible par l'étudiant (application mobile) : aucune donnée personnelle superflue
const getPlanningEtudiant = async (idEtudiant) => {
    const result = await pool.query(
        `SELECT to_char(s.date_soutenance, 'YYYY-MM-DD') AS date_soutenance,
                to_char(s.heure_debut, 'HH24:MI') AS heure_debut, to_char(s.heure_fin, 'HH24:MI') AS heure_fin,
                s.statut, sa.nom_salle, sa.localisation,
                ev.nom AS evaluateur_nom, ev.prenom AS evaluateur_prenom
         FROM soutenances s
         JOIN salles sa ON sa.id_salle = s.id_salle
         JOIN evaluateurs ev ON ev.id_evaluateur = s.id_evaluateur
         WHERE s.id_etudiant = $1`,
        [idEtudiant]
    );
    return result.rows[0] || null;
};

const statistiques = async (idMention) => {
    const q = (sql, params = [idMention]) => pool.query(sql, params).then((r) => r.rows);
    const [[tot], parJour, parSalle, parEvaluateur, [ressources]] = await Promise.all([
        q(
            `SELECT COUNT(*)::int AS etudiants,
                    COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM soutenances s WHERE s.id_etudiant = e.id_etudiant AND s.statut <> 'annulee'))::int AS planifies
             FROM etudiants e WHERE e.id_mention = $1`
        ),
        q(
            `SELECT to_char(s.date_soutenance, 'YYYY-MM-DD') AS date, COUNT(*)::int AS total
             FROM soutenances s JOIN etudiants e ON e.id_etudiant = s.id_etudiant
             WHERE e.id_mention = $1 AND s.statut <> 'annulee' GROUP BY 1 ORDER BY 1`
        ),
        q(
            `SELECT sa.nom_salle AS nom, COUNT(*)::int AS total
             FROM soutenances s JOIN etudiants e ON e.id_etudiant = s.id_etudiant JOIN salles sa ON sa.id_salle = s.id_salle
             WHERE e.id_mention = $1 AND s.statut <> 'annulee' GROUP BY 1 ORDER BY total DESC, 1`
        ),
        q(
            `SELECT ev.nom || ' ' || ev.prenom AS nom, COUNT(*)::int AS total
             FROM soutenances s JOIN etudiants e ON e.id_etudiant = s.id_etudiant JOIN evaluateurs ev ON ev.id_evaluateur = s.id_evaluateur
             WHERE e.id_mention = $1 AND s.statut <> 'annulee' GROUP BY 1 ORDER BY total DESC, 1`
        ),
        q(
            `SELECT (SELECT COUNT(*)::int FROM salles) AS salles,
                    (SELECT COUNT(*)::int FROM evaluateurs WHERE id_mention = $1) AS evaluateurs`
        ),
    ]);
    return {
        etudiants: tot.etudiants,
        planifies: tot.planifies,
        non_planifies: tot.etudiants - tot.planifies,
        salles: ressources.salles,
        evaluateurs: ressources.evaluateurs,
        par_jour: parJour,
        par_salle: parSalle,
        par_evaluateur: parEvaluateur,
    };
};

const mettreAJourPublicationPlanning = async (idMention, publie) => {
    const result = await pool.query(
        `UPDATE soutenances s
         SET publie = $1
         WHERE s.id_etudiant IN (SELECT id_etudiant FROM etudiants WHERE id_mention = $2)`,
        [publie, idMention]
    );
    return result.rowCount;
};

// Indique si le planning de la mention est publié (au moins une soutenance publiée).
const estPublie = async (idMention) => {
    const result = await pool.query(
        `SELECT COALESCE(bool_and(publie), false) AS publie
         FROM soutenances s
         JOIN etudiants e ON e.id_etudiant = s.id_etudiant
         WHERE e.id_mention = $1`,
        [idMention]
    );
    return Boolean(result.rows[0]?.publie);
};

module.exports = {
    list, getById, avecVerrou, trouverConflits, insert, update, remove, getResponsableId,
    donneesGeneration, getEtudiantMention, getSalle, getEvaluateur, getPlanningEtudiant, statistiques,
    mettreAJourPublicationPlanning, estPublie, getEvaluateurByUtilisateur, getMesSoutenances,
};
