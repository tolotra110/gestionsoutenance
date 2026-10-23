-- 007 : objectif du thème (ajout seul, sans toucher aux colonnes existantes du web)
ALTER TABLE etudiants ADD COLUMN IF NOT EXISTS objectif TEXT;
