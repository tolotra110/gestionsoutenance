-- Réparer le mot de passe du responsable (id 9) = "123456"
-- (la commande inline PowerShell a corrompu le hash à cause de $)
UPDATE utilisateurs
SET mot_de_passe = '$2b$10$K3w45Sl0A6Aq2Yf8pEu3s.MeycNvRYMqA4LFgTatHUd70kAZFc0Ou'
WHERE id_utilisateur = 9;
