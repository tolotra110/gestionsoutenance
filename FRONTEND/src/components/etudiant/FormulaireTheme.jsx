import { useState } from 'react'
import { Send } from 'lucide-react'
import Bouton from '../ui/Bouton'
import Alerte from '../ui/Alerte'
import { CHAMPS_THEME_ETUDIANT } from '../../constants/etudiant'

const CLASSES_CHAMP =
  'w-full px-4 py-3 text-sm text-navy-900 placeholder:text-ink-muted/70 bg-paper-tint/60 border border-line rounded-xl focus:bg-white focus:border-navy-400 focus:outline-none transition resize-y'

function ListeTags({ valeurs, onChange, placeholder, aide }) {
  return (
    <div>
      <input
        type="text"
        value={valeurs.join(', ')}
        onChange={(e) => onChange(e.target.value.split(',').map((valeur) => valeur.trim()))}
        placeholder={placeholder}
        aria-label={aide}
        className={CLASSES_CHAMP.replace('resize-y', '')}
      />
      <p className="mt-1 text-xs text-ink-muted">{aide}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {valeurs.filter(Boolean).map((valeur) => (
          <span key={valeur} className="px-2.5 py-1 rounded-full bg-paper-tint text-ink-soft text-xs">
            {valeur}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FormulaireTheme({ theme, onSoumettre, onAnnuler, enCours }) {
  const [contenu, setContenu] = useState({
    titre: theme?.titre ?? '',
    problematique: theme?.problematique ?? '',
    resume: theme?.resume ?? '',
    methodologie: theme?.methodologie ?? '',
    objectifs: theme?.objectifs ?? [''],
    motsCles: theme?.motsCles ?? [''],
  })
  const [erreur, setErreur] = useState(null)

  function maj(champ, valeur) {
    setContenu((precedent) => ({ ...precedent, [champ]: valeur }))
    setErreur(null)
  }

  function majListe(champ, index, valeur) {
    const copie = [...contenu[champ]]
    copie[index] = valeur
    maj(champ, copie)
  }

  function ajouter(champ) {
    maj(champ, [...contenu[champ], ''])
  }

  function retirer(champ, index) {
    maj(
      champ,
      contenu[champ].filter((_, position) => position !== index),
    )
  }

  async function handleSoumettre(event) {
    event.preventDefault()
    setErreur(null)
    try {
      await onSoumettre(contenu)
    } catch (exception) {
      setErreur(exception.message)
    }
  }

  const champsIncomplets = CHAMPS_THEME_ETUDIANT.filter(
    (champ) => contenu[champ.id].trim().length < champ.min,
  ).length

  return (
    <div className="rounded-2xl border border-navy-200 bg-navy-50 p-6">
      <form onSubmit={handleSoumettre} className="space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-navy-900">
            {theme ? 'Corriger ma proposition' : 'Déposer mon thème'}
          </h2>
          <p className="text-sm text-ink-soft mt-1">
            Les champs marqués d&apos;un astérisque (*) sont obligatoires. Une fois envoyé, votre thème est transmis à
            l&apos;évaluateur pour validation.
          </p>
        </div>

        {CHAMPS_THEME_ETUDIANT.map((champ) => (
          <div key={champ.id}>
            <label htmlFor={`theme-${champ.id}`} className="etiquette">
              {champ.label} <span className="text-danger">*</span>
            </label>
            <textarea
              id={`theme-${champ.id}`}
              rows={champ.lignes}
              value={contenu[champ.id]}
              onChange={(e) => maj(champ.id, e.target.value)}
              aria-invalid={contenu[champ.id].trim().length < champ.min}
              className={`${CLASSES_CHAMP} ${contenu[champ.id].trim().length < champ.min ? 'border-danger bg-danger-soft/30' : ''}`}
            />
          </div>
        ))}

        <div>
          <span className="etiquette">Objectifs</span>
          <div className="space-y-2">
            {contenu.objectifs.map((objectif, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={objectif}
                  onChange={(e) => majListe('objectifs', index, e.target.value)}
                  placeholder={`Objectif ${index + 1}`}
                  className="flex-1 px-4 py-2.5 text-sm text-navy-900 placeholder:text-ink-muted/70 bg-white border border-line rounded-xl focus:border-navy-400 focus:outline-none transition"
                />
                <Bouton
                  variante="discret"
                  taille="sm"
                  onClick={() => retirer('objectifs', index)}
                  disabled={contenu.objectifs.length === 1}
                >
                  Retirer
                </Bouton>
              </div>
            ))}
          </div>
          <Bouton variante="secondaire" taille="sm" className="mt-2" onClick={() => ajouter('objectifs')}>
            Ajouter un objectif
          </Bouton>
        </div>

        <div>
          <span className="etiquette">Mots-clés</span>
          <ListeTags
            valeurs={contenu.motsCles}
            onChange={(valeurs) => maj('motsCles', valeurs)}
            placeholder="Placement, Recuit simulé, VLSI"
            aide="Séparez les mots-clés par une virgule."
          />
        </div>

        {erreur && <Alerte variante="erreur">{erreur}</Alerte>}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          {champsIncomplets > 0 && (
            <p className="sm:mr-auto text-xs text-ink-muted">
              {champsIncomplets} champ(s) obligatoire(s) à compléter.
            </p>
          )}
          <Bouton variante="secondaire" onClick={onAnnuler} disabled={enCours} type="button">
            Annuler
          </Bouton>
          <Bouton type="submit" disabled={enCours} className="sm:w-auto">
            <Send size={16} className="mr-1" />
            {enCours ? 'Envoi…' : 'Envoyer pour validation'}
          </Bouton>
        </div>
      </form>
    </div>
  )
}