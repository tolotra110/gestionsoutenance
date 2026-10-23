/**
 * Accès aux thèmes déposés par les étudiants et à leur validation.
 *
 * Les fonctions sont asynchrones et préparées pour les routes REST qui les
 * remplaceront (GET /api/themes, GET /api/themes/:id,
 * POST /api/themes/:id/decision). Tant que le back-end n'expose pas ces
 * routes, les décisions sont persistées dans le localStorage.
 */
import { DECISIONS, THEMES } from '../constants/themes'

const CLE_THEME = (themeId) => `theme:${themeId}`

const pause = () => new Promise((resolve) => setTimeout(resolve, 200))

function lireDecision(themeId) {
  try {
    const brut = localStorage.getItem(CLE_THEME(themeId))
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}

/** Thème de démonstration complété par la décision éventuellement prise localement. */
function hydrater(theme) {
  const decision = lireDecision(theme.id)
  if (!decision) return theme
  return { ...theme, ...decision, historique: [...theme.historique, ...(decision.historique ?? [])] }
}

export async function listerThemes() {
  await pause()
  return THEMES.map(hydrater)
}

export async function obtenirTheme(themeId) {
  await pause()
  const theme = THEMES.find((element) => element.id === Number(themeId))
  return theme ? hydrater(theme) : null
}

/**
 * Enregistre la décision de l'évaluateur sur un thème.
 * @param {'VALIDE'|'MODIFICATIONS'|'REJETE'} decision
 */
export async function deciderTheme(themeId, { decision, commentaire, auteur = 'Évaluateur' }) {
  await pause()

  if (!DECISIONS[decision]) throw new Error('Décision inconnue.')

  const commentaireNettoye = (commentaire ?? '').trim()

  const theme = THEMES.find((element) => element.id === Number(themeId))
  if (!theme) throw new Error('Thème introuvable.')

  const maintenant = new Date().toISOString()
  const entree = {
    decision,
    date: maintenant,
    auteur,
    commentaire: commentaireNettoye || regles.description,
  }

  const decisionEnregistree = {
    statut: regles.statut,
    dernierCommentaire: commentaireNettoye,
    decideur: auteur,
    date_decision: maintenant,
    historique: [entree],
  }

  localStorage.setItem(CLE_THEME(themeId), JSON.stringify(decisionEnregistree))
  return hydrater({ ...theme, ...decisionEnregistree, historique: [...theme.historique, entree] })
}

export async function annulerDecision(themeId) {
  await pause()
  localStorage.removeItem(CLE_THEME(themeId))
  return obtenirTheme(themeId)
}

/**
 * Dépôt ou redépôt d'une proposition par l'étudiant.
 * Repart le cycle de validation : le thème repasse en attente et les
 * précédentes décisions sont conservées dans l'historique.
 */
export async function soumettreTheme(themeId, donnees, auteur = 'Étudiant') {
  await pause()

  const existant = await obtenirTheme(themeId)
  if (!existant) throw new Error('Thème introuvable.')

  const vide = (champ) => !String(donnees[champ] ?? '').trim()
  const tropCourt = (champ, minimum) => String(donnees[champ] ?? '').trim().length < minimum

  if (vide('titre') || tropCourt('titre', 10)) {
    throw new Error('Le titre du thème doit comporter au moins 10 caractères.')
  }
  if (tropCourt('problematique', 20)) {
    throw new Error('La problématique doit être développée (20 caractères minimum).')
  }
  if (tropCourt('resume', 50)) {
    throw new Error('Le résumé doit présenter le sujet en 50 caractères minimum.')
  }
  if (tropCourt('methodologie', 20)) {
    throw new Error('La méthodologie doit être décrite (20 caractères minimum).')
  }
  if (!(donnees.objectifs ?? []).some((objectif) => String(objectif).trim())) {
    throw new Error('Renseignez au moins un objectif.')
  }
  if (!(donnees.motsCles ?? []).some((mot) => String(mot).trim())) {
    throw new Error('Renseignez au moins un mot-clé.')
  }

  const maintenant = new Date().toISOString()
  const entree = {
    decision: 'EN_ATTENTE',
    date: maintenant,
    auteur,
    commentaire: 'Nouvelle proposition déposée, en attente de validation.',
  }

  // Seul le delta est stocké : l'historique de base est ré-hydraté à la lecture.
  localStorage.setItem(
    CLE_THEME(themeId),
    JSON.stringify({
      titre: donnees.titre.trim(),
      problematique: donnees.problematique.trim(),
      resume: donnees.resume.trim(),
      methodologie: donnees.methodologie.trim(),
      objectifs: donnees.objectifs.map((objectif) => String(objectif).trim()).filter(Boolean),
      motsCles: donnees.motsCles.map((mot) => String(mot).trim()).filter(Boolean),
      statut: 'EN_ATTENTE',
      dernierCommentaire: null,
      decideur: null,
      date_decision: null,
      historique: [entree],
    }),
  )

  return hydrater({ ...existant, ...donnees })
}

export function statistiquesThemes(themes = []) {
  return {
    total: themes.length,
    enAttente: themes.filter((theme) => theme.statut === 'EN_ATTENTE').length,
    valides: themes.filter((theme) => theme.statut === 'VALIDE').length,
    modifications: themes.filter((theme) => theme.statut === 'MODIFICATIONS').length,
    rejetes: themes.filter((theme) => theme.statut === 'REJETE').length,
  }
}