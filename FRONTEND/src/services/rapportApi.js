/**
 * Rapports de jury : lecture, rédaction (brouillon) et soumission.
 *
 * Données réelles fournies par le back-end
 * (GET /api/rapports, PUT /api/rapports/:id, POST /api/rapports/:id/soumettre).
 * Le contexte de soutenance est joint côté front à partir de la liste
 * des soutenances de l'évaluateur (services/soutenanceApi.js).
 */
import { api } from './api'
import { listerSoutenances } from './soutenanceApi'
import { mentionPour } from '../constants/rapports'

/** Adapte un rapport de l'API au format utilisé par React. */
function adapterRapport(rapport, soutenanceParId = {}) {
  return {
    id: rapport.id,
    soutenanceId: rapport.id_soutenance,
    statut: rapport.statut,
    decision: rapport.decision ?? null,
    mention: rapport.mention ?? null,
    note: rapport.note ?? null,
    cree_le: rapport.cree_le ?? null,
    maj_le: rapport.maj_le ?? null,
    soumis_le: rapport.soumis_le ?? null,
    soutenance: soutenanceParId[rapport.id_soutenance] ?? null,
  }
}

/** Liste les rapports de l'évaluateur connecté, avec leur soutenance. */
export async function listerRapports() {
  const [rapports, soutenances] = await Promise.all([
    api.get('/api/rapports'),
    listerSoutenances(),
  ])

  const soutenanceParId = Object.fromEntries(
    soutenances.map((soutenance) => [soutenance.id, soutenance])
  )

  return rapports
    .map((rapport) => adapterRapport(rapport, soutenanceParId))
    .sort((a, b) => new Date(a.soutenance?.date ?? 0) - new Date(b.soutenance?.date ?? 0))
}

export async function obtenirRapport(rapportId) {
  const rapports = await listerRapports()
  return rapports.find((rapport) => Number(rapport.id) === Number(rapportId)) ?? null
}

export async function enregistrerBrouillonRapport(rapportId, donnees) {
  const existant = await obtenirRapport(rapportId)
  if (existant?.statut === 'SOUMIS') {
    throw new Error('Ce rapport a été soumis : il n\'est plus modifiable.')
  }

  const enregistre = await api.put(`/api/rapports/${rapportId}`, {
    decision: donnees.decision ?? null,
    mention: donnees.mention ?? null,
    note: donnees.note ?? null,
  })

  return adapterRapport(enregistre, {
    [enregistre.id_soutenance]: existant?.soutenance ?? null,
  })
}

export async function soumettreRapport(rapportId, donnees) {
  const existant = await obtenirRapport(rapportId)
  if (!existant) throw new Error('Rapport introuvable.')

  const manquants = []
  if (!donnees.decision) manquants.push('une décision du jury')
  if (donnees.note === null || donnees.note === undefined || donnees.note === '') manquants.push('une note sur 20')

  if (manquants.length > 0) {
    throw new Error(`Ajoutez ${manquants.join(', ')} avant de soumettre le rapport.`)
  }

  const note = Number(donnees.note)
  const soumis = await api.post(`/api/rapports/${rapportId}/soumettre`, {
    decision: donnees.decision,
    mention: donnees.mention ?? mentionPour(note)?.label ?? null,
    note,
  })

  return adapterRapport(soumis, { [soumis.id_soutenance]: existant.soutenance })
}

export function statistiquesRapports(rapports = []) {
  const notes = rapports.filter((rapport) => rapport.note !== null && rapport.note !== undefined)
  return {
    total: rapports.length,
    aRediger: rapports.filter((rapport) => rapport.statut === 'A_REDIGER').length,
    enCours: rapports.filter((rapport) => rapport.statut === 'EN_COURS').length,
    soumis: rapports.filter((rapport) => rapport.statut === 'SOUMIS').length,
    moyenne: notes.length > 0 ? notes.reduce((somme, rapport) => somme + Number(rapport.note), 0) / notes.length : null,
  }
}
