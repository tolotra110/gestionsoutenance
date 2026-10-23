-- 008 : lieu de stage + validation du thème (ajout seul, sans danger si déjà fait par le web : migration BACKEND/015)
INSERT INTO mentions (code_mention, nom_mention, description) VALUES
    ('INFO', 'Informatique',  'Mention Informatique'),
    ('MNGT', 'Management',    'Mention Management'),
    ('COMM', 'Communication', 'Mention Communication')
ON CONFLICT DO NOTHING;

ALTER TABLE etudiants
    ADD COLUMN IF NOT EXISTS lieu_stage          VARCHAR(200),
    ADD COLUMN IF NOT EXISTS theme_statut        VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
        CHECK (theme_statut IN ('EN_ATTENTE', 'MODIFICATIONS', 'VALIDE', 'REJETE')),
    ADD COLUMN IF NOT EXISTS theme_commentaire   TEXT,
    ADD COLUMN IF NOT EXISTS theme_date_decision TIMESTAMP,
    ADD COLUMN IF NOT EXISTS theme_decide_par    INT REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL;
