const { assurerProfilEvaluateur } = require("../models/utilisateurModel");
const model = require("../models/soutenanceModel");
const { genererPlanning } = require("../services/planningGenerator");
const { handleError } = require("./_helpers");

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const STATUTS = ["planifiee", "terminee", "annulee"];

const lire = (b = {}) => ({
    date_soutenance: b.date_soutenance,
    heure_debut: b.heure_debut,
    heure_fin: b.heure_fin,
    statut: STATUTS.includes(b.statut) ? b.statut : "planifiee",
    id_etudiant: Number(b.id_etudiant),
    id_salle: Number(b.id_salle),
    id_evaluateur: Number(b.id_evaluateur),
    theme: b.theme || null,
});

const valider = (d) => {
    if (!DATE.test(d.date_soutenance || "")) return "Date invalide";
    if (!HEURE.test(d.heure_debut || "") || !HEURE.test(d.heure_fin || "")) return "Heures invalides (HH:MM)";
    if (d.heure_fin <= d.heure_debut) return "L'heure de fin doit être après l'heure de début";
    if (![d.id_etudiant, d.id_salle, d.id_evaluateur].every(Number.isInteger)) return "Étudiant, salle et évaluateur obligatoires";
    return null;
};

// Renvoie la liste des problèmes (chaîne vide = tout est bon)
const controler = async (db, d, idMention, excludeId = 0) => {
    const problemes = [];
    const [etudiant, salle, evaluateur] = await Promise.all([
        model.getEtudiantMention(db, d.id_etudiant),
        model.getSalle(db, d.id_salle),
        model.getEvaluateur(db, d.id_evaluateur),
    ]);
    if (!etudiant || etudiant.id_mention !== idMention) return ["Étudiant introuvable dans cette mention"];
    if (!salle) return ["Salle introuvable"];
    if (!evaluateur) return ["Évaluateur introuvable"];
    if (evaluateur.id_mention !== idMention) return ["Évaluateur d'une autre mention"];

    if (d.statut !== "annulee") {
        if (salle.statut === "indisponible") problemes.push(`Salle « ${salle.nom_salle} » indisponible`);
        if (evaluateur.statut === "indisponible") problemes.push(`Évaluateur ${evaluateur.nom} ${evaluateur.prenom} indisponible`);

        const conflits = await model.trouverConflits(db, {
            date: d.date_soutenance, debut: d.heure_debut, fin: d.heure_fin,
            id_salle: d.id_salle, id_evaluateur: d.id_evaluateur, id_etudiant: d.id_etudiant, excludeId,
        });
        for (const c of conflits) {
            const quand = `${c.heure_debut}–${c.heure_fin}, ${c.etudiant_nom}`;
            if (c.salle) problemes.push(`Salle déjà occupée (${quand})`);
            if (c.evaluateur) problemes.push(`Évaluateur déjà occupé (${quand})`);
            if (c.etudiant) problemes.push(`L'étudiant a déjà une soutenance sur ce créneau (${quand})`);
        }
    }
    return problemes;
};

const list = async (req, res) => {
    try {
        res.json(await model.list(req.mention.id_mention));
    } catch (e) {
        handleError(res, e);
    }
};

// Espace évaluateur : soutenances assignées à l'utilisateur connecté.
const listPourEvaluateur = async (req, res) => {
    try {
        if (String(req.user?.role || "").trim().toLowerCase() !== "evaluateur") {
            return res.status(403).json({ message: "Accès réservé aux évaluateurs" });
        }
        res.json(await model.listPourEvaluateur(req.user.id_utilisateur));
    } catch (e) {
        handleError(res, e);
    }
};

const create = async (req, res) => {
    try {
        const d = lire(req.body);
        const erreur = valider(d);
        if (erreur) return res.status(400).json({ message: erreur });

        const resultat = await model.avecVerrou(async (db) => {
            const conflits = await controler(db, d, req.mention.id_mention);
            if (conflits.length) return { conflits };
            const idResp = await model.getResponsableId(req.user.id_utilisateur, req.mention.id_mention, db);
            const id = await model.insert(db, d, idResp);
            return { id };
        });

        if (resultat.conflits) return res.status(409).json({ message: "Conflit de planning", conflits: resultat.conflits });
        res.status(201).json(await model.getById(resultat.id, req.mention.id_mention));
    } catch (e) {
        handleError(res, e);
    }
};

const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const d = lire(req.body);
        const erreur = valider(d);
        if (erreur) return res.status(400).json({ message: erreur });

        const resultat = await model.avecVerrou(async (db) => {
            const existante = await model.getById(id, req.mention.id_mention, db);
            if (!existante) return { introuvable: true };
            const conflits = await controler(db, d, req.mention.id_mention, id);
            if (conflits.length) return { conflits };
            await model.update(db, id, d);
            return { ok: true };
        });

        if (resultat.introuvable) return res.status(404).json({ message: "Soutenance introuvable" });
        if (resultat.conflits) return res.status(409).json({ message: "Conflit de planning", conflits: resultat.conflits });
        res.json(await model.getById(id, req.mention.id_mention));
    } catch (e) {
        handleError(res, e);
    }
};

const remove = async (req, res) => {
    try {
        const row = await model.remove(Number(req.params.id), req.mention.id_mention);
        if (!row) return res.status(404).json({ message: "Soutenance introuvable" });
        res.json({ message: "Soutenance supprimée" });
    } catch (e) {
        handleError(res, e);
    }
};

const generer = async (req, res) => {
    try {
        const b = req.body || {};
        const options = {
            dateDebut: b.date_debut,
            nbJours: parseInt(b.nb_jours, 10),
            heureDebut: b.heure_debut,
            heureFin: b.heure_fin,
            dureeMin: parseInt(b.duree_min, 10),
        };
        if (!DATE.test(options.dateDebut || "")) return res.status(400).json({ message: "Date de début invalide" });
        if (!HEURE.test(options.heureDebut || "") || !HEURE.test(options.heureFin || "") || options.heureFin <= options.heureDebut) {
            return res.status(400).json({ message: "Plage horaire invalide" });
        }
        if (!(options.nbJours >= 1 && options.nbJours <= 60)) return res.status(400).json({ message: "Nombre de jours : 1 à 60" });
        if (!(options.dureeMin >= 10 && options.dureeMin <= 240)) return res.status(400).json({ message: "Durée : 10 à 240 minutes" });

        const bilan = await model.avecVerrou(async (db) => {
            const donnees = await model.donneesGeneration(db, req.mention.id_mention, options.dateDebut);
            if (!donnees.etudiants.length) return { message: "Tous les étudiants ont déjà une soutenance", planifiees: 0, restants: 0 };
            if (!donnees.salles.length) return { erreur: "Aucune salle disponible" };
            if (!donnees.evaluateurs.length) return { erreur: "Aucun évaluateur disponible" };

            const { planifiees, restants } = genererPlanning({ ...donnees, options });
            const idResp = await model.getResponsableId(req.user.id_utilisateur, req.mention.id_mention, db);
            for (const p of planifiees) await model.insert(db, p, idResp);
            return { planifiees: planifiees.length, restants: restants.length };
        });

        if (bilan.erreur) return res.status(409).json({ message: bilan.erreur });
        res.json(bilan);
    } catch (e) {
        handleError(res, e);
    }
};

const statistiques = async (req, res) => {
    try {
        res.json(await model.statistiques(req.mention.id_mention));
    } catch (e) {
        handleError(res, e);
    }
};

const publication = async (req, res) => {
    try {
        res.json({ publie: await model.estPublie(req.mention.id_mention) });
    } catch (e) {
        handleError(res, e);
    }
};

const publier = async (req, res) => {
    try {
        await model.mettreAJourPublicationPlanning(req.mention.id_mention, true);
        res.json({ message: "Planning publié avec succès" });
    } catch (e) {
        handleError(res, e);
    }
};

const depublier = async (req, res) => {
    try {
        await model.mettreAJourPublicationPlanning(req.mention.id_mention, false);
        res.json({ message: "Planning dépublié" });
    } catch (e) {
        handleError(res, e);
    }
};
const getMesSoutenances = async (req, res) => {
    try {
        // Identifiant du compte connecté, provenant du JWT
        const idUtilisateur = req.user.id_utilisateur;

        if (!idUtilisateur) {
            return res.status(401).json({
                message: "Utilisateur non authentifié"
            });
        }

        // Retrouver le profil évaluateur associé au compte
        await assurerProfilEvaluateur(idUtilisateur).catch((e) => console.error("Profil évaluateur :", e.message));
        const evaluateur = await model.getEvaluateurByUtilisateur(idUtilisateur);

        if (!evaluateur) {
            return res.status(404).json({
                message: "Aucun profil évaluateur associé à ce compte"
            });
        }

        // Récupérer uniquement les soutenances de cet évaluateur
        const soutenances = await model.getMesSoutenances(
            evaluateur.id_evaluateur
        );

        return res.json(soutenances);
    } catch (e) {
        handleError(res, e);
    }
};

module.exports = { list, create, update, remove, generer, statistiques, publier, depublier, publication, getMesSoutenances };
