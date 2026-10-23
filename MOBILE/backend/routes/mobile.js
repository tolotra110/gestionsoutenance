// Routes de l'application mobile étudiante — préfixe /api/mobile (sans compte : matricule + nom)
const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// ---------- limiteur simple : 60 requêtes / minute / IP ----------
const FENETRE_MS = 60 * 1000;
const MAX = 60;
const compteurs = new Map();
const limiter = (req, res, next) => {
    const now = Date.now();
    const e = compteurs.get(req.ip);
    if (!e || now - e.debut > FENETRE_MS) {
        compteurs.set(req.ip, { debut: now, n: 1 });
        return next();
    }
    if (++e.n > MAX) return res.status(429).json({ message: "Trop de tentatives, réessayez dans une minute" });
    next();
};
setInterval(() => {
    const now = Date.now();
    for (const [k, v] of compteurs) if (now - v.debut > FENETRE_MS) compteurs.delete(k);
}, FENETRE_MS).unref();
router.use(limiter);

// ---------- utilitaires ----------
const MATRICULE = /^[A-Za-z0-9._\/-]{3,30}$/;
const texte = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s === "" ? null : s;
};
// Date de naissance : accepte JJ/MM/AAAA, JJ-MM-AAAA ou AAAA-MM-JJ -> "AAAA-MM-JJ" (null si invalide)
const dateIso = (v) => {
    const t = texte(v);
    if (!t) return null;
    let a, m, j, r;
    if ((r = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(t))) [, a, m, j] = r;
    else if ((r = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/.exec(t))) [, j, m, a] = r;
    else return null;
    a = Number(a); m = Number(m); j = Number(j);
    const d = new Date(Date.UTC(a, m - 1, j));
    const ok = d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === j;
    if (!ok || a < 1900 || d > new Date()) return null;
    return `${String(a).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(j).padStart(2, "0")}`;
};
const TELEPHONE = /^[+0-9 ().-]{6,30}$/;

// "Rakoto " == "RAKOTO" == "rakotô"
const normaliser = (s) =>
    String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

const fiche = (r) => ({
    matricule: r.matricule,
    nom: r.nom,
    prenom: r.prenom,
    telephone: r.telephone || "",
    date_naissance: r.date_naissance || "",
    lieu_naissance: r.lieu_naissance || "",
    parcours: r.code_mention,
    parcours_nom: r.nom_mention,
    theme: r.theme || "",
    description: r.description || "",
    technologies: r.technologies || "",
    lieu_stage: r.lieu_stage || "",
    theme_statut: r.theme ? r.theme_statut || "EN_ATTENTE" : "",
    theme_commentaire: r.theme_commentaire || "",
});

const SELECT_FICHE = `
    SELECT e.id_etudiant, e.matricule, e.nom, e.prenom, e.telephone, to_char(e.date_naissance, 'YYYY-MM-DD') AS date_naissance, e.lieu_naissance,
           e.theme, e.description, e.technologies,
           e.lieu_stage, e.theme_statut, e.theme_commentaire,
           m.code_mention, CASE m.code_mention WHEN 'COMM' THEN 'ICM' ELSE m.nom_mention END AS nom_mention
    FROM etudiants e JOIN mentions m ON m.id_mention = e.id_mention
    WHERE UPPER(e.matricule) = UPPER($1)`;

const erreur = (res, e) => {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
};

// ---------- GET /api/mobile/parcours : liste des parcours (mentions) ----------
router.get("/parcours", async (_req, res) => {
    try {
        const r = await pool.query(
            `SELECT code_mention AS code, CASE code_mention WHEN 'COMM' THEN 'ICM' ELSE nom_mention END AS nom
             FROM mentions WHERE code_mention IN ('INFO', 'MNGT', 'COMM') ORDER BY id_mention`
        );
        res.json(r.rows);
    } catch (e) { erreur(res, e); }
});

// ---------- GET /api/mobile/etudiant/:matricule : fiche déjà enregistrée (pré-remplissage) ----------
router.get("/etudiant/:matricule", async (req, res) => {
    try {
        const matricule = texte(req.params.matricule) || "";
        if (!MATRICULE.test(matricule)) return res.status(400).json({ message: "Matricule invalide" });
        const r = await pool.query(SELECT_FICHE, [matricule]);
        if (!r.rows[0]) return res.status(404).json({ message: "Matricule introuvable" });
        res.json(fiche(r.rows[0]));
    } catch (e) { erreur(res, e); }
});

// ---------- POST /api/mobile/etudiant : l'étudiant envoie / met à jour son thème de stage ----------
// Corps : matricule, nom, prenom, telephone, date_naissance (JJ/MM/AAAA), lieu_naissance, parcours (code : INFO, MNGT ou COMM/ICM), theme, description, technologies, lieu_stage
router.post("/etudiant", async (req, res) => {
    try {
        const b = req.body || {};
        const matricule = texte(b.matricule)?.toUpperCase();
        const nom = texte(b.nom);
        const prenom = texte(b.prenom);
        let parcours = (texte(b.parcours) || "INFO").toUpperCase();
        if (parcours === "ICM") parcours = "COMM";
        if (parcours === "INFORMATIQUE") parcours = "INFO";
        if (parcours === "MANAGEMENT") parcours = "MNGT";
        const telephone = texte(b.telephone);
        const dateNaissance = dateIso(b.date_naissance);
        const lieuNaissance = texte(b.lieu_naissance);
        const lieuStage = texte(b.lieu_stage);
        const theme = texte(b.theme);
        const description = texte(b.description);
        const technologies = Array.isArray(b.technologies)
            ? b.technologies.map(texte).filter(Boolean).join(", ")
            : texte(b.technologies);

        if (!matricule || !MATRICULE.test(matricule)) return res.status(400).json({ message: "Matricule invalide" });
        if (!nom || !prenom) return res.status(400).json({ message: "Nom et prénom obligatoires" });
        if (!texte(b.date_naissance)) return res.status(400).json({ message: "La date de naissance est obligatoire (JJ/MM/AAAA)" });
        if (!dateNaissance) return res.status(400).json({ message: "Date de naissance invalide (format JJ/MM/AAAA)" });
        if (!lieuNaissance) return res.status(400).json({ message: "Le lieu de naissance est obligatoire" });
        if (lieuNaissance.length > 100) return res.status(400).json({ message: "Lieu de naissance trop long (100 caractères max)" });
        if (telephone && !TELEPHONE.test(telephone)) return res.status(400).json({ message: "Numéro de téléphone invalide (chiffres, espaces et + uniquement)" });
        if (!theme) return res.status(400).json({ message: "Le thème est obligatoire" });
        if (lieuStage && lieuStage.length > 200) return res.status(400).json({ message: "Lieu de stage trop long (200 caractères max)" });
        if (theme.length > 255) return res.status(400).json({ message: "Thème trop long (255 caractères max)" });
        if ([description, technologies].some((t) => t && t.length > 5000)) {
            return res.status(400).json({ message: "Texte trop long (5000 caractères max)" });
        }

        const existant = await pool.query("SELECT id_etudiant, nom FROM etudiants WHERE UPPER(matricule) = $1", [matricule]);

        if (existant.rows[0]) {
            // Fiche déjà créée par la scolarité : on exige le même nom pour éviter qu'on modifie la fiche d'un autre
            if (normaliser(existant.rows[0].nom) !== normaliser(nom)) {
                return res.status(403).json({ message: "Le nom ne correspond pas à ce matricule" });
            }
            // L'étudiant choisit son parcours : sa fiche passe dans l'espace de cette mention.
            // Si le thème change, il repasse « à valider » par l'évaluateur.
            const m = await pool.query("SELECT id_mention FROM mentions WHERE UPPER(code_mention) = $1", [parcours]);
            if (!m.rows[0]) return res.status(400).json({ message: "Parcours inconnu" });
            await pool.query(
                `UPDATE etudiants
                 SET theme_statut = CASE WHEN theme IS DISTINCT FROM $1 OR description IS DISTINCT FROM $2
                                           OR technologies IS DISTINCT FROM $3
                                           OR lieu_stage IS DISTINCT FROM $4
                                         THEN 'EN_ATTENTE' ELSE theme_statut END,
                     theme = $1, description = $2, technologies = $3, lieu_stage = $4, id_mention = $5,
                     telephone = $7, date_naissance = $8, lieu_naissance = $9
                 WHERE id_etudiant = $6`,
                [theme, description, technologies, lieuStage, m.rows[0].id_mention, existant.rows[0].id_etudiant, telephone, dateNaissance, lieuNaissance]
            );
        } else {
            const m = await pool.query("SELECT id_mention FROM mentions WHERE UPPER(code_mention) = $1", [parcours]);
            if (!m.rows[0]) return res.status(400).json({ message: "Parcours inconnu" });
            await pool.query(
                `INSERT INTO etudiants (matricule, nom, prenom, theme, description, technologies, lieu_stage, id_mention, telephone, date_naissance, lieu_naissance)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [matricule, nom, prenom, theme, description, technologies, lieuStage, m.rows[0].id_mention, telephone, dateNaissance, lieuNaissance]
            );
        }

        const r = await pool.query(SELECT_FICHE, [matricule]);
        res.status(existant.rows[0] ? 200 : 201).json({
            message: existant.rows[0] ? "Fiche mise à jour" : "Fiche enregistrée",
            cree: !existant.rows[0],
            etudiant: fiche(r.rows[0]),
        });
    } catch (e) {
        if (e.code === "23505") return res.status(409).json({ message: "Ce matricule existe déjà" });
        erreur(res, e);
    }
});

// ---------- GET /api/mobile/planning/:matricule : soutenance PUBLIÉE par la scolarité ----------
router.get("/planning/:matricule", async (req, res) => {
    try {
        const matricule = texte(req.params.matricule) || "";
        if (!MATRICULE.test(matricule)) return res.status(400).json({ message: "Matricule invalide" });

        const e = await pool.query(SELECT_FICHE, [matricule]);
        if (!e.rows[0]) return res.status(404).json({ message: "Matricule introuvable" });

        const s = await pool.query(
            `SELECT to_char(s.date_soutenance, 'YYYY-MM-DD') AS date_soutenance,
                    to_char(s.heure_debut, 'HH24:MI') AS heure_debut,
                    to_char(s.heure_fin, 'HH24:MI') AS heure_fin,
                    s.statut, sa.nom_salle, sa.localisation,
                    ev.nom AS evaluateur_nom, ev.prenom AS evaluateur_prenom
             FROM soutenances s
             JOIN salles sa ON sa.id_salle = s.id_salle
             JOIN evaluateurs ev ON ev.id_evaluateur = s.id_evaluateur
             WHERE s.id_etudiant = $1 AND s.publie = true AND s.statut <> 'annulee'`,
            [e.rows[0].id_etudiant]
        );

        res.json({ etudiant: fiche(e.rows[0]), soutenance: s.rows[0] || null });
    } catch (err) { erreur(res, err); }
});

module.exports = router;
