const express = require("express");
const router = express.Router();

const verifyToken = require("../Middleware/authMiddleware");
const { requireMention } = require("../Middleware/mentionMiddleware");
const c = require("../Controllers/donneesController");

router.use(verifyToken, requireMention);

router.post("/reinitialiser", c.reinitialiser);

module.exports = router;
