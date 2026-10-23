const express = require("express");
const router = express.Router();

const { planningParMatricule } = require("../Controllers/publicController");

// Limiteur simple (en mémoire) : 30 requêtes / minute / IP, pour freiner l'énumération de matricules
const FENETRE_MS = 60 * 1000;
const MAX = 30;
const compteurs = new Map();

const limiter = (req, res, next) => {
    const maintenant = Date.now();
    const cle = req.ip;
    const e = compteurs.get(cle);
    if (!e || maintenant - e.debut > FENETRE_MS) {
        compteurs.set(cle, { debut: maintenant, n: 1 });
        return next();
    }
    e.n++;
    if (e.n > MAX) return res.status(429).json({ message: "Trop de tentatives, réessayez dans une minute" });
    next();
};

setInterval(() => {
    const maintenant = Date.now();
    for (const [k, v] of compteurs) if (maintenant - v.debut > FENETRE_MS) compteurs.delete(k);
}, FENETRE_MS).unref();

router.get("/planning/:matricule", limiter, planningParMatricule);

module.exports = router;
