// Middlewares d'accès aux espaces « responsable de mention ».
// Le parcours du compte (présent dans le JWT) détermine la mention :
// la ligne correspondante de la table « mentions » est placée dans req.mention.
const pool = require("../Config/database");

// Correspondance parcours du compte -> code de la mention
const PARCOURS_VERS_MENTION = {
    INFORMATIQUE: "INFO",
    INFO: "INFO",
    MANAGEMENT: "MNGT",
    MNGT: "MNGT",
    ICM: "COMM",
    COMM: "COMM",
};


// Nom par défaut de chaque mention (créée automatiquement si elle manque en base :
// c'était la cause du 500 sur /api/soutenances/stats pour ICM et Management).
const NOM_MENTION = { INFO: "Informatique", MNGT: "Management", COMM: "Communication" };

const trouverOuCreerMention = async (code) => {
    const chercher = () =>
        pool.query(
            "SELECT id_mention, code_mention, nom_mention FROM mentions WHERE code_mention = $1 OR LOWER(nom_mention) = LOWER($2) ORDER BY (code_mention = $1) DESC LIMIT 1",
            [code, NOM_MENTION[code]]
        );

    let result = await chercher();
    if (!result.rows[0]) {
        await pool.query(
            "INSERT INTO mentions (code_mention, nom_mention, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
            [code, NOM_MENTION[code], `Mention ${NOM_MENTION[code]}`]
        );
        result = await chercher();
    }
    return result.rows[0];
};

// Charge req.mention = { id_mention, code_mention, nom_mention }
const chargerMention = async (req, res, next, codesAcceptes) => {
    try {
        const parcours = (req.user?.parcours || "").trim().toUpperCase();
        const role = (req.user?.role || "").trim().toLowerCase();

        if (role === "evaluateur") {
            return res.status(403).json({ message: "Accès réservé aux responsables de mention" });
        }

        const codeMention = PARCOURS_VERS_MENTION[parcours];
        if (!codeMention || (codesAcceptes && !codesAcceptes.includes(codeMention))) {
            return res.status(403).json({
                message: `Mention « ${parcours || "inconnue"} » non concernée par cet espace`,
            });
        }

        const mention = await trouverOuCreerMention(codeMention);
        if (!mention) {
            return res.status(500).json({
                message: `Mention ${codeMention} introuvable : exécutez migrations/015_Add_Theme_Validation_Etudiants.sql`,
            });
        }

        req.mention = mention;
        next();
    } catch (error) {
        console.error("Erreur chargement mention :", error.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Réservé à la mention Informatique (parcours INFO / INFORMATIQUE, hors évaluateurs).
const requireInformatique = (req, res, next) =>
    chargerMention(req, res, next, ["INFO"]);

// Générique : toute mention connue (INFO, MNGT, COMM/ICM), hors évaluateurs.
const requireMention = (req, res, next) => chargerMention(req, res, next, null);

module.exports = { requireInformatique, requireMention, PARCOURS_VERS_MENTION };
