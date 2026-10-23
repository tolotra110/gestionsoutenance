-- 016 : lieu de naissance de l'étudiant (affiché sur le procès-verbal de soutenance)
-- Optionnel : sans cette colonne, le PV fonctionne quand même (lieu de naissance saisi à la main avant le téléchargement).
ALTER TABLE etudiants
    ADD COLUMN IF NOT EXISTS lieu_naissance VARCHAR(100);
