-- Membres du jury de chaque soutenance

CREATE TABLE jury_membres (
    id_jury SERIAL PRIMARY KEY,
    id_soutenance INT NOT NULL REFERENCES soutenances (id_soutenance) ON DELETE CASCADE,
    id_utilisateur INT REFERENCES utilisateurs (id_utilisateur) ON DELETE SET NULL,
    nom VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'Examinateur' NOT NULL
        CHECK (role IN ('President', 'Examinateur', 'Rapporteur'))
);

CREATE INDEX idx_jury_membres_soutenance ON jury_membres (id_soutenance);