-- Nettoyage : un seul profil évaluateur par compte utilisateur
-- Le profil id 2 (nom="Jean", prenom="À compléter") est un doublon du compte
-- utilisateur 1 (jean@gmail.com). Le profil id 1 (Jean Rakoto) est conservé.

-- 1) Réaffecter les soutenances du doublon (id 2)
--    vers les profils uniques, sans chevauchement de créneau :
UPDATE soutenances SET id_evaluateur = 5 WHERE id_soutenance IN (3, 5, 13);  -- Rakoto
UPDATE soutenances SET id_evaluateur = 1 WHERE id_soutenance = 9;            -- Jean

-- 2) Supprimer le profil en double
DELETE FROM evaluateurs WHERE id_evaluateur = 2;

-- 3) Vérification : distribution par évaluateur
SELECT ev.id_evaluateur, ev.id_utilisateur, ev.nom, ev.prenom,
       COUNT(s.id_soutenance) AS nb_soutenances
FROM evaluateurs ev
LEFT JOIN soutenances s ON s.id_evaluateur = ev.id_evaluateur
GROUP BY ev.id_evaluateur, ev.id_utilisateur, ev.nom, ev.prenom
ORDER BY ev.id_evaluateur;
