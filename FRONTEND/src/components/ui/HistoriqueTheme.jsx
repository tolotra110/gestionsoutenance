import { History } from 'lucide-react'
import { DECISIONS } from '../../constants/themes'
import { formaterDateHeure } from '../../utils/format'

const COULEURS_DECISION = {
  VALIDE: 'bg-success',
  REJETE: 'bg-danger',
  MODIFICATIONS: 'bg-amber-500',
  EN_ATTENTE: 'bg-navy-500',
}

export default function HistoriqueTheme({ theme }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h3 className="font-display font-semibold text-navy-900 flex items-center gap-2">
        <History size={18} className="text-navy-600" aria-hidden="true" />
        Historique du thème
      </h3>

      <ol className="mt-4 space-y-4">
        {theme.historique.map((entree, index) => (
          <li key={`${entree.date}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-2.5 w-2.5 rounded-full ${COULEURS_DECISION[entree.decision] ?? 'bg-navy-500'}`}
                aria-hidden="true"
              />
              {index < theme.historique.length - 1 && <span className="flex-1 w-px bg-line my-1" />}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium text-navy-900">
                {entree.decision === 'EN_ATTENTE'
                  ? 'Dépôt du thème'
                  : DECISIONS[entree.decision]?.label ?? entree.decision}
                <span className="ml-2 font-normal text-xs text-ink-muted">
                  {formaterDateHeure(entree.date)} · {entree.auteur}
                </span>
              </p>
              <p className="text-sm text-ink-soft mt-0.5">{entree.commentaire}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}