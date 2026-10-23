-- Soutenances assignées aux évaluateurs (page « Mes soutenances » et calendrier)

CREATE TABLE soutenances (
    id_soutenance SERIAL PRIMARY KEY,
    id_etudiant INT NOT NULL REFERENCES etudiants (id_etudiant) ON DELETE CASCADE,
    id_salle INT REFERENCES salles (id_salle) ON DELETE SET NULL,
    id_encadrant INT REFERENCES utilisateurs (id_utilisateur) ON DELETE SET NULL,
    parcours VARCHAR(30) NOT NULL,
    sujet TEXT NOT NULL,
    date_soutenance TIMESTAMP NOT NULL,
    duree INT DEFAULT 45 NOT NULL,
    statut VARCHAR(20) DEFAULT 'A_VENIR' NOT NULL
        CHECK (statut IN ('A_VENIR', 'EN_COURS', 'TERMINEE', 'ANNULEE')),
    cree_le TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_soutenances_date ON soutenances (date_soutenance);

CREATE INDEX idx_soutenances_etudiant ON soutenances (id_etudiant);

CREATE INDEX idx_soutenances_parcours ON soutenances (parcours, statut);