-- 014 : Ajouter la colonne theme à la table soutenances
-- Les modèles (soutenanceModel) et les données (seed_data.sql) s'attendent à cette colonne,
--或她 les migrations 004/010 ne la créent pas.
ALTER TABLE soutenances
ADD COLUMN IF NOT EXISTS theme VARCHAR(255);