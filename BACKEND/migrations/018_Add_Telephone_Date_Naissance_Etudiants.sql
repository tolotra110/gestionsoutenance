-- 018 : numéro de téléphone + date de naissance de l'étudiant (la date de naissance est imprimée sur le procès-verbal)
-- Ajout seul, sans danger si déjà fait (la colonne date_naissance existe déjà dans le MCD 010 ; telephone y était en commentaire).
ALTER TABLE etudiants
    ADD COLUMN IF NOT EXISTS telephone      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS date_naissance DATE;
