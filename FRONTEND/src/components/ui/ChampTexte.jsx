import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function ChampTexte({
  label,
  type = 'text',
  icone: Icone,
  erreur,
  options,
  suffixe,
  className = '',
  ...props
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const estMotDePasse = type === 'password'
  const typeAffiche = estMotDePasse && visible ? 'text' : type

  return (
    <div className={className}>
      <label htmlFor={id} className="etiquette">
        {label}
      </label>

      <div className={`champ ${erreur ? 'champ--erreur' : ''}`}>
        {Icone ? <Icone size={18} className="flex-none text-ink-muted" aria-hidden="true" /> : null}

        {options ? (
          <select id={id} className="champ__controle cursor-pointer appearance-none" {...props}>
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input id={id} type={typeAffiche} className="champ__controle" {...props} />
        )}

        {estMotDePasse ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={visible}
            className="flex-none cursor-pointer rounded-md p-1 text-ink-muted transition hover:text-navy-900"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}

        {suffixe}
      </div>

      {erreur ? <p className="mt-1.5 text-xs font-medium text-danger">{erreur}</p> : null}
    </div>
  )
}