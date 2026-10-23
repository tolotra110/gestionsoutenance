-- 015 : validation des thèmes par les évaluateurs (ajout seul, rien n'est modifié ni supprimé)

-- 1) Les trois mentions (corrige le 500 sur /api/soutenances/stats pour ICM et Management
--    quand la ligne de la mention n'existe pas encore en base)
INSERT INTO mentions (code_mention, nom_mention, description) VALUES
    ('INFO', 'Informatique',  'Mention Informatique'),
    ('MNGT', 'Management',    'Mention Management'),
    ('COMM', 'Communication', 'Mention Communication')
ON CONFLICT DO NOTHING;

-- 2) Colonnes de décision sur l'étudiant (le thème, sa description, son objectif
--    et ses technologies sont déjà saisis par l'étudiant depuis l'application mobile)
ALTER TABLE etudiants
    ADD COLUMN IF NOT EXISTS objectif            TEXT,
    ADD COLUMN IF NOT EXISTS theme_statut        VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
        CHECK (theme_statut IN ('EN_ATTENTE', 'MODIFICATIONS', 'VALIDE', 'REJETE')),
    ADD COLUMN IF NOT EXISTS theme_commentaire   TEXT,
    ADD COLUMN IF NOT EXISTS theme_date_decision TIMESTAMP,
    ADD COLUMN IF NOT EXISTS theme_decide_par    INT REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL;

-- 3) Si l'étudiant modifie son thème (depuis le mobile) après une décision,
--    le thème repasse automatiquement « à valider ».
CREATE OR REPLACE FUNCTION etudiants_reset_theme_statut() RETURNS trigger AS $$
BEGIN
    IF (NEW.theme        IS DISTINCT FROM OLD.theme
     OR NEW.description  IS DISTINCT FROM OLD.description
     OR NEW.objectif     IS DISTINCT FROM OLD.objectif
     OR NEW.technologies IS DISTINCT FROM OLD.technologies)
       AND NEW.theme_statut IS NOT DISTINCT FROM OLD.theme_statut THEN
        NEW.theme_statut := 'EN_ATTENTE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_etudiants_reset_theme_statut ON etudiants;
CREATE TRIGGER trg_etudiants_reset_theme_statut
    BEFORE UPDATE ON etudiants
    FOR EACH ROW EXECUTE FUNCTION etudiants_reset_theme_statut();
