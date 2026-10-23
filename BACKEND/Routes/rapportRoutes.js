const express = require("express");
const router = express.Router();

const verifyToken = require("../Middleware/authMiddleware");
const c = require("../Controllers/rapportController");

// Espace évaluateur : rapports de jury de ses soutenances.
// Pas de requireInformatique ici : ce middleware est réservé à
// l'espace responsable de mention (il bloque les évaluateurs).
router.use(verifyToken);

router.get("/", c.list);
router.get("/:id/pv", c.pv);
router.get("/:id", c.show);
router.put("/:id", c.update);
router.post("/:id/soumettre", c.soumettre);

module.exports = router;
