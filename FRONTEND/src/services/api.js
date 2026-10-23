// Client générique pour les routes protégées du back-end (jeton JWT du login existant)
import { getSession, clearSession } from './authApi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function request(path, { method = 'GET', body } = {}) {
  const session = getSession()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new Error('Impossible de contacter le serveur.')
  })

  const data = await res.json().catch(() => null)

  if (res.status === 401 && session) {
    // jeton expiré : retour à l'écran de connexion
    clearSession()
    window.location.href = '/connexion'
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Erreur ${res.status}`)
    err.status = res.status
    err.conflits = data?.conflits || []
    throw err
  }
  return data
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
}

/** Planning public d'un étudiant (application mobile, sans connexion). */
export async function getPlanningEtudiant(matricule) {
  const res = await fetch(`${API_URL}/api/public/planning/${encodeURIComponent(matricule.trim())}`).catch(() => {
    throw new Error('Impossible de contacter le serveur.')
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || `Erreur ${res.status}`)
  return data
}
