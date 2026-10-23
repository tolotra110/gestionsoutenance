/** Données de démonstration : soutenances assignées à l'évaluateur. */
export const SOUTENANCES = [
  {
    id: 1,
    etudiant: { nom: 'Marie Dupont', matricule: 'ETU2024001' },
    sujet: "Développement d'une application de gestion de bibliothèque universitaire",
    parcours: 'INFORMATIQUE',
    encadrant: 'Prof. Jean Martin',
    date: '2025-01-20T10:00:00',
    duree: 45,
    salle: { nom: 'Salle A101', batiment: 'Bâtiment A' },
    jury: [
      { nom: 'Dr. Sophie Bernard', role: 'Président' },
      { nom: 'Prof. Pierre Durand', role: 'Examinateur' },
    ],
    statut: 'A_VENIR',
  },
  {
    id: 2,
    etudiant: { nom: 'Ahmed Benali', matricule: 'ETU2024002' },
    sujet: "Système de recommandation par apprentissage automatique pour l'e-commerce",
    parcours: 'INFORMATIQUE',
    encadrant: 'Prof. Marie Leblanc',
    date: '2025-01-15T14:30:00',
    duree: 45,
    salle: { nom: 'Salle B203', batiment: 'Bâtiment B' },
    jury: [
      { nom: 'Dr. Robert Klein', role: 'Président' },
      { nom: 'Prof. Anne Moreau', role: 'Examinateur' },
    ],
    statut: 'TERMINEE',
  },
  {
    id: 3,
    etudiant: { nom: 'Sophie Lambert', matricule: 'ETU2024003' },
    sujet: 'Analyse prédictive des pannes industrielles par IoT',
    parcours: 'INFORMATIQUE',
    encadrant: 'Prof. Thomas Petit',
    date: '2025-01-25T09:00:00',
    duree: 45,
    salle: { nom: 'Salle C305', batiment: 'Bâtiment C' },
    jury: [
      { nom: 'Dr. Julie Rousseau', role: 'Président' },
      { nom: 'Prof. Marc Simon', role: 'Examinateur' },
    ],
    statut: 'EN_COURS',
  },
  {
    id: 4,
    etudiant: { nom: 'Lucas Moreau', matricule: 'ETU2024004' },
    sujet: 'Plateforme collaborative de gestion de projets agiles',
    parcours: 'INFORMATIQUE',
    encadrant: 'Prof. Julie Rousseau',
    date: '2025-01-10T11:00:00',
    duree: 45,
    salle: { nom: 'Salle A102', batiment: 'Bâtiment A' },
    jury: [
      { nom: 'Dr. Pierre Durand', role: 'Président' },
      { nom: 'Prof. Sophie Bernard', role: 'Examinateur' },
    ],
    statut: 'ANNULEE',
  },
  {
    id: 5,
    etudiant: { nom: 'Emma Petit', matricule: 'ETU2024005' },
    sujet: 'Application mobile de suivi de santé connectée',
    parcours: 'INFORMATIQUE',
    encadrant: 'Prof. Robert Klein',
    date: '2025-02-01T10:30:00',
    duree: 45,
    salle: { nom: 'Salle B204', batiment: 'Bâtiment B' },
    jury: [
      { nom: 'Dr. Anne Moreau', role: 'Président' },
      { nom: 'Prof. Marc Simon', role: 'Examinateur' },
    ],
    statut: 'A_VENIR',
  },
  {
    id: 6,
    etudiant: { nom: 'Nadia Haddad', matricule: 'ETU2024008' },
    sujet: 'Tests automatisés des applications web modernes',
    parcours: 'INFORMATIQUE',
    encadrant: 'Prof. Pierre Durand',
    date: '2025-03-12T10:00:00',
    duree: 45,
    salle: { nom: 'Salle D101', batiment: 'Bâtiment D' },
    jury: [
      { nom: 'Dr. Julie Rousseau', role: 'Président' },
      { nom: 'Prof. Thomas Petit', role: 'Examinateur' },
    ],
    statut: 'A_VENIR',
  },
]

export const STATUTS_SOUTENANCE = [
  { value: '', label: 'Tous les statuts' },
  { value: 'A_VENIR', label: 'À venir' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
]

export const STATUT_CONFIG = {
  A_VENIR: { label: 'À venir', classe: 'bg-sky-100 text-sky-700' },
  EN_COURS: { label: 'En cours', classe: 'bg-amber-100 text-amber-700' },
  TERMINEE: { label: 'Terminée', classe: 'bg-emerald-100 text-emerald-700' },
  ANNULEE: { label: 'Annulée', classe: 'bg-red-100 text-red-700' },
}