import { CheckCircle2, CircleDashed } from 'lucide-react'
import { ETAPES_WORKFLOW } from '../../constants/etudiant'

export default function EtapesWorkflow({ index, etat, libelle }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-semibold text-navy-900">Progression de ma soutenance</h2>
        <span
          className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${
            etat === 'termine' ? 'bg-emerald-100 text-emerald-700' : 'bg-navy-100 text-navy-700'
          }`}
        >
          {libelle}
        </span>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ETAPES_WORKFLOW.map((etape, position) => {
          const terminee = position < index || etat === 'termine'
          const encours = position === index && etat !== 'termine'

          return (
            <li
              key={etape.cle}
              className={`
                flex items-start gap-3 rounded-xl border p-4 transition
                ${terminee ? 'border-success/40 bg-success-soft' : encours ? 'border-navy-600 bg-navy-50' : 'border-line bg-paper-tint/50'}
              `}
            >
              <span
                className={`
                  h-7 w-7 flex-none rounded-full flex items-center justify-center text-xs font-semibold
                  ${terminee ? 'bg-success text-white' : encours ? 'bg-navy-900 text-white' : 'bg-line text-ink-muted'}
                `}
                aria-hidden="true"
              >
                {terminee ? <CheckCircle2 size={16} /> : position + 1}
              </span>
              <div className="min-w-0">
                <p className={`font-medium ${terminee || encours ? 'text-navy-900' : 'text-ink-muted'}`}>
                  {etape.label}
                </p>
                <p className="text-xs text-ink-muted">
                  {terminee ? 'Terminé' : encours ? 'En cours' : 'À venir'}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
        <CircleDashed size={14} aria-hidden="true" />
        Le parcours est mis à jour dès que l&apos;évaluateur se prononce sur votre thème.
      </p>
    </div>
  )
}