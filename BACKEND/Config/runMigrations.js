const fs = require('fs');
const path = require('path');
const pool = require('./database');

// Schéma MCD utilisé par l'application web : 001 puis 010 à 018.
// Les anciennes migrations 002 à 009 sont volontairement ignorées car
// elles créent des tables incompatibles avec le MCD. La 019 est destructive.
const MIGRATIONS = [
  '001_Create_Utilisateurs.sql',
  '010_Create_MCD_Soutenances.sql',
  '011_Add_Theme_Statut_Etudiants.sql',
  '012_Add_Stage_Fields_Etudiants.sql',
  '013_Make_Email_Nullable.sql',
  '014_Add_Theme_Soutenances.sql',
  '015_Add_Theme_Validation_Etudiants.sql',
  '016_Add_Lieu_Naissance_Etudiants.sql',
  '017_Add_Mention_Evaluateurs.sql',
  '018_Add_Telephone_Date_Naissance_Etudiants.sql',
];

async function runMigrations() {
  const dir = path.join(__dirname, '..', 'migrations');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const filename of MIGRATIONS) {
    const fullPath = path.join(dir, filename);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Fichier de migration introuvable : ${fullPath}`);
    }

    const already = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE filename = $1',
      [filename]
    );
    if (already.rowCount > 0) {
      console.log(`[DB] Déjà appliquée : ${filename}`);
      continue;
    }

    const sql = fs.readFileSync(fullPath, 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename]
      );
      await client.query('COMMIT');
      console.log(`[DB] Migration appliquée : ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`[DB] ÉCHEC migration ${filename} :`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = runMigrations;
