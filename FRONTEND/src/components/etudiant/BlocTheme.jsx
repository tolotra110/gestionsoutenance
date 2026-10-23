import { Pencil, Send } from 'lucide-react'
import Bouton from '../ui/Bouton'
import Alerte from '../ui/Alerte'
import BadgeStatut from '../evaluateur/themes/BadgeStatut'
import { STATUT_CONFIG } from '../../constants/themes'
import { formaterDate } from '../../utils/format'

export default function BlocTheme({ theme, onBasculerFormulaire, peutModifier }) {
  if (!theme) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="font-display font-semibold text-navy-900">Mon thème</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Vous n&apos;avez pas encore déposé de thème. Déposez votre proposition pour qu&apos;elle soit soumise à validation.
        </p>
        <Bouton onClick={onBasculerFormulaire} className="mt-4 w-auto">
          <Send size={16} className="mr-1" />
          Déposer mon thème
        </Bouton>
      </div>
    )
  }

  const modifiable = peutModifier && theme.statut !== 'VALIDE'
  const configStatut = STATUT_CONFIG[theme.statut] ?? STATUT_CONFIG.EN_ATTENTE

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <BadgeStatut statut={theme.statut} />
            <span className="text-xs text-ink-muted">
              {theme.statut === 'EN_ATTENTE'
                ? 'Proposition en cours de validation'
                : theme.statut === 'VALIDE'
                  ? 'Thème validé par l\'évaluateur'
                  : 'Corrections demandées par l\'évaluateur'}
            </span>
          </div>
          <h2 className="mt-2 font-display text-lg font-bold text-navy-900">{theme.titre}</h2>
        </div>

        {modifiable && (
          <Bouton variante="secondaire" onClick={onBasculerFormulaire} className="w-auto">
            <Pencil size={16} className="mr-1" />
            {theme.statut === 'EN_ATTENTE' ? 'Modifier mon thème' : 'Corriger mon thème'}
          </Bouton>
        )}
      </div>

      {theme.statut === 'EN_ATTENTE' && (
        <Alerte variante="info" className="mt-4">
          Votre thème a été transmis à l&apos;évaluateur. Vous pouvez encore le modifier tant que la décision n&apos;est pas
          prise.
        </Alerte>
      )}

      {theme.dernier_commentaire && (theme.statut === 'MODIFICATIONS' || theme.statut === 'REJETE') && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="etiquette text-amber-800">Commentaire de l&apos;évaluateur</p>
          <p className="text-sm text-amber-900">{theme.dernier_commentaire}</p>
        </div>
      )}

      {theme.statut === 'VALIDE' && (
        <Alerte variante="succes" className="mt-4">
          Thème validé{theme.date_decision ? ` le ${formaterDate(theme.date_decision)}` : ''}. Vous pouvez concentrer vos
          efforts sur la rédaction du mémoire.
        </Alerte>
      )}

      <div className="mt-5 space-y-4 text-sm">
        <div>
          <h3 className="etiquette">Problématique</h3>
          <p className="text-navy-900">{theme.problematique}</p>
        </div>
        <div>
          <h3 className="etiquette">Résumé</h3>
          <p className="text-navy-900 leading-relaxed">{theme.resume}</p>
        </div>
        <div>
          <h3 className="etiquette">Objectifs</h3>
          <ul className="space-y-1.5">
            {theme.objectifs.map((objectif) => (
              <li key={objectif} className="flex items-start gap-2 text-navy-900">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-navy-500" aria-hidden="true" />
                <span>{objectif}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="etiquette">Méthodologie</h3>
          <p className="text-navy-900 leading-relaxed">{theme.methodologie}</p>
        </div>
        <div>
          <h3 className="etiquette">Mots-clés</h3>
          <div className="flex flex-wrap gap-2">
            {theme.motsCles.map((mot) => (
              <span key={mot} className="px-2.5 py-1 rounded-full bg-paper-tint text-ink-soft text-xs">
                {mot}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 pt-4 border-t border-line-soft text-xs text-ink-muted">
        Statut actuel : {configStatut?.label ?? theme.statut}
      </p>
    </div>
  )
}