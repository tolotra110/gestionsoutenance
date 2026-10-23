-- Données réalistes pour l'espace évaluateur (mention Informatique)
-- Mots de passe des comptes évaluateurs (ids 1,2,6,7) = "123456"

-- 1) Comptes évaluateurs INFORMATIQUE : mot de passe connu "123456"
UPDATE utilisateurs SET mot_de_passe = '$2b$10$K3w45Sl0A6Aq2Yf8pEu3s.MeycNvRYMqA4LFgTatHUd70kAZFc0Ou'
WHERE id_utilisateur IN (1, 2, 6, 7);

-- 2) Lier les profils évaluateurs aux comptes utilisateurs
UPDATE evaluateurs SET id_utilisateur = 1, nom = 'Jean', prenom = 'Rakoto'
WHERE id_evaluateur = 1;

INSERT INTO evaluateurs (id_utilisateur, nom, prenom, specialite, email, telephone, disponibilite, statut) VALUES
(2, 'Rabe', 'Nirina', 'Génie logiciel', 'rabe@gmail.com', '0340000002', '08h-16h', 'disponible'),
(6, 'Faneva', 'Rija', 'Réseaux', 'faneva@gmail.com', '0340000006', '08h-16h', 'disponible'),
(7, 'Rakoto', 'Hery', 'Base de données', 'rakoto@gmail.com', '0340000007', '08h-16h', 'disponible')
ON CONFLICT (email) DO NOTHING;

-- 3) Responsable de mention Informatique (compte id 9)
INSERT INTO responsables_mention (id_mention, id_utilisateur, nom, prenom, email, telephone)
VALUES (1, 9, 'Responsable', 'Mention', 'responsable@universite.mg', '0340000009')
ON CONFLICT (id_mention) DO NOTHING;

-- 4) Étudiants de la mention Informatique (id_mention = 1)
--    L'étudiant id 1 existe déjà ; ceux-ci recevront les ids 2 à 11.
INSERT INTO etudiants (matricule, nom, prenom, email, date_naissance, id_mention, theme, telephone, statut, lieu_stage, description, technologies) VALUES
('INF2024001', 'Rakotomalala', 'Miora', 'miora.rakotomalala@universite.mg', '2004-03-12', 1, 'E-commerce', '0341000001', 'a-venir', 'EMIT', 'Plateforme de vente en ligne', 'React, Node.js'),
('INF2024002', 'Andrianjaka', 'Tahina', 'tahina.andrianjaka@universite.mg', '2004-07-08', 1, 'Système de recommandation', '0341000002', 'a-venir', 'EMIT', 'Recommandation de produits par ML', 'Python, scikit-learn'),
('INF2024003', 'Ravelomanana', 'Sitraka', 'sitraka.ravelomanana@universite.mg', '2004-11-23', 1, 'IoT santé', '0341000003', 'a-venir', 'EMIT', 'Suivi de santé connectée', 'React Native, MQTT'),
('INF2024004', 'Randriamihaja', 'Feno', 'feno.randriamihaja@universite.mg', '2004-05-17', 1, 'Gestion de projets', '0341000004', 'a-venir', 'EMIT', 'Plateforme collaborative agile', 'Vue.js, Laravel'),
('INF2024005', 'Rasoamampianina', 'Harena', 'harena.rasoamampianina@universite.mg', '2004-09-02', 1, 'Analyse prédictive', '0341000005', 'a-venir', 'EMIT', 'Prédiction des pannes industrielles', 'Python, TensorFlow'),
('INF2024006', 'Rakotoson', 'Nirina', 'nirina.rakotoson@universite.mg', '2004-02-14', 1, 'Tests automatisés', '0341000006', 'a-venir', 'EMIT', 'Tests d''applications web modernes', 'Jest, Cypress'),
('INF2024007', 'Andriamihaja', 'Tolotra', 'tolotra.andriamihaja@universite.mg', '2004-06-30', 1, 'Réservation de salles', '0341000007', 'a-venir', 'EMIT', 'Réservation en ligne des salles', 'Spring Boot, Angular'),
('INF2024008', 'Rabemananjara', 'Fanja', 'fanja.rabemananjara@universite.mg', '2004-04-25', 1, 'Application mobile', '0341000008', 'a-venir', 'EMIT', 'Application mobile de e-commerce', 'Flutter, Firebase'),
('INF2024009', 'Ravelo', 'Mamy', 'mamy.ravelo@universite.mg', '2004-08-19', 1, 'Messagerie sécurisée', '0341000009', 'a-venir', 'EMIT', 'Application de messagerie chiffrée', 'React, WebSockets'),
('INF2024010', 'Razafy', 'Sarobidy', 'sarobidy.razafy@universite.mg', '2004-01-11', 1, 'Tableau de bord', '0341000010', 'a-venir', 'EMIT', 'Tableau de bord analytique temps réel', 'D3.js, Node.js')
ON CONFLICT (matricule) DO NOTHING;

-- 5) Salles
INSERT INTO salles (nom_salle, capacite, localisation, equipement, statut) VALUES
('A101', 40, 'Bâtiment A', 'Vidéoprojecteur, Wi-Fi', 'disponible'),
('A102', 40, 'Bâtiment A', 'Vidéoprojecteur, Wi-Fi', 'disponible'),
('B203', 30, 'Bâtiment B', 'Vidéoprojecteur, tableau blanc', 'disponible'),
('C305', 25, 'Bâtiment C', 'Visioconférence, Wi-Fi', 'disponible'),
('D101', 35, 'Bâtiment D', 'Vidéoprojecteur, climatisation', 'disponible')
ON CONFLICT (nom_salle) DO NOTHING;

-- 6) Soutenances planifiées (créneaux de 30 min).
--    UN étudiant = UNE seule soutenance (contrainte UNIQUE sur id_etudiant).
--    Pas de chevauchement sur une même salle ou un même évaluateur à un même créneau.
--    Évaluateurs : 1=Jean, 2=Rabe, 3=Faneva, 4=Rakoto
--    Salles : 1=B001, 2=A101, 3=A102, 4=B203, 5=C305, 6=D101
INSERT INTO soutenances (date_soutenance, heure_debut, heure_fin, statut, id_etudiant, id_salle, id_evaluateur, id_responsable, theme) VALUES
('2026-10-13', '08:00', '08:30', 'planifiee', 2, 2, 1, 1, 'Plateforme de vente en ligne'),
('2026-10-13', '08:30', '09:00', 'planifiee', 3, 3, 2, 1, 'Système de recommandation par ML'),
('2026-10-13', '09:00', '09:30', 'planifiee', 4, 4, 3, 1, 'Suivi de santé connectée (IoT)'),
('2026-10-13', '09:30', '10:00', 'planifiee', 5, 5, 4, 1, 'Plateforme collaborative de projets'),
('2026-10-14', '08:00', '08:30', 'planifiee', 6, 6, 1, 1, 'Analyse prédictive des pannes'),
('2026-10-14', '08:30', '09:00', 'planifiee', 7, 2, 2, 1, 'Tests automatisés d''applications web'),
('2026-10-14', '09:00', '09:30', 'planifiee', 8, 3, 3, 1, 'Système de réservation de salles'),
('2026-10-14', '09:30', '10:00', 'planifiee', 9, 4, 4, 1, 'Application mobile de e-commerce'),
('2026-10-15', '08:00', '08:30', 'planifiee', 10, 5, 1, 1, 'Application de messagerie sécurisée'),
('2026-10-15', '08:30', '09:00', 'planifiee', 11, 6, 2, 1, 'Tableau de bord analytique temps réel')
ON CONFLICT (id_etudiant) DO NOTHING;

-- La soutenance existante (id 1, étudiant 1) est rattachée au responsable
UPDATE soutenances SET id_responsable = 1 WHERE id_soutenance = 1 AND id_responsable IS NULL;

-- 7) Membres du jury (président + examinateur) pour les soutenances qui n'en ont pas encore
INSERT INTO jury_membres (id_soutenance, id_utilisateur, nom, role)
SELECT s.id_soutenance,
       (CASE WHEN s.id_soutenance % 2 = 0 THEN 9 ELSE 1 END),
       (CASE WHEN s.id_soutenance % 2 = 0 THEN 'Responsable Mention' ELSE 'Jean' END),
       'President'
FROM soutenances s
WHERE NOT EXISTS (SELECT 1 FROM jury_membres jm WHERE jm.id_soutenance = s.id_soutenance);

INSERT INTO jury_membres (id_soutenance, id_utilisateur, nom, role)
SELECT s.id_soutenance,
       (CASE WHEN s.id_soutenance % 2 = 0 THEN 2 ELSE 6 END),
       (CASE WHEN s.id_soutenance % 2 = 0 THEN 'Rabe' ELSE 'Faneva' END),
       'Examinateur'
FROM soutenances s
WHERE NOT EXISTS (SELECT 1 FROM jury_membres jm WHERE jm.id_soutenance = s.id_soutenance
                  AND jm.role = 'Examinateur');

-- Les évaluateurs du jeu de test appartiennent à la mention Informatique (migration 017)
UPDATE evaluateurs SET id_mention = (SELECT id_mention FROM mentions WHERE code_mention = 'INFO') WHERE id_mention IS NULL;
