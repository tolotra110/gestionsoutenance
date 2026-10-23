import { Search } from 'lucide-react'
import CarteTheme from './CarteTheme'
import { FILTRES_STATUT } from '../../../constants/themes'

export default function ListeThemes({
  themes,
  chargement,
  recherche,
  onRecherche,
  filtreStatut,
  onFiltre,
  comptes,
  selectionId,
  onSelect,
}) {
  const nombrePour = (valeur) => comptes[valeur] ?? 0

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm xl:sticky xl:top-20 space-y-4">
      <div className="relative">
        <label htmlFor="recherche-themes" className="sr-only">
          Rechercher un thème
        </label>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          id="recherche-themes"
          type="search"
          placeholder="Étudiant, matricule, thème…"
          value={recherche}
          onChange={(e) => onRecherche(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-paper-tint focus:border-navy-400 focus:bg-white focus:outline-none text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTRES_STATUT.map((filtre) => (
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
          <p className="py-8 text-center text-sm text-ink-muted">Chargement des étudiants…</p>
        ) : themes.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            {recherche || filtreStatut ? 'Aucun étudiant ne correspond à ces filtres.' : 'Aucun étudiant enregistré pour le moment.'}
          </p>
        ) : (
          themes.map((theme) => (
            <CarteTheme key={theme.id} theme={theme} selectionne={theme.id === selectionId} onSelect={onSelect} />
          ))
        )}
      </div>
    </section>
  )
}