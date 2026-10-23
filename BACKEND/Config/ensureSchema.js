// Applique au démarrage les petites migrations idempotentes (016, 017 et 018) :
// évite les erreurs 500 si le script SQL n'a pas encore été exécuté à la main.
const pool = require("./database");

const ETAPES = [
    // 016 : lieu de naissance (procès-verbal)
    `ALTER TABLE etudiants ADD COLUMN IF NOT EXISTS lieu_naissance VARCHAR(100)`,
    // 018 : téléphone + date de naissance de l'étudiant (date de naissance imprimée sur le PV)
    `ALTER TABLE etudiants ADD COLUMN IF NOT EXISTS telephone VARCHAR(30)`,
    `ALTER TABLE etudiants ADD COLUMN IF NOT EXISTS date_naissance DATE`,
    // 017 : mention de chaque évaluateur
    `ALTER TABLE evaluateurs ADD COLUMN IF NOT EXISTS id_mention INT REFERENCES mentions (id_mention) ON DELETE SET NULL`,
    `CREATE INDEX IF NOT EXISTS idx_evaluateurs_mention ON evaluateurs (id_mention)`,
    // 1) mention choisie à l'inscription (parcours du compte)
    `UPDATE evaluateurs ev SET id_mention = m.id_mention
     FROM utilisateurs u
     JOIN mentions m ON m.code_mention = CASE UPPER(btrim(u.parcours))
        WHEN 'INFORMATIQUE' THEN 'INFO' WHEN 'INFO' THEN 'INFO'
        WHEN 'MANAGEMENT' THEN 'MNGT' WHEN 'MNGT' THEN 'MNGT'
        WHEN 'ICM' THEN 'COMM' WHEN 'COMM' THEN 'COMM' END
     WHERE ev.id_utilisateur = u.id_utilisateur AND ev.id_mention IS NULL`,
    // 2) sans compte : mention des étudiants déjà évalués
    `UPDATE evaluateurs ev SET id_mention = (
        SELECT e.id_mention FROM soutenances s JOIN etudiants e ON e.id_etudiant = s.id_etudiant
        WHERE s.id_evaluateur = ev.id_evaluateur GROUP BY e.id_mention ORDER BY COUNT(*) DESC LIMIT 1)
     WHERE ev.id_mention IS NULL`,
    // 3) reste : Informatique
    `UPDATE evaluateurs SET id_mention = (SELECT id_mention FROM mentions WHERE code_mention = 'INFO') WHERE id_mention IS NULL`,
];

module.exports = async () => {
    for (const sql of ETAPES) {
        try {
            await pool.query(sql);
        } catch (e) {
            console.error("Mise à jour du schéma :", e.message);
        }
    }
};
