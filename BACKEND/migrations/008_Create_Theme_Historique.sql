-- Historique des décisions prises sur un thème (page « Thèmes à valider »)

CREATE TABLE theme_historique (
    id_historique SERIAL PRIMARY KEY,
    id_theme INT NOT NULL REFERENCES themes (id_theme) ON DELETE CASCADE,
    decision VARCHAR(20) NOT NULL
        CHECK (decision IN ('EN_ATTENTE', 'MODIFICATIONS', 'VALIDE', 'REJETE')),
    auteur VARCHAR(100) NOT NULL,
    commentaire TEXT,
    date TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_theme_historique_theme ON theme_historique (id_theme, date);