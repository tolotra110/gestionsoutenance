-- 009 : téléphone + date de naissance de l'étudiant (la date de naissance est imprimée sur le procès-verbal du web)
-- Ajout seul, sans danger si déjà fait par le web (BACKEND/migrations/018).
ALTER TABLE etudiants
    ADD COLUMN IF NOT EXISTS telephone      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS date_naissance DATE;
