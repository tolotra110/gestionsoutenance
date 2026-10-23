import { useState } from 'react'
import { Download, Printer, Save, Send } from 'lucide-react'
import Bouton from '../../ui/Bouton'
import { DECISIONS_RAPPORT, MENTIONS } from '../../../constants/rapports'

function NoteEtMention({ note, mention, desactive, onNote, onMention }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="note-rapport" className="etiquette">
          Note sur 20 <span className="text-danger">*</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            id="note-rapport"
            type="number"
            min="0"
            max="20"
            step="0.25"
            value={note ?? ''}
            onChange={(e) => onNote(e.target.value === '' ? null : Number(e.target.value))}
            disabled={desactive}
            className="w-28 px-4 py-2.5 text-center font-display font-semibold text-navy-900 bg-paper-tint/60 border border-line rounded-xl focus:bg-white focus:border-navy-400 focus:outline-none transition disabled:opacity-70"
          />
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={note ?? 0}
            onChange={(e) => onNote(Number(e.target.value))}
            disabled={desactive}
            aria-label="Note sur 20"
            className="flex-1 accent-navy-700 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
        <p className="mt-1 text-xs text-ink-muted">Barème de 0 à 20, au quart de point près.</p>
      </div>

      <div>
        <label htmlFor="mention-rapport" className="etiquette">
          Mention
        </label>
        <select
          id="mention-rapport"
          value={mention ?? ''}
          onChange={(e) => onMention(e.target.value || null)}
          disabled={desactive}
          className="w-full px-4 py-2.5 text-sm text-navy-900 bg-paper-tint/60 border border-line rounded-xl focus:bg-white focus:border-navy-400 focus:outline-none transition cursor-pointer disabled:opacity-70"
        >
          <option value="">Non attribuée</option>
          {MENTIONS.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label} (à partir de {item.min}/20)
            </option>
          ))}
          <option value="Insuffisant">Insuffisant</option>
        </select>
        <p className="mt-1 text-xs text-ink-muted">Calculée automatiquement si vous la laissez vide.</p>
      </div>
    </div>
  )
}

export default function FormulaireRapport({ rapport, onEnregistrer, onSoumettre, onTelechargerPv, enCours }) {
  const [contenu, setContenu] = useState({
    decision: rapport.decision ?? null,
    mention: rapport.mention ?? null,
    note: rapport.note ?? null,
  })

  const verrouille = rapport.statut === 'SOUMIS'

  function maj(champ, valeur) {
    setContenu((precedent) => ({ ...precedent, [champ]: valeur }))
  }

  const champsManquants = [
    !contenu.decision && 'la décision du jury',
    (contenu.note === null || contenu.note === undefined || contenu.note === '') && 'la note',
  ].filter(Boolean)

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-navy-900">Rédaction du rapport</h2>
        {verrouille && <p className="text-xs text-ink-muted">Rapport soumis : lecture seule.</p>}
      </header>

      <fieldset className="space-y-3">
        <legend className="etiquette">
          Décision du jury <span className="text-danger">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(DECISIONS_RAPPORT).map(([cle, config]) => (
            <label
              key={cle}
              className={`
                flex items-start gap-2 rounded-xl border bg-paper-tint/40 p-3 text-sm cursor-pointer transition
                ${
                  contenu.decision === cle
                    ? 'border-navy-600 ring-2 ring-navy-200 bg-white'
                    : 'border-line hover:border-navy-300'
                }
                ${verrouille ? 'cursor-not-allowed opacity-70' : ''}
              `}
            >
              <input
                type="radio"
                name="decision-rapport"
                value={cle}
                checked={contenu.decision === cle}
                onChange={() => maj('decision', cle)}
                disabled={verrouille}
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

      <NoteEtMention
        note={contenu.note}
        mention={contenu.mention}
        desactive={verrouille}
        onNote={(valeur) => maj('note', valeur)}
        onMention={(valeur) => maj('mention', valeur)}
      />

      {!verrouille && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-line-soft pt-5 sans-impression">
          {champsManquants.length > 0 && (
            <p className="sm:mr-auto text-xs text-ink-muted">
              À renseigner avant de soumettre : {champsManquants.join(' et ')}.
            </p>
          )}
          <Bouton variante="secondaire" onClick={() => onEnregistrer(contenu)} disabled={enCours}>
            <Save size={16} className="mr-1" />
            Enregistrer le brouillon
          </Bouton>
          <Bouton onClick={() => onSoumettre(contenu)} disabled={enCours} className="sm:w-auto">
            <Send size={16} className="mr-1" />
            {enCours ? 'Envoi…' : 'Soumettre le rapport'}
          </Bouton>
        </div>
      )}

      {verrouille && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-line-soft pt-5 sans-impression">
          {onTelechargerPv && (
            <Bouton onClick={onTelechargerPv} disabled={enCours} className="sm:w-auto">
              <Download size={16} className="mr-1" />
              Télécharger le PV (PDF)
            </Bouton>
          )}
          <Bouton variante="secondaire" onClick={() => window.print()}>
            <Printer size={16} className="mr-1" />
            Imprimer le rapport
          </Bouton>
        </div>
      )}
    </div>
  )
}