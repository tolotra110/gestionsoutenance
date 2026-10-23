-- 017 : chaque évaluateur appartient à une mention (INFO / MNGT / COMM).
-- Un responsable de mention ne voit et ne planifie que les évaluateurs de SA mention.
ALTER TABLE evaluateurs
    ADD COLUMN IF NOT EXISTS id_mention INT REFERENCES mentions (id_mention) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_evaluateurs_mention ON evaluateurs (id_mention);

-- 1) Évaluateurs ayant un compte : mention choisie à l'inscription (parcours du compte)
UPDATE evaluateurs ev
SET id_mention = m.id_mention
FROM utilisateurs u
JOIN mentions m ON m.code_mention = CASE UPPER(btrim(u.parcours))
        WHEN 'INFORMATIQUE' THEN 'INFO' WHEN 'INFO' THEN 'INFO'
        WHEN 'MANAGEMENT'   THEN 'MNGT' WHEN 'MNGT' THEN 'MNGT'
        WHEN 'ICM'          THEN 'COMM' WHEN 'COMM' THEN 'COMM'
    END
WHERE ev.id_utilisateur = u.id_utilisateur AND ev.id_mention IS NULL;

-- 2) Sans compte : mention des étudiants qu'ils évaluent déjà
UPDATE evaluateurs ev
SET id_mention = (
    SELECT e.id_mention FROM soutenances s JOIN etudiants e ON e.id_etudiant = s.id_etudiant
    WHERE s.id_evaluateur = ev.id_evaluateur GROUP BY e.id_mention ORDER BY COUNT(*) DESC LIMIT 1
)
WHERE ev.id_mention IS NULL;

-- 3) Reste : rattachés à Informatique (mention d'origine du projet). À corriger ensuite depuis l'interface si besoin.
UPDATE evaluateurs
SET id_mention = (SELECT id_mention FROM mentions WHERE code_mention = 'INFO')
WHERE id_mention IS NULL;
