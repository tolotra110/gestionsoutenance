-- Thèmes de soutenance déposés par les étudiants (page « Thèmes à valider »)

CREATE TABLE themes (
    id_theme SERIAL PRIMARY KEY,
    id_etudiant INT NOT NULL REFERENCES etudiants (id_etudiant) ON DELETE CASCADE,
    id_encadrant INT REFERENCES utilisateurs (id_utilisateur) ON DELETE SET NULL,
    parcours VARCHAR(30) NOT NULL,
    titre TEXT NOT NULL,
    problematique TEXT NOT NULL,
    resume TEXT NOT NULL,
    objectifs TEXT[] DEFAULT '{}' NOT NULL,
    methodologie TEXT NOT NULL,
    mots_cles TEXT[] DEFAULT '{}' NOT NULL,
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE' NOT NULL
        CHECK (statut IN ('EN_ATTENTE', 'MODIFICATIONS', 'VALIDE', 'REJETE')),
    dernier_commentaire TEXT,
    id_decideur INT REFERENCES utilisateurs (id_utilisateur) ON DELETE SET NULL,
    date_depot TIMESTAMP DEFAULT NOW() NOT NULL,
    date_decision TIMESTAMP,
    maj_le TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_themes_statut ON themes (statut);

CREATE INDEX idx_themes_etudiant ON themes (id_etudiant);

CREATE INDEX idx_themes_parcours ON themes (parcours, statut);