-- Rapports de jury rédigés par les évaluateurs (page « Rapports »)

CREATE TABLE rapports (
    id_rapport SERIAL PRIMARY KEY,
    id_soutenance INT NOT NULL REFERENCES soutenances (id_soutenance) ON DELETE CASCADE,
    id_evaluateur INT NOT NULL REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE,
    statut VARCHAR(20) DEFAULT 'A_REDIGER' NOT NULL
    CHECK (statut IN ('A_REDIGER', 'EN_COURS', 'SOUMIS')),
    observations TEXT DEFAULT '' NOT NULL,
    recommandations TEXT DEFAULT '' NOT NULL,
    decision VARCHAR(20)
    CHECK (decision IN ('ADMIS', 'AJOURNE')),
    mention VARCHAR(30),
    note NUMERIC(4, 2)
    CHECK (note IS NULL OR (note >= 0 AND note <= 20)),
    cree_le TIMESTAMP DEFAULT NOW() NOT NULL,
    maj_le TIMESTAMP,
    soumis_le TIMESTAMP,
    UNIQUE (id_soutenance, id_evaluateur)
);

CREATE INDEX idx_rapports_evaluateur ON rapports (id_evaluateur, statut);

CREATE INDEX idx_rapports_soutenance ON rapports (id_soutenance);