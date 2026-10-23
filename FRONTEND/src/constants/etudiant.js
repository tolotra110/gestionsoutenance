/** Profil étudiant, documents et étapes du workflow de soutenance. */

/** Étape courante du parcours, déduite du statut du thème et de la soutenance. */
export const ETAPES_WORKFLOW = [
  { cle: 'theme', label: 'Dépôt du thème' },
  { cle: 'validation', label: 'Validation' },
  { cle: 'soutenance', label: 'Soutenance' },
  { cle: 'decision', label: 'Décision finale' },
]

/**
 * @returns {{ index: number, etat: 'termine' | 'encours' | 'a-venir', libelle: string }}
 */
export function etapeCourante(theme, soutenance) {
  if (!theme) {
    return { index: 0, etat: 'encours', libelle: 'Dépôt du thème à faire' }
  }

  if (theme.statut === 'MODIFICATIONS' || theme.statut === 'REJETE') {
    return { index: 0, etat: 'encours', libelle: 'Corrections à apporter au thème' }
  }

  if (theme.statut === 'EN_ATTENTE') {
    return { index: 1, etat: 'encours', libelle: 'Thème en cours de validation' }
  }

  if (soutenance?.statut === 'TERMINEE') {
    return { index: 3, etat: 'termine', libelle: 'Décision du jury communiquée' }
  }

  return { index: 2, etat: soutenance ? 'encours' : 'a-venir', libelle: 'Soutenance à préparer' }
}

/** Champs du formulaire de dépôt, avec leur règle de validation. */
export const CHAMPS_THEME_ETUDIANT = [
  { id: 'titre', label: 'Titre du thème', lignes: 2, min: 10, requis: true },
  { id: 'problematique', label: 'Problématique', lignes: 3, min: 20, requis: true },
  { id: 'resume', label: 'Résumé', lignes: 4, min: 50, requis: true },
  { id: 'methodologie', label: 'Méthodologie', lignes: 3, min: 20, requis: true },
]

/** Pièces attendues par l'administration (page documents de l'étudiant). */
export const DOCUMENTS_DEMO = [
  {
    id: 'cv',
    libelle: 'Curriculum Vitae',
    precision: 'PDF, 2 pages maximum',
    obligatoire: true,
    depose: true,
    depose_le: '2025-01-06T14:20:00',
  },
  {
    id: 'attestation',
    libelle: 'Attestation d\'inscription',
    precision: 'PDF',
    obligatoire: true,
    depose: true,
    depose_le: '2025-01-06T14:22:00',
  },
  {
    id: 'similarite',
    libelle: 'Rapport de similarité',
    precision: 'PDF — similarité vérifiée par la bibliothèque',
    obligatoire: false,
    depose: false,
    depose_le: null,
  },
  {
    id: 'memoire',
    libelle: 'Mémoire version finale',
    precision: 'PDF — dépôt 15 jours avant la soutenance',
    obligatoire: true,
    depose: false,
    depose_le: null,
  },
  {
    id: 'presentation',
    libelle: 'Support de présentation',
    precision: 'PDF ou PowerPoint',
    obligatoire: false,
    depose: false,
    depose_le: null,
  },
]

export function rappelDocuments(documents = []) {
  const manquants = documents.filter((document) => document.obligatoire && !document.depose)
  return {
    total: documents.length,
    deposes: documents.filter((document) => document.depose).length,
    manquants,
  }
}