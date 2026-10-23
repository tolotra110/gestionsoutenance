// Application mobile étudiante : consultation du planning par matricule (sans compte)
const etudiantModel = require("../models/etudiantModel");
const soutenanceModel = require("../models/soutenanceModel");
const { handleError } = require("./_helpers");

const planningParMatricule = async (req, res) => {
    try {
        const matricule = String(req.params.matricule || "").trim();
        if (!/^[A-Za-z0-9._\/-]{3,30}$/.test(matricule)) {
            return res.status(400).json({ message: "Matricule invalide" });
        }

        const etudiant = await etudiantModel.getByMatricule(matricule);
        if (!etudiant) return res.status(404).json({ message: "Matricule introuvable" });

        const soutenance = await soutenanceModel.getPlanningEtudiant(etudiant.id_etudiant);
        res.json({
            etudiant: { matricule: etudiant.matricule, nom: etudiant.nom, prenom: etudiant.prenom, mention: etudiant.nom_mention },
            soutenance,
        });
    } catch (e) {
        handleError(res, e);
    }
};

module.exports = { planningParMatricule };
