
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./Routes/authRoutes");
const etudiantRoutes = require("./Routes/etudiantRoutes");
const salleRoutes = require("./Routes/salleRoutes");
const evaluateurRoutes = require("./Routes/evaluateurRoutes");
const soutenanceRoutes = require("./Routes/soutenanceRoutes");
const rapportRoutes = require("./Routes/rapportRoutes");
const themeRoutes = require("./Routes/themeRoutes");
const resultatsRoutes = require("./Routes/resultatsRoutes");
const publicRoutes = require("./Routes/publicRoutes");
const donneesRoutes = require("./Routes/donneesRoutes");

const app = express();
// Afficher les requêtes reçues dans le terminal
app.get("/test", (req, res) => {
    res.status(200).json({
        message: "Le backend fonctionne correctement"
    });
});
app.use((req, res, next) => {
    console.log("Requête reçue :", req.method, req.originalUrl);
    next();
});


app.use(cors());


// Autoriser les requêtes JSON volumineuses pour les imports Excel/CSV
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/etudiants", etudiantRoutes);
app.use("/api/salles", salleRoutes);
app.use("/api/evaluateurs", evaluateurRoutes);
app.use("/api/soutenances", soutenanceRoutes);
app.use("/api/rapports", rapportRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/resultats", resultatsRoutes);
app.use("/api/donnees", donneesRoutes);
app.use("/api/public", publicRoutes);

const PORT = process.env.PORT || 5000;

require("./Config/ensureSchema")().finally(() => {
    app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
});
