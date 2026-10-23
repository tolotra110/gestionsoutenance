const express = require("express");
const router = express.Router();

const verifyToken = require("../Middleware/authMiddleware");
const { requireMention } = require("../Middleware/mentionMiddleware");
const c = require("../Controllers/etudiantController");

router.use(verifyToken, requireMention);

router.get("/", c.list);
router.post("/", c.create);
router.post("/import", c.importer);
router.put("/:id", c.update);
router.delete("/", c.removeAll);
router.delete("/:id", c.remove);

module.exports = router;
