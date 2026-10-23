import { CalendarDays, Clock, Mail, MapPin, User } from 'lucide-react'
import LigneInfo from '../ui/LigneInfo'
import { STATUT_CONFIG } from '../../constants/soutenances'
import { formaterDate, formaterHeure } from '../../utils/format'

export default function BlocSoutenance({ soutenance }) {
  if (!soutenance) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="font-display font-semibold text-navy-900">Ma soutenance</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Aucune soutenance n&apos;est encore planifiée. Elle sera programmée après la validation de votre thème.
        </p>
      </div>
    )
  }

  const statut = STATUT_CONFIG[soutenance.statut] ?? STATUT_CONFIG.A_VENIR

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-display font-semibold text-navy-900">Ma soutenance</h2>
        <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${statut.classe}`}>
          {statut.label}
        </span>
      </div>

      <p className="mt-2 font-display text-lg font-semibold text-navy-900">{soutenance.sujet}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 border-t border-line-soft pt-4">
        <LigneInfo icone={CalendarDays} label="Date" valeur={formaterDate(soutenance.date)} />
        <LigneInfo icone={Clock} label="Heure" valeur={`${formaterHeure(soutenance.date)} · ${soutenance.duree} min`} />
        <LigneInfo icone={MapPin} label="Salle" valeur={`${soutenance.salle.nom}, ${soutenance.salle.batiment}`} />
        <LigneInfo icone={User} label="Encadrant" valeur={soutenance.encadrant} />
        <LigneInfo
          icone={User}
          label="Jury"
          valeur={soutenance.jury.map((membre) => `${membre.nom} (${membre.role})`).join(', ')}
        />
        <LigneInfo icone={Mail} label="Contact" valeur={soutenance.jury[0]?.nom ?? '—'} />
      </div>
    </div>
  )
}