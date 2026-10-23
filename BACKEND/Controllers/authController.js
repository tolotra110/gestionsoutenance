
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
    getUtilisateurByEmail,
    getUtilisateurById,
    createUtilisateur,
    lierProfilEvaluateur,
    updateIdentifiants
} = require("../models/utilisateurModel");

// Parcours acceptés à l'inscription d'un évaluateur (-> valeur enregistrée)
const PARCOURS_VALIDES = {
    INFORMATIQUE: "INFORMATIQUE", INFO: "INFORMATIQUE",
    MANAGEMENT: "MANAGEMENT", MNGT: "MANAGEMENT",
    ICM: "ICM", COMM: "ICM",
};


const hash = bcrypt.hashSync("123456", 10);

console.log(hash);

const login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        if (!email || !mot_de_passe) {
            return res.status(400).json({
                message: "Email et mot de passe obligatoires"
            });
        }

        const utilisateur = await getUtilisateurByEmail(email);

        if (!utilisateur) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        const passwordCorrect = await bcrypt.compare(
            mot_de_passe,
            utilisateur.mot_de_passe
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }
    console.log("JWT_SECRET défini dans login :", Boolean(process.env.JWT_SECRET));

  
        const token = jwt.sign(
            {
                id_utilisateur: utilisateur.id_utilisateur,
                role: utilisateur.role,
                parcours: utilisateur.parcours
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Connexion réussie",
            token,
            utilisateur: {
                id_utilisateur: utilisateur.id_utilisateur,
                nom: utilisateur.nom,
                email: utilisateur.email,
                role: utilisateur.role,
                parcours: utilisateur.parcours
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


const register = async (req, res) => {
    try {
        const {
            nom,
            email,
            mot_de_passe,
            parcours
        } = req.body;


        if (!nom || !email || !mot_de_passe || !parcours) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        const parcoursNormalise = PARCOURS_VALIDES[String(parcours).trim().toUpperCase()];
        if (!parcoursNormalise) {
            return res.status(400).json({
                message: "Parcours invalide (Informatique, Management ou ICM)"
            });
        }

        const motDePasseHash = await bcrypt.hash(
            mot_de_passe,
            10
        );

        const utilisateur = await createUtilisateur(
            nom,
            email,
            motDePasseHash,
            parcoursNormalise,
            "evaluateur"
        );

        try {
            await lierProfilEvaluateur(utilisateur);
        } catch (e) {
            // Le compte est créé : l'absence de profil ne doit pas bloquer l'inscription
            console.error("Profil évaluateur non créé :", e.message);
        }

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            utilisateur
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({
                message: "Cet email existe déjà"
            });
        }

        res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


// ---------- Paramètres du compte (responsable de mention et évaluateur) ----------
const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES_PARAMETRES = ["evaluateur", "responsable_mention", "responsable mention", "responsable"];

const versUtilisateur = (u) => ({
    id_utilisateur: u.id_utilisateur,
    nom: u.nom,
    email: u.email,
    role: u.role,
    parcours: u.parcours
});

// GET /api/auth/me : compte connecté
const getMe = async (req, res) => {
    try {
        const utilisateur = await getUtilisateurById(req.user.id_utilisateur);
        if (!utilisateur) return res.status(404).json({ message: "Compte introuvable" });
        res.json({ utilisateur: versUtilisateur(utilisateur) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// PUT /api/auth/identifiants : change l'email de connexion et/ou le mot de passe du compte connecté.
// Le mot de passe actuel est toujours demandé (un poste laissé ouvert ne suffit pas à changer l'accès).
const changerIdentifiants = async (req, res) => {
    try {
        const { email, mot_de_passe_actuel, nouveau_mot_de_passe } = req.body || {};

        const utilisateur = await getUtilisateurById(req.user.id_utilisateur);
        if (!utilisateur) return res.status(404).json({ message: "Compte introuvable" });

        if (!ROLES_PARAMETRES.includes(String(utilisateur.role || "").trim().toLowerCase())) {
            return res.status(403).json({ message: "Ce compte ne peut pas modifier ses identifiants ici" });
        }

        if (!mot_de_passe_actuel) {
            return res.status(400).json({ message: "Saisissez votre mot de passe actuel pour confirmer" });
        }
        // 403 (et non 401) : un 401 déconnecterait l'utilisateur côté application
        const correct = await bcrypt.compare(String(mot_de_passe_actuel), utilisateur.mot_de_passe);
        if (!correct) return res.status(403).json({ message: "Mot de passe actuel incorrect" });

        const nouvelEmail = String(email ?? utilisateur.email).trim();
        if (!EMAIL_VALIDE.test(nouvelEmail)) {
            return res.status(400).json({ message: "Adresse email invalide" });
        }
        if (nouvelEmail.length > 150) {
            return res.status(400).json({ message: "Adresse email trop longue (150 caractères max)" });
        }
        const emailChange = nouvelEmail !== utilisateur.email;

        const nouveau = nouveau_mot_de_passe ? String(nouveau_mot_de_passe) : "";
        if (nouveau && nouveau.length < 6) {
            return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
        }
        if (nouveau && nouveau === String(mot_de_passe_actuel)) {
            return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'actuel" });
        }

        if (!emailChange && !nouveau) {
            return res.status(400).json({ message: "Aucune modification à enregistrer" });
        }

        const hash = nouveau ? await bcrypt.hash(nouveau, 10) : utilisateur.mot_de_passe;
        const misAJour = await updateIdentifiants(utilisateur.id_utilisateur, nouvelEmail, hash);

        res.json({
            message: nouveau && emailChange
                ? "Email et mot de passe modifiés"
                : nouveau ? "Mot de passe modifié" : "Email de connexion modifié",
            utilisateur: versUtilisateur(misAJour)
        });
    } catch (error) {
        console.error(error);
        if (error.code === "23505") {
            return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte" });
        }
        res.status(500).json({ message: "Erreur serveur" });
    }
};


module.exports = {
    login,
    register,
    getMe,
    changerIdentifiants
};

