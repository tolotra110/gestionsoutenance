require("dotenv").config();

const { Pool } = require("pg");

// En ligne (Render + Neon) : DATABASE_URL pointe vers l'hébergeur -> connexion SSL.
// En local (pas de DATABASE_URL, ou URL vers localhost) : variables DB_* du .env,
// exactement comme avant.
const url = process.env.DATABASE_URL || "";
const enLigne = url !== "" && !/@(localhost|127\.0\.0\.1)[:/]/.test(url);

const pool = enLigne
    ? new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    })
    : new Pool({
        user: "postgres",
        host: "localhost",
        database: "Soutenancedb",
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432
    });

module.exports = pool;
