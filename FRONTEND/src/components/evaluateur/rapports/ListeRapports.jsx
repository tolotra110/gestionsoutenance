import { Search } from 'lucide-react'
import CarteRapport from './CarteRapport'
import { FILTRES_STATUT_RAPPORT } from '../../../constants/rapports'

export default function ListeRapports({
  rapports,
  chargement,
  recherche,
  onRecherche,
  filtreStatut,
  onFiltre,
  selectionId,
  onSelect,
}) {
  function nombrePour(valeur) {
    return valeur === '' ? rapports.length : rapports.filter((rapport) => rapport.statut === valeur).length
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm xl:sticky xl:top-20 space-y-4">
      <div className="relative">
        <label htmlFor="recherche-rapports" className="sr-only">
          Rechercher un rapport
        </label>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          id="recherche-rapports"
          type="search"
          placeholder="Sujet, étudiant, encadrant…"
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-paper-tint focus:border-navy-400 focus:bg-white focus:outline-none text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTRES_STATUT_RAPPORT.map((filtre) => (
          <button
            key={filtre.value || 'TOUS'}
            type="button"
            onClick={() => onFiltre(filtre.value)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition
              ${
                filtreStatut === filtre.value
                  ? 'bg-navy-900 text-white'
                  : 'bg-paper-tint text-ink-soft hover:bg-navy-100 hover:text-navy-900'
              }
            `}
            aria-pressed={filtreStatut === filtre.value}
          >
            {filtre.label}
            <span className="opacity-70">{nombrePour(filtre.value)}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {chargement ? (
          <p className="py-8 text-center text-sm text-ink-muted">Chargement des rapports…</p>
        ) : rapports.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            {recherche || filtreStatut ? 'Aucun rapport ne correspond à ces filtres.' : 'Aucun rapport disponible.'}
          </p>
        ) : (
          rapports.map((rapport) => (
            <CarteRapport
              key={rapport.id}
              rapport={rapport}
              selectionne={rapport.id === selectionId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </section>
  )
}