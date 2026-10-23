-- 019 (OPTIONNELLE) : supprime les colonnes qui ne sont plus utilisées par l'application.
-- Le code n'y touche plus : ne l'exécutez que si vous voulez aussi les retirer de la base
-- (les données qu'elles contiennent sont perdues).

-- Rapports de jury : « Observations du jury » et « Recommandations »
ALTER TABLE rapports
    DROP COLUMN IF EXISTS observations,
    DROP COLUMN IF EXISTS recommandations;

-- Étudiants : « Objectif du thème » (le trigger de la migration 015 le lisait : on le recrée sans lui)
CREATE OR REPLACE FUNCTION etudiants_reset_theme_statut() RETURNS trigger AS $$
BEGIN
    IF (NEW.theme        IS DISTINCT FROM OLD.theme
     OR NEW.description  IS DISTINCT FROM OLD.description
     OR NEW.technologies IS DISTINCT FROM OLD.technologies)
       AND NEW.theme_statut IS NOT DISTINCT FROM OLD.theme_statut THEN
        NEW.theme_statut := 'EN_ATTENTE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE etudiants DROP COLUMN IF EXISTS objectif;
