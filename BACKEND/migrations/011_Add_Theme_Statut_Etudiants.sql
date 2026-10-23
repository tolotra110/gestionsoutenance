-- 011 : Ajouter les colonnes theme et statut à la table etudiants
ALTER TABLE etudiants
ADD COLUMN IF NOT EXISTS theme VARCHAR(255),
ADD COLUMN IF NOT EXISTS telephone VARCHAR(30),
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) NOT NULL DEFAULT 'a-venir' CHECK (statut IN ('a-venir', 'en-cours', 'termine', 'annule'));

-- Ajouter la colonne publie à la table soutenances pour tracker la publication
ALTER TABLE soutenances
ADD COLUMN IF NOT EXISTS publie BOOLEAN NOT NULL DEFAULT false;
