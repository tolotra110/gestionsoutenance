/**
 * Thèmes déposés par les étudiants (application mobile), pour l'espace évaluateur.
 * Routes : GET /api/themes et PUT /api/themes/:id/decision
 */
import { api } from './api'
import { DECISIONS, PARCOURS } from '../constants/themes'

const LIBELLE_PARCOURS = Object.fromEntries(PARCOURS.filter((p) => p.value).map((p) => [p.value, p.label]))

function adapter(r) {
  const titre = (r.theme || '').trim()
  return {
    id: r.id_etudiant,
    etudiant: { nom: [r.prenom, r.nom].filter(Boolean).join(' '), matricule: r.matricule },
    parcours: r.parcours,
    parcoursLibelle: LIBELLE_PARCOURS[r.parcours] ?? r.parcours,
    titre,
    lieuStage: r.lieu_stage || '',
    description: r.description || '',
    technologies: (r.technologies || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    statut: titre ? r.theme_statut || 'EN_ATTENTE' : 'SANS_THEME',
    commentaire: r.theme_commentaire || '',
    dateDecision: r.theme_date_decision || null,
  }
}

/** Tous les étudiants (Informatique, Management, ICM) avec leur thème. */
export async function listerThemes() {
  const lignes = await api.get('/api/themes')
  return lignes.map(adapter)
}

/**
 * Enregistre la décision de l'évaluateur sur le thème d'un étudiant.
 * @param {'VALIDE'|'MODIFICATIONS'|'REJETE'} decision
 */
export async function deciderTheme(themeId, { decision, commentaire }) {
  if (!DECISIONS[decision]) throw new Error('Décision inconnue.')

  // Commentaire facultatif : s'il est rempli, l'étudiant le voit dans l'application mobile
  const commentaireNettoye = (commentaire ?? '').trim()

  await api.put(`/api/themes/${themeId}/decision`, { decision, commentaire: commentaireNettoye })
}

export function statistiquesThemes(themes = []) {
  const compter = (statut) => themes.filter((theme) => theme.statut === statut).length
  return {
    total: themes.length,
    sansTheme: compter('SANS_THEME'),
    enAttente: compter('EN_ATTENTE'),
    valides: compter('VALIDE'),
    modifications: compter('MODIFICATIONS'),
    rejetes: compter('REJETE'),
  }
}
