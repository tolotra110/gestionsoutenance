/**
 * Espace étudiant : profil, thème déposé, soutenance et pièces justificatives.
 *
 * Les fonctions sont asynchrones et préparées pour les routes REST qui les
 * remplaceront (GET /api/etudiant/espace, PUT /api/themes/:id, POST /api/etudiants/:id/documents).
 * Tant que le back-end n'expose pas ces routes, les dépôts sont persistés
 * dans le localStorage.
 */
import { DOCUMENTS_DEMO } from '../constants/etudiant'
import { SOUTENANCES } from '../constants/soutenances'
import { THEMES } from '../constants/themes'
import { obtenirTheme, soumettreTheme } from './themeApi'

const CLE_DOCUMENTS = 'etudiant_documents'

/** Compte de démonstration : l'étudiant rattaché à un thème déjà instruit. */
export const ETUDIANT_DEMO = {
  id_etudiant: 5,
  nom: 'Nadia Haddad',
  matricule: 'ETU2024008',
  email: 'nadia.haddad@email.com',
  niveau: 'Master 1',
  parcours: 'INFORMATIQUE',
  promo: '2024/2025',
  encadrant: 'Prof. Pierre Durand',
  id_theme: 5,
}

const pause = () => new Promise((resolve) => setTimeout(resolve, 200))

function lireDocuments() {
  try {
    const brut = localStorage.getItem(CLE_DOCUMENTS)
    return brut ? JSON.parse(brut) : {}
  } catch {
    return {}
  }
}

/** Profil + thème + soutenance + documents, injectés dans les listes de démo. */
export async function obtenirEspaceEtudiant(etudiant = ETUDIANT_DEMO) {
  await pause()

  const theme = await obtenirTheme(etudiant.id_theme)
  const themeReference = THEMES.find((element) => element.id === etudiant.id_theme)
  const soutenance =
    SOUTENANCES.find((element) => element.etudiant.matricule === etudiant.matricule) ?? null

  const modifs = lireDocuments()
  const documents = DOCUMENTS_DEMO.map((document) => modifs[document.id] ?? document)

  return {
    etudiant,
    theme: theme ?? themeReference ?? null,
    aUnTheme: Boolean(theme ?? themeReference),
    soutenance,
    documents,
  }
}

export async function enregistrerThemeEtudiant(themeId, donnees) {
  return soumettreTheme(themeId, donnees, `${ETUDIANT_DEMO.nom} (étudiant)`)
}

export async function deposerDocument(documentId) {
  await pause()

  const document = DOCUMENTS_DEMO.find((element) => element.id === documentId)
  if (!document) throw new Error('Document introuvable.')

  const modifs = lireDocuments()
  modifs[documentId] = { ...document, depose: true, depose_le: new Date().toISOString() }
  localStorage.setItem(CLE_DOCUMENTS, JSON.stringify(modifs))

  return modifs[documentId]
}