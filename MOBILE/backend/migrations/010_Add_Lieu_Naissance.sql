-- 010 : lieu de naissance de l'étudiant (imprimé sur le procès-verbal du web)
-- Ajout seul, sans danger si déjà fait par le web (BACKEND/migrations/016).
ALTER TABLE etudiants
    ADD COLUMN IF NOT EXISTS lieu_naissance VARCHAR(100);
