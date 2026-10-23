// Connexion à la MÊME base PostgreSQL que le web (Soutenancedb, port 5433 par défaut).
const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

// 1) MOBILE/backend/.env  2) à défaut, BACKEND/.env du web (dotenv ne remplace jamais une valeur déjà lue)
dotenv.config({ path: path.join(__dirname, "..", ".env"), quiet: true });
dotenv.config({ path: path.join(__dirname, "..", "..", "..", "BACKEND", ".env"), quiet: true });

// En ligne (Neon) : DATABASE_URL vers l'hébergeur ; en local (pas d'URL, ou URL vers localhost) : variables DB_*
const url = process.env.DATABASE_URL || "";
const enLigne = url !== "" && !/@(localhost|127\.0\.0\.1)[:/]/.test(url);

if (!enLigne && !process.env.DB_PASSWORD) {
    console.error("\n[ERREUR] DB_PASSWORD introuvable : créez MOBILE/backend/.env (voir .env.example)\n");
    process.exit(1);
}

module.exports = enLigne
    ? new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })
    : new Pool({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "Soutenancedb",
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5433,
    });
