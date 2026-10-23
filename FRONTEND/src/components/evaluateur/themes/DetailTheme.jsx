import { BookOpenCheck, ClipboardList, FileText, Hash, MapPin, User } from 'lucide-react'
import Bouton from '../../ui/Bouton'
import LigneInfo from '../../ui/LigneInfo'
import BadgeStatut from './BadgeStatut'
import { formaterDateHeure } from '../../../utils/format'

export default function DetailTheme({ theme, formulaireOuvert, onBasculerFormulaire }) {
  const aUnTheme = theme.statut !== 'SANS_THEME'

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <BadgeStatut statut={theme.statut} />
          <h2 className="mt-2 font-display text-xl font-bold text-navy-900">
            {theme.titre || 'Thème non déposé'}
          </h2>
        </div>
        {aUnTheme && (
          <Bouton onClick={onBasculerFormulaire} className="w-auto">
            <BookOpenCheck size={16} className="mr-1" />
            {formulaireOuvert ? 'Masquer le formulaire' : 'Prononcer une décision'}
          </Bouton>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 border-y border-line-soft py-4">
        <LigneInfo icone={User} label="Étudiant" valeur={theme.etudiant.nom} />
        <LigneInfo icone={Hash} label="Matricule" valeur={theme.etudiant.matricule} />
        <LigneInfo icone={ClipboardList} label="Parcours" valeur={theme.parcoursLibelle} />
        <LigneInfo icone={MapPin} label="Lieu de stage" valeur={theme.lieuStage || 'Non renseigné'} />
      </div>

      {aUnTheme ? (
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="etiquette">Description</h3>
            <p className="text-navy-900 leading-relaxed">{theme.description || 'Non renseignée'}</p>
          </div>
          <div>
            <h3 className="etiquette">Technologies utilisées</h3>
            {theme.technologies.length ? (
              <div className="flex flex-wrap gap-2">
                {theme.technologies.map((techno) => (
                  <span key={techno} className="px-2.5 py-1 rounded-full bg-paper-tint text-ink-soft text-xs">
                    {techno}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-navy-900">Non renseignées</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          Cet étudiant n&apos;a pas encore envoyé son thème depuis l&apos;application mobile.
        </p>
      )}

      {theme.dateDecision && (
        <div className="rounded-xl bg-paper-tint p-4 text-sm">
          <h3 className="etiquette">Dernière décision</h3>
          <p className="text-navy-900">{theme.commentaire || 'Aucun commentaire.'}</p>
          <p className="mt-1 text-xs text-ink-muted">{formaterDateHeure(theme.dateDecision)}</p>
        </div>
      )}

      {aUnTheme && (
        <div className="pt-1">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-navy-900 transition"
            onClick={() => navigator.clipboard?.writeText(theme.titre)}
          >
            <FileText size={16} aria-hidden="true" />
            Copier le titre
          </button>
        </div>
      )}
    </div>
  )
}
