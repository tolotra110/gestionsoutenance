/**
 * Rapports de jury : un rapport par soutenance évaluée, rédigé par l'évaluateur.
 * Cycle de vie : A_REDIGER -> EN_COURS -> SOUMIS (lecture seule).
 */
import { SOUTENANCES } from './soutenances'

export const STATUTS_RAPPORT = {
  A_REDIGER: { label: 'À rédiger', classe: 'bg-sky-100 text-sky-700' },
  EN_COURS: { label: 'En cours', classe: 'bg-amber-100 text-amber-700' },
  SOUMIS: { label: 'Soumis', classe: 'bg-emerald-100 text-emerald-700' },
}

export const FILTRES_STATUT_RAPPORT = [
  { value: '', label: 'Tous' },
  { value: 'A_REDIGER', label: 'À rédiger' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SOUMIS', label: 'Soumis' },
]

export const DECISIONS_RAPPORT = {
  ADMIS: {
    label: 'Admis',
    description: "Le jury valide la soutenance et le candidat est déclaré admis.",
    classe: 'bg-emerald-100 text-emerald-700',
  },
  AJOURNE: {
    label: 'Ajourné',
    description: 'Le jury report la décision à une seconde soutenance.',
    classe: 'bg-red-100 text-red-700',
  },
}

export const MENTIONS = [
  { min: 18, label: 'Excellent' },
  { min: 16, label: 'Très bien' },
  { min: 14, label: 'Bien' },
  { min: 12, label: 'Assez bien' },
  { min: 10, label: 'Passable' },
]

export function mentionPour(note) {
  if (note === null || note === undefined) return null
  return MENTIONS.find((mention) => note >= mention.min) ?? { label: 'Insuffisant', min: 0 }
}

/** Contenu des rapports, rattaché aux soutenances de démonstration. */
export const RAPPORTS = [
  {
    id: 1,
    soutenanceId: 1,
    statut: 'A_REDIGER',
    decision: null,
    mention: null,
    note: null,
    cree_le: '2025-01-18T08:00:00',
    maj_le: null,
    soumis_le: null,
  },
  {
    id: 2,
    soutenanceId: 2,
    statut: 'SOUMIS',
    decision: 'ADMIS',
    mention: 'Bien',
    note: 14,
    cree_le: '2025-01-14T09:00:00',
    maj_le: '2025-01-15T16:10:00',
    soumis_le: '2025-01-15T16:10:00',
  },
  {
    id: 3,
    soutenanceId: 3,
    statut: 'EN_COURS',
    decision: null,
    mention: null,
    note: null,
    cree_le: '2025-01-24T16:00:00',
    maj_le: '2025-01-25T12:30:00',
    soumis_le: null,
  },
  {
    id: 4,
    soutenanceId: 4,
    statut: 'A_REDIGER',
    decision: null,
    mention: null,
    note: null,
    cree_le: '2025-01-09T10:00:00',
    maj_le: null,
    soumis_le: null,
  },
  {
    id: 5,
    soutenanceId: 5,
    statut: 'A_REDIGER',
    decision: null,
    mention: null,
    note: null,
    cree_le: '2025-01-30T11:20:00',
    maj_le: null,
    soumis_le: null,
  },
]

/** Rattachement rapport -> soutenance, utilisé par le service. */
export const SOUTENANCE_PAR_ID = Object.fromEntries(SOUTENANCES.map((soutenance) => [soutenance.id, soutenance]))
