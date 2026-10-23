/**
 * Thèmes de soutenance déposés par les étudiants et soumis à validation
 * par l'évaluateur.
 * Cycle de vie : EN_ATTENTE -> VALIDE | MODIFICATIONS | REJETE
 */

export const DECISIONS = {
  VALIDE: {
    statut: 'VALIDE',
    label: 'Validé',
    libelleAction: 'Valider le thème',
    description: "Le thème est accepté : l'étudiant peut enregistrer son mémoire sur ce sujet.",
    classe: 'bg-emerald-100 text-emerald-700',
  },
  MODIFICATIONS: {
    statut: 'MODIFICATIONS',
    label: 'Modifications demandées',
    libelleAction: 'Demander des modifications',
    description: "Le thème est renvoyé à l'étudiant : il doit corriger la proposition avant de re-soumettre.",
    classe: 'bg-amber-100 text-amber-700',
  },
  REJETE: {
    statut: 'REJETE',
    label: 'Rejeté',
    libelleAction: 'Rejeter le thème',
    description: 'Le thème est refusé : un nouveau dépôt sera nécessaire.',
    classe: 'bg-red-100 text-red-700',
  },
}

export const FILTRES_STATUT = [
  { value: '', label: 'Tous' },
  { value: 'SANS_THEME', label: 'Sans thème' },
  { value: 'EN_ATTENTE', label: 'À valider' },
  { value: 'MODIFICATIONS', label: 'Modifications demandées' },
  { value: 'VALIDE', label: 'Validés' },
  { value: 'REJETE', label: 'Rejetés' },
]

export const STATUT_CONFIG = {
  SANS_THEME: { label: 'Sans thème', classe: 'bg-slate-100 text-slate-600' },
  EN_ATTENTE: { label: 'À valider', classe: 'bg-sky-100 text-sky-700' },
  MODIFICATIONS: { label: 'Modifications demandées', classe: 'bg-amber-100 text-amber-700' },
  VALIDE: { label: 'Validé', classe: 'bg-emerald-100 text-emerald-700' },
  REJETE: { label: 'Rejeté', classe: 'bg-red-100 text-red-700' },
}

/** Parcours affichés dans l'espace évaluateur (code base de données -> libellé). */
export const PARCOURS = [
  { value: '', label: 'Tous les parcours' },
  { value: 'INFO', label: 'Informatique' },
  { value: 'MNGT', label: 'Management' },
  { value: 'COMM', label: 'ICM' },
]

export const THEMES = [
  {
    id: 1,
    etudiant: { nom: 'Yasmine El Amrani', matricule: 'ETU2024010', email: 'yasmine.elamrani@email.com', niveau: 'Master 1' },
    parcours: 'INFORMATIQUE',
    titre: "Optimisation du Placement dans les Réseaux de Neurones Profonds par Recuit Simulé",
    problematique:
      "Comment le recuit simulé peut-il réduire le coût de placement des circuits sans dégrader significativement les performances ?",
    resume:
      "Le placement des portes logiques est un problème combinatoire NP-difficile. Nous comparons trois heuristiques (gloutonne, recuit simulé, algorithme de Chung-Hwang) sur un jeu de 20 benchmarks publics, et nous proposons un critère d'évaluation énergétique des contraintes de densité.",
    objectifs: [
      'Implémenter et comparer trois heuristiques de placement',
      'Construire un protocole de mesure d\'énergie configurable sur FPGA',
      'Proposer une approche hybride adaptive',
    ],
    methodologie: 'Protocole expérimental sur 20 benchmarks (ISCAS, VPR), mesures de délai, surface et énergie, 30 exécutions par configuration.',
    motsCles: ['Placement', 'Recuit simulé', 'Circuit VLSI', 'Optimisation combinatoire'],
    encadrant: { nom: 'Prof. Thomas Petit', email: 'thomas.petit@universite.ma' },
    dateDepot: '2025-01-28T09:12:00',
    statut: 'EN_ATTENTE',
    historique: [{ decision: 'EN_ATTENTE', date: '2025-01-28T09:12:00', auteur: 'Étudiant', commentaire: 'Dépôt initial du thème.' }],
  },
  {
    id: 2,
    etudiant: { nom: 'Karim Tazi', matricule: 'ETU2024011', email: 'karim.tazi@email.com', niveau: 'Master 2' },
    parcours: 'INFORMATIQUE',
    titre: 'Détection des attaques par injection SQL dans les applications web modernes',
    problematique:
      'Les ORM et les frameworks front-end protègent-ils réellement les applications contre les injections SQL ?',
    resume:
      "Analyse statique et dynamique de 20 applications web open source, avec une détection ciblée des points d'injection survivant aux protections des ORM.",
    objectifs: [
      'Constituer un corpus d\'applications vulnérables',
      'Évaluer les protections des ORM modernes',
      'Proposer une règle de détection transférable',
    ],
    methodologie: 'Analyse statique (AST) et dynamique (fuzzing), campagne de tests sur conteneurs Docker.',
    motsCles: ['Sécurité', 'Injection SQL', 'Analyse statique', 'ORM'],
    encadrant: { nom: 'Dr. Julie Rousseau', email: 'julie.rousseau@universite.ma' },
    dateDepot: '2025-01-25T14:40:00',
    statut: 'EN_ATTENTE',
    historique: [{ decision: 'EN_ATTENTE', date: '2025-01-25T14:40:00', auteur: 'Étudiant', commentaire: 'Dépôt initial du thème.' }],
  },
  {
    id: 3,
    etudiant: { nom: 'Salma Bennis', matricule: 'ETU2024012', email: 'salma.bennis@email.com', niveau: 'Master 1' },
    parcours: 'INFORMATIQUE',
    titre: 'Plateforme de télémédecine rurale avec diagnostic assisté par IA',
    problematique:
      'Quels modèles d\'IA interprétables peuvent être déployés sur du matériel rural à faible connectivité ?',
    resume:
      "Conception d'un modèle de classification des images radiologiques, compressé pour smartphone d'entrée de gamme, avec une couche d'explication des prédictions.",
    objectifs: [
      'Entraîner un modèle léger sur données radiologiques publiques',
      'Quantifier et compresser pour mobile',
      'Proposer une interface d\'explication pour le clinicien',
    ],
    methodologie: 'Datasets publics (NIH ChestX-ray), MobileNet compressé, évaluation sur 5 mid-range.',
    motsCles: ['IA', 'Santé', 'Mobile', 'Interprétabilité'],
    encadrant: { nom: 'Prof. Robert Klein', email: 'robert.klein@universite.ma' },
    dateDepot: '2025-01-22T10:05:00',
    statut: 'EN_ATTENTE',
    historique: [{ decision: 'EN_ATTENTE', date: '2025-01-22T10:05:00', auteur: 'Étudiant', commentaire: 'Dépôt initial du thème.' }],
  },
  {
    id: 4,
    etudiant: { nom: 'Anas Chakib', matricule: 'ETU2024009', email: 'anas.chakib@email.com', niveau: 'Master 2' },
    parcours: 'INFORMATIQUE',
    titre: 'Système de recommandation multi-critères pour le cinéma',
    problematique:
      'Les moteurs de recommandation dégradent-ils la diversité des recommandations lorsque plusieurs critères sont combinés ?',
    resume:
      'Étude comparative de trois algorithmes de fusion multicritère, avec mesures de précision et de diversité sur MovieLens.',
    objectifs: ['Comparer les fusions de classement', 'Mesurer l\'effet sur la diversité', 'Proposer un compromis précision/diversité'],
    methodologie: 'Dataset MovieLens 25M, métriques NDCG@10, intra-list diversity.',
    motsCles: ['Recommandation', 'Multicritère', 'MovieLens', 'Diversité'],
    encadrant: { nom: 'Prof. Marc Simon', email: 'marc.simon@universite.ma' },
    dateDepot: '2025-01-10T16:20:00',
    statut: 'VALIDE',
    historique: [
      { decision: 'EN_ATTENTE', date: '2025-01-10T16:20:00', auteur: 'Étudiant', commentaire: 'Dépôt initial du thème.' },
      { decision: 'VALIDE', date: '2025-01-14T11:05:00', auteur: 'Évaluateur', commentaire: 'Problématique claire et dataset bien maîtrisé.' },
    ],
  },
  {
    id: 5,
    etudiant: { nom: 'Nadia Haddad', matricule: 'ETU2024008', email: 'nadia.haddad@email.com', niveau: 'Master 1' },
    parcours: 'INFORMATIQUE',
    titre: 'Applications web',
    problematique: 'Comment tester automatiquement les applications web modernes ?',
    resume: 'Étude des outils de test automatisé pour les architectures SPA.',
    objectifs: ['Tester une application SPA', 'Comparer les outils'],
    methodologie: 'Aucune méthodologie détaillée.',
    motsCles: ['Test', 'Web'],
    encadrant: { nom: 'Prof. Pierre Durand', email: 'pierre.durand@universite.ma' },
    dateDepot: '2025-01-12T08:45:00',
    statut: 'MODIFICATIONS',
    historique: [
      { decision: 'EN_ATTENTE', date: '2025-01-12T08:45:00', auteur: 'Étudiant', commentaire: 'Dépôt initial du thème.' },
      {
        decision: 'MODIFICATIONS',
        date: '2025-01-13T09:30:00',
        auteur: 'Évaluateur',
        commentaire:
          "Titre trop vague et méthodologie absente. Préciser le périmètre (framework visé), la problématique et le protocole d'évaluation.",
      },
    ],
  },
  {
    id: 6,
    etudiant: { nom: 'Omar Belkacem', matricule: 'ETU2024007', email: 'omar.belkacem@email.com', niveau: 'Master 2' },
    parcours: 'INFORMATIQUE',
    titre: 'Blockchain et traçabilité des chaînes alimentaires',
    problematique: 'La blockchain améliore-t-elle réellement la traçabilité alimentaire ?',
    resume: 'Prototype sur Hyperledger Fabric avec trois acteurs de la filière.',
    objectifs: ['Prototyper', 'Mesurer'],
    methodologie: 'Prototype exploratoire.',
    motsCles: ['Blockchain', 'Traçabilité'],
    encadrant: { nom: 'Prof. Marie Leblanc', email: 'marie.leblanc@universite.ma' },
    dateDepot: '2025-01-05T13:15:00',
    statut: 'REJETE',
    historique: [
      { decision: 'EN_ATTENTE', date: '2025-01-05T13:15:00', auteur: 'Étudiant', commentaire: 'Dépôt initial du thème.' },
      {
        decision: 'REJETE',
        date: '2025-01-07T10:00:00',
        auteur: 'Évaluateur',
        commentaire:
          'Sujet déjà traité par un autre mémoire de la même session. Reposer sur un angle original (confiance des consommateurs).',
      },
    ],
  },
]