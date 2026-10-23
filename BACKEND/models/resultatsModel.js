const pool = require("../Config/database");

// Résultats d'une mention : rapports de jury (tous statuts,
// la soumission est le résultat à proprement parler) avec le
// contexte complet de la soutenance.
const SELECT = `
    SELECT r.id_rapport, r.id_soutenance, r.id_evaluateur,
           r.statut, r.decision, r.mention, r.note,
           to_char(r.soumis_le, 'YYYY-MM-DD') AS soumis_le,
           COALESCE(NULLIF(btrim(s.theme), ''), e.theme) AS theme,
           to_char(s.date_soutenance, 'YYYY-MM-DD') AS date_soutenance,
           to_char(s.heure_debut, 'HH24:MI') AS heure_debut,
           e.id_etudiant, e.matricule, e.nom AS etudiant_nom, e.prenom AS etudiant_prenom,
           m.code_mention AS parcours,
           COALESCE(ev.nom, u.nom) AS evaluateur_nom, COALESCE(ev.prenom, '') AS evaluateur_prenom,
           sa.id_salle, sa.nom_salle, sa.localisation
    FROM rapports r
    JOIN soutenances s  ON s.id_soutenance = r.id_soutenance
    JOIN etudiants e    ON e.id_etudiant   = s.id_etudiant
    JOIN mentions m     ON m.id_mention    = e.id_mention
    -- rapports.id_evaluateur référence utilisateurs (compte de l'évaluateur), pas evaluateurs
    LEFT JOIN utilisateurs u  ON u.id_utilisateur  = r.id_evaluateur
    LEFT JOIN evaluateurs ev  ON ev.id_utilisateur = r.id_evaluateur
    LEFT JOIN salles sa       ON sa.id_salle       = s.id_salle
    WHERE e.id_mention = $1
    ORDER BY s.date_soutenance DESC, s.heure_debut DESC, r.id_rapport`;

const list = async (idMention) => {
    const result = await pool.query(SELECT, [idMention]);
    return result.rows;
};

// Décisions des évaluateurs sur les thèmes des étudiants de la mention
const listThemes = async (idMention) => {
    const result = await pool.query(
        `SELECT e.id_etudiant, e.matricule, e.nom, e.prenom, e.lieu_stage,
                e.theme, e.description, e.technologies,
                e.theme_statut,
                to_char(e.theme_date_decision, 'YYYY-MM-DD"T"HH24:MI:SS') AS theme_date_decision,
                u.nom AS decide_par
         FROM etudiants e
         LEFT JOIN utilisateurs u ON u.id_utilisateur = e.theme_decide_par
         WHERE e.id_mention = $1
         ORDER BY e.theme_date_decision DESC NULLS LAST, e.nom, e.prenom`,
        [idMention]
    );
    return result.rows;
};

// Procès-verbaux : un PV par rapport SOUMIS (note + décision + évaluateur).
// lieu_naissance vient de la migration 016 ; si elle n'est pas exécutée,
// on relance la requête sans cette colonne (le PV reste utilisable).
const FILTRE_MENTION = `WHERE e.id_mention = $1 AND r.statut = 'SOUMIS' AND r.note IS NOT NULL
    ORDER BY e.nom, e.prenom`;
const FILTRE_RAPPORT = `WHERE r.id_rapport = $1 AND r.id_evaluateur = $2 AND r.statut = 'SOUMIS' AND r.note IS NOT NULL`;

const pvSelect = (avecLieu, filtre = FILTRE_MENTION) => `
    SELECT r.id_rapport, r.id_soutenance, r.decision, r.mention, r.note::float AS note,
           to_char(r.soumis_le, 'YYYY-MM-DD') AS soumis_le,
           COALESCE(NULLIF(btrim(s.theme), ''), e.theme) AS theme,
           to_char(s.date_soutenance, 'YYYY-MM-DD') AS date_soutenance,
           e.id_etudiant, e.matricule, e.nom AS etudiant_nom, e.prenom AS etudiant_prenom,
           to_char(e.date_naissance, 'YYYY-MM-DD') AS date_naissance,
           ${avecLieu ? "e.lieu_naissance" : "NULL::text"} AS lieu_naissance,
           e.lieu_stage,
           m.code_mention AS parcours, m.nom_mention,
           COALESCE(ev.nom, u.nom) AS evaluateur_nom, COALESCE(ev.prenom, '') AS evaluateur_prenom
    FROM rapports r
    JOIN soutenances s ON s.id_soutenance = r.id_soutenance
    JOIN etudiants e   ON e.id_etudiant   = s.id_etudiant
    JOIN mentions m    ON m.id_mention    = e.id_mention
    LEFT JOIN utilisateurs u ON u.id_utilisateur = r.id_evaluateur
    LEFT JOIN evaluateurs ev ON ev.id_utilisateur = r.id_evaluateur
    ${filtre}`;

const listPv = async (idMention) => {
    try {
        return (await pool.query(pvSelect(true), [idMention])).rows;
    } catch (e) {
        if (e.code !== "42703") throw e;
        return (await pool.query(pvSelect(false), [idMention])).rows;
    }
};

// PV d'un seul rapport soumis, pour l'évaluateur qui l'a rédigé
const pvRapport = async (idRapport, idUtilisateur) => {
    try {
        return (await pool.query(pvSelect(true, FILTRE_RAPPORT), [idRapport, idUtilisateur])).rows[0] ?? null;
    } catch (e) {
        if (e.code !== "42703") throw e;
        return (await pool.query(pvSelect(false, FILTRE_RAPPORT), [idRapport, idUtilisateur])).rows[0] ?? null;
    }
};

// Enregistre le lieu de naissance (étudiant de la mention connectée uniquement)
const setLieuNaissance = async (idMention, idEtudiant, lieu) => {
    const result = await pool.query(
        "UPDATE etudiants SET lieu_naissance = $3 WHERE id_etudiant = $2 AND id_mention = $1 RETURNING id_etudiant",
        [idMention, idEtudiant, lieu]
    );
    return result.rowCount > 0;
};

module.exports = { list, listThemes, listPv, pvRapport, setLieuNaissance };
