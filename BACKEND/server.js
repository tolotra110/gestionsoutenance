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
app.get("/test", (req, res) => {
    res.status(200).json({ message: "Le backend fonctionne correctement" });
});
app.use((req, res, next) => {
    console.log("Requête reçue :", req.method, req.originalUrl);
    next();
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));

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

// Render utilise DATABASE_URL côté serveur : aucun mot de passe à saisir sur le PC.
// Les migrations sont enregistrées dans schema_migrations et ne sont pas rejouées.
const runMigrations = require("./Config/runMigrations");
const ensureSchema = require("./Config/ensureSchema");

runMigrations()
    .then(() => ensureSchema())
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Démarrage annulé : migration PostgreSQL impossible.", error);
        process.exit(1);
    });
