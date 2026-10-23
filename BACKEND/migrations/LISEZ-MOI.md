# Migrations

- `001` à `009` : migrations d'origine du dépôt (utilisateurs, étudiants, salles, soutenances, jury, thèmes, rapports).
- `010` à `013` : tables du MCD utilisées par l'interface de la mention Informatique
  (mentions, responsables_mention, etudiants, salles, evaluateurs, soutenances + colonnes thème/statut/stage).

## ⚠️ Conflit connu entre `002-004` et `010`

Les deux séries créent des tables portant le même nom (`etudiants`, `salles`, `soutenances`) avec des colonnes différentes :

| Table | `002-004` (dépôt) | `010` (MCD) |
|---|---|---|
| `etudiants` | `nom`, `email` obligatoire, `niveau`, `parcours`, `promo` | `nom` + `prenom`, `id_mention`, `date_naissance`, … |
| `salles` | `nom`, `batiment`, `capacite` | `nom_salle`, `localisation`, `equipement`, `statut` |
| `soutenances` | `date_soutenance` (timestamp), `duree`, `id_encadrant`, `sujet`, … | `date_soutenance` (date), `heure_debut`, `heure_fin`, `id_evaluateur`, … |

Elles ne peuvent donc pas coexister dans la même base. `010` s'arrête avec un message d'erreur si les tables de `002-004`
existent déjà, au lieu d'échouer plus tard en silence. Il faut décider quelle structure fait foi avant d'exécuter `010`.
