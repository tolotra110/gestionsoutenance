import { useState } from 'react'
import { Send } from 'lucide-react'
import Bouton from '../../ui/Bouton'
import Alerte from '../../ui/Alerte'
import { DECISIONS } from '../../../constants/themes'
import { deciderTheme } from '../../../services/evaluateurThemesApi'

export default function FormulaireDecision({ theme, onDecision, onClose }) {
  const [decision, setDecision] = useState('VALIDE')
  const [commentaire, setCommentaire] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(null)

  const regles = DECISIONS[decision]

  async function handleSoumettre(event) {
    event.preventDefault()
    setEnvoi(true)
    setErreur(null)
    try {
      await deciderTheme(theme.id, { decision, commentaire })
      onDecision(decision)
    } catch (exception) {
      setErreur(exception.message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="rounded-2xl border border-navy-200 bg-navy-50 p-5">
      <form onSubmit={handleSoumettre} className="space-y-4">
        <fieldset>
          <legend className="etiquette">Décision</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(DECISIONS).map(([cle, config]) => (
              <label
                key={cle}
                className={`
                  flex items-start gap-2 rounded-xl border bg-white p-3 text-sm cursor-pointer transition
                  ${decision === cle ? 'border-navy-600 ring-2 ring-navy-200' : 'border-line hover:border-navy-300'}
                `}
              >
                <input
                  type="radio"
                  name="decision"
                  value={cle}
                  checked={decision === cle}
                  onChange={() => setDecision(cle)}
                  className="mt-1 accent-navy-700"
                />
                <span>
                  <span className="block font-medium text-navy-900">{config.label}</span>
                  <span className="block text-xs text-ink-muted mt-0.5">{config.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="commentaire-decision" className="etiquette">
            Commentaire à l&apos;étudiant <span className="text-ink-muted font-normal">(facultatif)</span>
          </label>
          <textarea
            id="commentaire-decision"
            rows={4}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder={
              decision === 'VALIDE'
                ? 'Optionnel : précisez les attendus pour la suite du mémoire.'
                : 'Optionnel : expliquez ce qui doit être corrigé ou pourquoi le thème est refusé.'
            }
            className="w-full px-4 py-3 text-sm text-navy-900 placeholder:text-ink-muted/70 bg-white border border-line rounded-xl focus:border-navy-400 focus:outline-none transition resize-y"
          />
          <p className="mt-1 text-xs text-ink-muted">
            Facultatif. Si vous écrivez un commentaire, l&apos;étudiant le verra dans l&apos;application mobile.
          </p>
        </div>

        {erreur && <Alerte variante="erreur">{erreur}</Alerte>}

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Bouton variante="secondaire" onClick={onClose} disabled={envoi} type="button" className='w-110'>
            Annuler
          </Bouton>
          <Bouton type="submit" disabled={envoi} className="sm:w-auto">
            <Send size={16} className="mr-1" />
            {envoi ? 'Enregistrement…' : regles.libelleAction}
          </Bouton>
        </div>
      </form>
    </div>
  )
}