-- 013 : Rendre email nullable pour l'import (le fichier Excel n'a pas d'email)
ALTER TABLE etudiants ALTER COLUMN email DROP NOT NULL;