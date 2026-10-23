const express = require("express");
const router = express.Router();

const verifyToken = require("../Middleware/authMiddleware");
const c = require("../Controllers/themeController");

// Espace évaluateur : thèmes de tous les étudiants (Informatique, Management, ICM)
router.use(verifyToken);

router.get("/", c.list);
router.put("/:id/decision", c.decider);

module.exports = router;
