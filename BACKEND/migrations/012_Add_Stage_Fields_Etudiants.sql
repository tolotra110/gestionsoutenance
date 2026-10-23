-- 012 : Ajout des champs de stage pour les étudiants
ALTER TABLE etudiants
    ADD COLUMN IF NOT EXISTS lieu_stage VARCHAR(200),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS technologies TEXT;