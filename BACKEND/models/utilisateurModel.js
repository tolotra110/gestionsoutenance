
const pool = require("../Config/database");

const getAllUtilisateurs = async () => {
    const result = await pool.query(
        "SELECT * FROM utilisateurs ORDER BY id_utilisateur"
    );

    return result.rows;
};


const getUtilisateurById = async (id) => {
    const result = await pool.query(
        "SELECT * FROM utilisateurs WHERE id_utilisateur = $1",
        [id]
    );

    return result.rows[0];
};


const getUtilisateurByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM utilisateurs WHERE email = $1",
        [email]
    );

    return result.rows[0];
};


const createUtilisateur = async (
    nom,
    email,
    mot_de_passe,
    parcours,
    role = "evaluateur"
) => {
    // Le rôle est fourni explicitement : la colonne est NOT NULL et sa valeur par défaut
    // n'existe que si la migration 010 a été exécutée (cause du 500 sur /api/auth/register).
    const result = await pool.query(
        `INSERT INTO utilisateurs
        (nom, email, mot_de_passe, role, parcours)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_utilisateur, nom, email, role, parcours`,
        [nom, email, mot_de_passe, role, parcours]
    );

    return result.rows[0];
};

// Profil « évaluateur » rattaché au compte : permet de lui affecter des soutenances.
// Si le responsable de mention avait déjà créé l'évaluateur avec le même email, on le relie.
// Mention (id_mention) correspondant au parcours choisi par l'évaluateur
const MENTION_PAR_PARCOURS = {
    INFORMATIQUE: "INFO", INFO: "INFO",
    MANAGEMENT: "MNGT", MNGT: "MNGT",
    ICM: "COMM", COMM: "COMM",
};
const codeMention = (parcours) => MENTION_PAR_PARCOURS[String(parcours || "").trim().toUpperCase()] ?? null;

const lierProfilEvaluateur = async (utilisateur) => {
    const code = codeMention(utilisateur.parcours);
    const lie = await pool.query(
        `UPDATE evaluateurs SET id_utilisateur = $1, id_mention = COALESCE(id_mention, (SELECT id_mention FROM mentions WHERE code_mention = $3))
         WHERE id_utilisateur IS NULL AND LOWER(email) = LOWER($2)
         RETURNING id_evaluateur`,
        [utilisateur.id_utilisateur, utilisateur.email, code]
    );
    if (lie.rowCount) return;

    const mots = String(utilisateur.nom || "").trim().split(/\s+/);
    await pool.query(
        `INSERT INTO evaluateurs (id_utilisateur, nom, prenom, email, statut, id_mention)
         VALUES ($1, $2, $3, $4, 'disponible', (SELECT id_mention FROM mentions WHERE code_mention = $5))
         ON CONFLICT DO NOTHING`,
        [utilisateur.id_utilisateur, mots[0] || "-", mots.slice(1).join(" ") || "-", utilisateur.email, code]
    );
};

const updateUtilisateur = async (
    id,
    nom,
    email,
    parcours
) => {
    const result = await pool.query(
        `UPDATE utilisateurs
         SET nom = $1,
             email = $2,
             parcours = $3
         WHERE id_utilisateur = $4
         RETURNING id_utilisateur, nom, email, role, parcours`,
        [nom, email, parcours, id]
    );

    // « Mon compte » : si l'évaluateur change de parcours, il change de mention
    const code = codeMention(parcours);
    if (code && result.rows[0]) {
        await pool.query(
            "UPDATE evaluateurs SET id_mention = (SELECT id_mention FROM mentions WHERE code_mention = $2) WHERE id_utilisateur = $1",
            [id, code]
        ).catch((e) => console.error("Mention évaluateur non mise à jour :", e.message));
    }

    return result.rows[0];
};

// Garantit que le compte évaluateur a sa fiche (table evaluateurs) : sans elle, il ne peut être
// affecté à aucune soutenance et son espace reste vide.
const assurerProfilEvaluateur = async (idUtilisateur) => {
    const existe = await pool.query("SELECT 1 FROM evaluateurs WHERE id_utilisateur = $1 LIMIT 1", [idUtilisateur]);
    if (existe.rowCount) return;
    const u = await getUtilisateurById(idUtilisateur);
    if (!u || String(u.role || "").toLowerCase() !== "evaluateur") return;
    await lierProfilEvaluateur(u);
};

// Crée la fiche de tous les comptes évaluateurs d'une mention qui n'en ont pas encore
// (ils apparaissent alors dans la liste du responsable et peuvent être planifiés).
const synchroniserProfilsMention = async (codeMentionCible) => {
    const comptes = await pool.query(
        `SELECT id_utilisateur, nom, email, parcours FROM utilisateurs
         WHERE LOWER(role) = 'evaluateur'
           AND NOT EXISTS (SELECT 1 FROM evaluateurs ev WHERE ev.id_utilisateur = utilisateurs.id_utilisateur)`
    );
    for (const c of comptes.rows) {
        if (codeMention(c.parcours) !== codeMentionCible) continue;
        try {
            await lierProfilEvaluateur(c);
        } catch (e) {
            console.error("Profil évaluateur non créé :", e.message);
        }
    }
};

// Identifiants de connexion (email + mot de passe haché) d'un compte.
// L'email est aussi reporté sur la fiche évaluateur / responsable de mention liée au compte.
const updateIdentifiants = async (id, email, motDePasseHash) => {
    const result = await pool.query(
        `UPDATE utilisateurs
         SET email = $1, mot_de_passe = $2
         WHERE id_utilisateur = $3
         RETURNING id_utilisateur, nom, email, role, parcours`,
        [email, motDePasseHash, id]
    );

    for (const table of ["evaluateurs", "responsables_mention"]) {
        try {
            await pool.query(`UPDATE ${table} SET email = $1 WHERE id_utilisateur = $2`, [email, id]);
        } catch (e) {
            // email déjà utilisé sur une autre fiche : la connexion, elle, est bien modifiée
            console.error(`Email non reporté sur ${table} :`, e.message);
        }
    }

    return result.rows[0];
};

const deleteUtilisateur = async (id) => {
    const result = await pool.query(
        "DELETE FROM utilisateurs WHERE id_utilisateur = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllUtilisateurs,
    getUtilisateurById,
    getUtilisateurByEmail,
    createUtilisateur,
    lierProfilEvaluateur,
    assurerProfilEvaluateur,
    synchroniserProfilsMention,
    updateUtilisateur,
    updateIdentifiants,
    deleteUtilisateur
};

