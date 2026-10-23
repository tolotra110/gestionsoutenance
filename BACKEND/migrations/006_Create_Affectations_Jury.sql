-- Affectation des évaluateurs aux soutenances (liste « Mes soutenances »)

CREATE TABLE affectations_jury (
    id_affectation SERIAL PRIMARY KEY,
    id_soutenance INT NOT NULL REFERENCES soutenances (id_soutenance) ON DELETE CASCADE,
    id_evaluateur INT NOT NULL REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE,
    affecte_le TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE (id_soutenance, id_evaluateur)
);

CREATE INDEX idx_affectations_evaluateur ON affectations_jury (id_evaluateur);