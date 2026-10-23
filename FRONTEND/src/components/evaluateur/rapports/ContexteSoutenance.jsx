import { CalendarDays, Clock, MapPin, User } from 'lucide-react'
import LigneInfo from '../../ui/LigneInfo'
import BadgeStatutRapport from './BadgeStatutRapport'
import { formaterDate, formaterDateHeure, formaterHeure } from '../../../utils/format'

export default function ContexteSoutenance({ rapport }) {
  const { soutenance } = rapport

  if (!soutenance) {
    return <p className="text-sm text-ink-muted">Soutenance introuvable pour ce rapport.</p>
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <BadgeStatutRapport statut={rapport.statut} />
            <span className="text-xs text-ink-muted">
              {rapport.soumis_le
                ? `Soumis le ${formaterDateHeure(rapport.soumis_le)}`
                : rapport.maj_le
                  ? `Modifié le ${formaterDateHeure(rapport.maj_le)}`
                  : 'Jamais modifié'}
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-navy-900">{soutenance.sujet}</h2>
          <p className="text-sm text-ink-muted mt-1">
            Rapport de jury · {soutenance.parcours} · jury : {soutenance.jury.map((membre) => membre.nom).join(', ')}
          </p>
        </div>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 border-y border-line-soft py-4">
        <LigneInfo
          icone={User}
          label="Étudiant"
          valeur={`${soutenance.etudiant.nom} (${soutenance.etudiant.matricule})`}
        />
        <LigneInfo icone={User} label="Encadrant" valeur={soutenance.encadrant} />
        <LigneInfo
          icone={CalendarDays}
          label="Soutenance"
          valeur={formaterDate(soutenance.date)}
          complement={`${formaterHeure(soutenance.date)} · ${soutenance.duree} min`}
        />
        <LigneInfo icone={MapPin} label="Salle" valeur={`${soutenance.salle.nom}, ${soutenance.salle.batiment}`} />
        <LigneInfo icone={Clock} label="Créé le" valeur={formaterDateHeure(rapport.cree_le)} />
      </div>
    </div>
  )
}