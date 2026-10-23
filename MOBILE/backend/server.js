// Serveur de l'application mobile — lancer depuis MOBILE/backend : node server.js
//  - /api/mobile/*  : API (même base PostgreSQL que le web)
//  - /              : l'application (export web de l'app React Native) -> lien http://... partageable
//  - /apk/*         : fichiers .apk déposés dans MOBILE/backend/apk (installation Android)
const path = require("path");
const fs = require("fs");
const pool = require("./config/db"); // charge aussi les .env
const express = require("express");
const cors = require("cors");

const app = express();
app.set("trust proxy", true); // derrière ngrok / cloudflared : vraie IP du client
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/mobile", require("./routes/mobile"));

// Application web exportée (npx expo export -p web -> MOBILE/app/dist)
const dist = process.env.WEB_BUILD || path.join(__dirname, "..", "app", "dist");
const apk = path.join(__dirname, "apk");
fs.mkdirSync(apk, { recursive: true });
app.use("/apk", express.static(apk, {
    setHeaders: (res, f) => { if (f.endsWith(".apk")) res.type("application/vnd.android.package-archive"); },
}));
if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.use((req, res) => res.sendFile(path.join(dist, "index.html"))); // Express 5 : repli sans motif
} else {
    app.get("/", (_req, res) => res.send("API mobile OK. Exportez l'application : voir MOBILE/README.md (étape 4)."));
}

process.on("unhandledRejection", (r) => console.error("[ERREUR] Promesse non tenue :", r));

(async () => {
    try {
        // Lieu de stage et statut de validation du thème (migration 008), téléphone et date de naissance (009),
        // lieu de naissance (010) : ajouts seuls, sans danger si déjà faits
        for (const f of ["008_Add_Lieu_Stage_Validation_Theme.sql", "009_Add_Telephone_Date_Naissance.sql", "010_Add_Lieu_Naissance.sql"]) {
            await pool.query(fs.readFileSync(path.join(__dirname, "migrations", f), "utf8"));
        }
        const PORT = Number(process.env.PORT) || 4000;
       app.listen(PORT, () => {
            console.log(`API mobile prête sur http://localhost:${PORT}  (base : ${process.env.DB_NAME || "Soutenancedb"})`);
        });
    } catch (e) {
        console.error("[ERREUR] Connexion à PostgreSQL impossible :", e.message);
        console.error("Vérifiez que PostgreSQL tourne, le port (5433) et le mot de passe.");
        process.exit(1);
    }
})();
