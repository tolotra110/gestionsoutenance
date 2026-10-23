import { Calendar, MapPin, Star, User } from 'lucide-react'
import BadgeStatutRapport from './BadgeStatutRapport'
import { DECISIONS_RAPPORT } from '../../../constants/rapports'
import { formaterDateCourte, formaterHeure } from '../../../utils/format'

export default function CarteRapport({ rapport, selectionne, onSelect }) {
  const { soutenance } = rapport
  const decision = rapport.decision ? DECISIONS_RAPPORT[rapport.decision] : null

  return (
    <button
      type="button"
      onClick={() => onSelect(rapport.id)}
      aria-pressed={selectionne}
      className={`
        w-full text-left rounded-2xl border bg-white p-4 shadow-sm transition
        ${selectionne ? 'border-navy-600 ring-2 ring-navy-200' : 'border-line hover:border-navy-300 hover:shadow-md'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display font-semibold text-navy-900 text-sm leading-snug">{soutenance?.sujet}</p>
        <BadgeStatutRapport statut={rapport.statut} />
      </div>

      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-medium text-navy-900">{soutenance?.etudiant.nom}</span> — {soutenance?.etudiant.matricule}
      </p>

      <div className="mt-2 space-y-1 text-xs text-ink-muted">
        <p className="flex items-center gap-1.5">
          <Calendar size={13} aria-hidden="true" />
          {formaterDateCourte(soutenance?.date)} · {formaterHeure(soutenance?.date)}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin size={13} aria-hidden="true" />
          {soutenance?.salle.nom} — {soutenance?.salle.batiment}
        </p>
        <p className="flex items-center gap-1.5">
          <User size={13} aria-hidden="true" />
          Encadrant : {soutenance?.encadrant}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-line-soft flex flex-wrap items-center gap-3 text-xs">
        {decision && (
          <span className={`px-2 py-0.5 rounded-full font-semibold ${decision.classe}`}>{decision.label}</span>
        )}
        {rapport.note !== null && rapport.note !== undefined && (
          <span className="flex items-center gap-1 font-semibold text-navy-900">
            <Star size={12} className="text-amber-500" aria-hidden="true" />
            {rapport.note}/20
            {rapport.mention ? ` · ${rapport.mention}` : ''}
          </span>
        )}
      </div>
    </button>
  )
}