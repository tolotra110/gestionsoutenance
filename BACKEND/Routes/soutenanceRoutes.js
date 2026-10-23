const express = require("express");
const router = express.Router();

const verifyToken = require("../Middleware/authMiddleware");
const { requireMention } = require("../Middleware/mentionMiddleware");
const c = require("../Controllers/soutenanceController");

// Espace évaluateur : les soutenances qui lui sont assignées.
// Placée AVANT requireInformatique car ce middleware est réservé à
// l'espace responsable de mention (il renvoie 403 aux évaluateurs).
router.get("/evaluateur/soutenances", verifyToken, c.getMesSoutenances);

// Routes du planning (responsable de mention) : mention Informatique requise,
// c'est elles qui alimentent req.mention utilisé par les contrôleurs.
router.use(verifyToken, requireMention);

router.get("/stats", c.statistiques);
router.get("/publication", c.publication);
router.get("/", c.list);
router.post("/generer", c.generer);
router.post("/publier", c.publier);
router.post("/depublier", c.depublier);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
