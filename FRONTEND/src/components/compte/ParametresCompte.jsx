import { useState } from 'react'
import { changerIdentifiants, getSession } from '../../services/authApi'
import './compte.css'

/**
 * Paramètres de connexion du compte connecté : email (identifiant de connexion) et mot de passe.
 * Utilisé par l'espace responsable de mention et par l'espace évaluateur.
 * Le mot de passe actuel est toujours demandé pour confirmer la modification.
 */
function ChampMotDePasse({ id, label, aide, valeur, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="cpt__champ">
      <label htmlFor={id}>{label}</label>
      <div className="cpt__entree">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
        <button type="button" onClick={() => setVisible((v) => !v)}>
          {visible ? 'Masquer' : 'Afficher'}
        </button>
      </div>
      {aide ? <small>{aide}</small> : null}
    </div>
  )
}

export default function ParametresCompte({ titre = 'Paramètres' }) {
  const utilisateur = getSession()?.utilisateur
  const [email, setEmail] = useState(utilisateur?.email ?? '')
  const [actuel, setActuel] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function enregistrer(e) {
    e.preventDefault()
    setErreur('')
    setSucces('')

    const emailNettoye = email.trim()
    if (!emailNettoye) return setErreur("L'email de connexion est obligatoire.")
    if (!actuel) return setErreur('Saisissez votre mot de passe actuel pour confirmer.')
    if (nouveau && nouveau.length < 6) return setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères.')
    if (nouveau !== confirmation) return setErreur('La confirmation ne correspond pas au nouveau mot de passe.')
    if (emailNettoye === utilisateur?.email && !nouveau) return setErreur('Aucune modification à enregistrer.')

    setEnCours(true)
    try {
      const res = await changerIdentifiants({
        email: emailNettoye,
        mot_de_passe_actuel: actuel,
        nouveau_mot_de_passe: nouveau || undefined,
      })
      setEmail(res.utilisateur?.email ?? emailNettoye)
      setActuel('')
      setNouveau('')
      setConfirmation('')
      setSucces(`${res.message}. Utilisez ces identifiants à votre prochaine connexion.`)
    } catch (err) {
      setErreur(err.message || 'Modification impossible.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="cpt">
      <div>
        <h1 className="cpt__titre">{titre}</h1>
        <p className="cpt__sous">Modifiez l&apos;email et le mot de passe que vous utilisez pour vous connecter.</p>
      </div>

      <form className="cpt__carte" onSubmit={enregistrer} noValidate>
        <h2 className="cpt__section">Identifiant de connexion</h2>
        <div className="cpt__champ">
          <label htmlFor="cpt-email">Email</label>
          <div className="cpt__entree">
            <input
              id="cpt-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <hr className="cpt__sep" />

        <h2 className="cpt__section">Mot de passe</h2>
        <ChampMotDePasse
          id="cpt-nouveau"
          label="Nouveau mot de passe"
          aide="Laissez vide pour garder le mot de passe actuel. 6 caractères minimum."
          valeur={nouveau}
          onChange={setNouveau}
          autoComplete="new-password"
        />
        <ChampMotDePasse
          id="cpt-confirmation"
          label="Confirmer le nouveau mot de passe"
          valeur={confirmation}
          onChange={setConfirmation}
          autoComplete="new-password"
        />

        <hr className="cpt__sep" />

        <ChampMotDePasse
          id="cpt-actuel"
          label="Mot de passe actuel (obligatoire)"
          aide="Demandé pour confirmer toute modification."
          valeur={actuel}
          onChange={setActuel}
          autoComplete="current-password"
        />

        {erreur ? <p className="cpt__msg cpt__msg--erreur" role="alert">{erreur}</p> : null}
        {succes ? <p className="cpt__msg cpt__msg--succes" role="status">{succes}</p> : null}

        <div className="cpt__actions">
          <button type="submit" className="cpt__btn" disabled={enCours}>
            {enCours ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
