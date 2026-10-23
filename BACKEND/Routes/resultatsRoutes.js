const express = require("express");
const router = express.Router();

const verifyToken = require("../Middleware/authMiddleware");
const { requireMention } = require("../Middleware/mentionMiddleware");
const c = require("../Controllers/resultatsController");

// Espace responsable de mention : résultats (rapports de jury)
// de la mention du compte connecté, toutes mentions confondues.
router.use(verifyToken, requireMention);

router.get("/", c.list);
router.get("/themes", c.themes);
router.get("/pv", c.pv);
router.put("/pv/etudiants/:idEtudiant/lieu-naissance", c.lieuNaissance);

module.exports = router;
