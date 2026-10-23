const express = require("express");
const router = express.Router();

const verifyToken = require("../Middleware/authMiddleware");
const { login, register, getMe, changerIdentifiants } = require("../Controllers/authController");

router.post("/login", login);
router.post("/register", register);

// Paramètres du compte connecté (responsable de mention, évaluateur)
router.get("/me", verifyToken, getMe);
router.put("/identifiants", verifyToken, changerIdentifiants);

module.exports = router;