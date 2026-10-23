import BadgeStatut from './BadgeStatut'

export default function CarteTheme({ theme, selectionne, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      aria-pressed={selectionne}
      className={`
        w-full text-left rounded-2xl border bg-white p-4 shadow-sm transition
        ${selectionne ? 'border-navy-600 ring-2 ring-navy-200' : 'border-line hover:border-navy-300 hover:shadow-md'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display font-semibold text-navy-900 text-sm leading-snug">
          {theme.titre || 'Thème non déposé'}
        </p>
        <BadgeStatut statut={theme.statut} />
      </div>

      <p className="mt-2 text-sm text-ink-soft">
        <span className="font-medium text-navy-900">{theme.etudiant.nom}</span> — {theme.etudiant.matricule}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{theme.parcoursLibelle}</p>
    </button>
  )
}
