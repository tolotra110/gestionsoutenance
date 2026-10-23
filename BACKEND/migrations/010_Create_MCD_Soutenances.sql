-- 010 : tables du MCD (mentions, etudiants, salles, evaluateurs, responsables, soutenances)
-- ⚠️ Les migrations 002/003/004 du dépôt créent déjà des tables "etudiants", "salles" et "soutenances"
-- avec d'autres colonnes. Si elles ont été exécutées, ce script s'arrête ici au lieu de ne rien faire
-- en silence (CREATE TABLE IF NOT EXISTS ignorerait les tables existantes et le code planterait ensuite).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'etudiants')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'etudiants' AND column_name = 'id_mention') THEN
        RAISE EXCEPTION 'Conflit de schéma : la table etudiants vient des migrations 002-004 (autre structure que le MCD). Voir BACKEND/migrations/LISEZ-MOI.md';
    END IF;
END $$;

-- La table "utilisateurs" (001) n'est pas modifiée, sauf une valeur par défaut sur "role"
-- (sans elle, POST /api/auth/register échoue car la colonne est NOT NULL).
ALTER TABLE utilisateurs ALTER COLUMN role SET DEFAULT 'evaluateur';

CREATE TABLE IF NOT EXISTS mentions (
    id_mention   SERIAL PRIMARY KEY,
    code_mention VARCHAR(10)  UNIQUE NOT NULL,   -- INFO | MNGT | COMM
    nom_mention  VARCHAR(100) UNIQUE NOT NULL,
    description  TEXT
);

INSERT INTO mentions (code_mention, nom_mention, description) VALUES
    ('INFO', 'Informatique',  'Mention Informatique'),
    ('MNGT', 'Management',    'Mention Management'),
    ('COMM', 'Communication', 'Mention Communication')
ON CONFLICT (code_mention) DO NOTHING;

CREATE TABLE IF NOT EXISTS responsables_mention (
    id_responsable SERIAL PRIMARY KEY,
    id_mention     INT NOT NULL UNIQUE REFERENCES mentions(id_mention) ON DELETE CASCADE, -- (0,1) : une mention, un responsable
    id_utilisateur INT REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL,
    nom            VARCHAR(100) NOT NULL,
    prenom         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) UNIQUE,
    telephone      VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS etudiants (
    id_etudiant    SERIAL PRIMARY KEY,
    matricule      VARCHAR(30) UNIQUE NOT NULL,
    nom            VARCHAR(100) NOT NULL,
    prenom         VARCHAR(100) NOT NULL,
    email          VARCHAR(150) UNIQUE,
    --telephone      VARCHAR(30),
    date_naissance DATE,
    id_mention     INT NOT NULL REFERENCES mentions(id_mention),          -- (1,1) : appartient à une mention
    id_utilisateur INT REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS salles (
    id_salle     SERIAL PRIMARY KEY,
    nom_salle    VARCHAR(80) UNIQUE NOT NULL,
    capacite     INT CHECK (capacite IS NULL OR capacite > 0),
    localisation VARCHAR(150),
    equipement   VARCHAR(255),
    statut       VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (statut IN ('disponible', 'indisponible'))
);

CREATE TABLE IF NOT EXISTS evaluateurs (
    id_evaluateur  SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL,
    nom            VARCHAR(100) NOT NULL,
    prenom         VARCHAR(100) NOT NULL,
    specialite     VARCHAR(150),
    email          VARCHAR(150) UNIQUE,
    telephone      VARCHAR(30),
    disponibilite  VARCHAR(255),
    statut         VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (statut IN ('disponible', 'indisponible'))
);

CREATE TABLE IF NOT EXISTS soutenances (
    id_soutenance   SERIAL PRIMARY KEY,
    date_soutenance DATE NOT NULL,
    heure_debut     TIME NOT NULL,
    heure_fin       TIME NOT NULL,
    statut          VARCHAR(20) NOT NULL DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'terminee', 'annulee')),
    id_etudiant     INT NOT NULL UNIQUE REFERENCES etudiants(id_etudiant) ON DELETE CASCADE, -- une soutenance = un seul étudiant
    id_salle        INT NOT NULL REFERENCES salles(id_salle),
    id_evaluateur   INT NOT NULL REFERENCES evaluateurs(id_evaluateur),
    id_responsable  INT REFERENCES responsables_mention(id_responsable) ON DELETE SET NULL,
    CHECK (heure_fin > heure_debut)
);

CREATE INDEX IF NOT EXISTS idx_soutenances_date ON soutenances (date_soutenance, heure_debut);
CREATE INDEX IF NOT EXISTS idx_etudiants_mention ON etudiants (id_mention);
