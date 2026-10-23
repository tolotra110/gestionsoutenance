-- Étudiants rattachés à un compte utilisateur (espace évaluateur : liste des étudiants)

CREATE TABLE etudiants (
    id_utilisateur INT UNIQUE REFERENCES utilisateurs (id_utilisateur) ON DELETE CASCADE,
    id_etudiant SERIAL PRIMARY KEY,
    matricule VARCHAR(30) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    niveau VARCHAR(30) NOT NULL,
    parcours VARCHAR(30) NOT NULL,
    promo VARCHAR(15),
    cree_le TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_etudiants_parcours ON etudiants (parcours);

CREATE INDEX idx_etudiants_nom ON etudiants (nom);