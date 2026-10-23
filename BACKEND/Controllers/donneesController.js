const model = require("../models/donneesModel");
const { handleError } = require("./_helpers");

const MOT_CONFIRMATION = "REINITIALISER";

const reinitialiser = async (req, res) => {
    try {
        if (req.body?.confirmation !== MOT_CONFIRMATION) {
            return res.status(400).json({ message: `Confirmation requise : envoyez « ${MOT_CONFIRMATION} »` });
        }
        const bilan = await model.reinitialiser(req.mention.id_mention);
        res.json({ message: "Toutes les données ont été réinitialisées", ...bilan });
    } catch (e) {
        handleError(res, e);
    }
};

module.exports = { reinitialiser };
