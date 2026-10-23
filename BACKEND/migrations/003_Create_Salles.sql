-- Salles de soutenance

CREATE TABLE salles (
    id_salle SERIAL PRIMARY KEY,
    nom VARCHAR(60) NOT NULL,
    batiment VARCHAR(60),
    capacite INT
);