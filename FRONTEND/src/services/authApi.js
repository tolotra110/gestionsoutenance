// Point d'entrée unique vers l'API du back-end existant
// (Routes/authRoutes.js -> POST /api/auth/login, POST /api/auth/register)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Connexion.
 * Le back-end (Controllers/authController.js) attend exactement
 * { email, mot_de_passe } et renvoie { message, token, utilisateur }
 * où utilisateur = { id_utilisateur, nom, email, role, parcours }.
 *
 * Dans notre formulaire, le champ affiché "Code d'accès" EST le mot de passe
 * du compte (ex: Info@gmail.com / INFORMATIQUE) : on ne renomme rien côté
 * back, on adapte juste le nom du champ envoyé.
 */
export async function login(email, codeAcces) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mot_de_passe: codeAcces }),
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // réponse vide / non-JSON (ex: serveur injoignable côté proxy)
  }

  if (!res.ok) {
    const message =
      data?.message ||
      (res.status === 0
        ? "Impossible de contacter le serveur."
        : `Erreur ${res.status}`)
    throw new Error(message)
  }

  return data // { message, token, utilisateur }
}

/**
 * Inscription (pour le moment utilisée par l'espace "Évaluateur").
 * Le back-end (Controllers/authController.js) attend
 * { nom, email, mot_de_passe, parcours } et fixe le rôle à "evaluateur".
 */
export async function register({ nom, email, mot_de_passe, parcours }) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom, email, mot_de_passe, parcours, role: 'evaluateur' }),
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // réponse vide / non-JSON
  }

  if (!res.ok) {
    throw new Error(data?.message || `Erreur ${res.status}`)
  }

  return data // { message, utilisateur }
}

/** Récupère le profil de l'utilisateur connecté ("Mon compte"). */
export async function getMonCompte(token) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || `Erreur ${res.status}`)
  }

  return data.utilisateur
}

/** Met à jour nom / email / parcours de l'utilisateur connecté ("Mon compte"). */
export async function updateMonCompte(token, { nom, email, parcours }) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nom, email, parcours }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || `Erreur ${res.status}`)
  }

  return data.utilisateur
}

/**
 * Paramètres du compte : change l'email de connexion et/ou le mot de passe.
 * Le mot de passe actuel est obligatoire. Met aussi à jour l'email de la session locale.
 */
export async function changerIdentifiants({ email, mot_de_passe_actuel, nouveau_mot_de_passe }) {
  const session = getSession()
  if (!session) throw new Error('Session expirée, reconnectez-vous.')

  const res = await fetch(`${API_URL}/api/auth/identifiants`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify({ email, mot_de_passe_actuel, nouveau_mot_de_passe }),
  }).catch(() => {
    throw new Error('Impossible de contacter le serveur.')
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || `Erreur ${res.status}`)

  if (data?.utilisateur) saveSession(session.token, { ...session.utilisateur, ...data.utilisateur })
  return data // { message, utilisateur }
}

export function saveSession(token, utilisateur) {
  localStorage.setItem('emit_token', token)
  localStorage.setItem('emit_utilisateur', JSON.stringify(utilisateur))
}

export function getSession() {
  const token = localStorage.getItem('emit_token')
  const raw = localStorage.getItem('emit_utilisateur')
  if (!token || !raw) return null
  try {
    return { token, utilisateur: JSON.parse(raw) }
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('emit_token')
  localStorage.removeItem('emit_utilisateur')
}

/** Normalise "Informatique", "INFO", "informatique " ... -> true/false */
export function estParcoursInformatique(parcours) {
  if (!parcours) return false
  const p = parcours.trim().toUpperCase()
  return p === 'INFORMATIQUE' || p === 'INFO'
}

/** true si le compte connecté est un compte étudiant. */
export function estEtudiant(role) {
  if (!role) return false
  const r = role.trim().toLowerCase()
  return r === 'etudiant' || r === 'étudiant'
}

/** true si le compte connecté est un compte évaluateur. */
export function estEvaluateur(role) {
  if (!role) return false
  return role.trim().toLowerCase() === 'evaluateur'
}

export function estResponsableMention(role) {
  if (!role) return false
  const r = role.trim().toLowerCase()
  return r === 'responsable_mention' || r === 'responsable mention' || r === 'responsable'
}

/** Utilisateur de la session locale si le JWT n'est pas expiré, sinon null. */
export function sessionValide() {
  const s = getSession()
  if (!s) return null
  try {
    const { exp } = JSON.parse(atob(s.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (exp && exp * 1000 < Date.now()) {
      clearSession()
      return null
    }
  } catch {
    clearSession()
    return null
  }
  return s.utilisateur
}
