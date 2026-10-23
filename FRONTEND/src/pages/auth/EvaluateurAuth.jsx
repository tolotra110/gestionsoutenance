import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, LockKeyhole, GraduationCap, LoaderCircle, ArrowLeft } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout'
import Bouton from '../../components/ui/Bouton'
import ChampTexte from '../../components/ui/ChampTexte'
import Alerte from '../../components/ui/Alerte'
import { register, login, saveSession } from '../../services/authApi'
import { creerValidateur, reglesEvaluateur } from '../../utils/validation'

const PARCOURS = [
  { value: '', label: 'Choisir un parcours', disabled: true },
  { value: 'INFORMATIQUE', label: 'Informatique' },
  { value: 'MANAGEMENT', label: 'Management' },
  { value: 'ICM', label: 'ICM' },
]

const CHAMPS_VIDES = {
  nom: '',
  email: '',
  mot_de_passe: '',
  parcours: '',
}

const valider = creerValidateur(reglesEvaluateur)

export default function EvaluateurAuth() {
  const navigate = useNavigate()
  const [form, setForm] = useState(CHAMPS_VIDES)
  const [erreurs, setErreurs] = useState({})
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const enCours = status === 'loading'

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErreurs((errs) => ({ ...errs, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg('')

    const errs = valider(form)
    setErreurs(errs)
    if (Object.keys(errs).length > 0) {
      setStatus('error')
      setErrorMsg('Vérifiez les champs signalés ci-dessous.')
      return
    }

    setStatus('loading')

    try {
      await register({
        nom: form.nom.trim(),
        email: form.email.trim(),
        mot_de_passe: form.mot_de_passe,
        parcours: form.parcours,
      })

      const data = await login(form.email.trim(), form.mot_de_passe)
      saveSession(data.token, data.utilisateur)
      setStatus(null)
      navigate('/evaluateur', { replace: true })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Impossible de créer le compte.')
    }
  }

  return (
    <AuthLayout
      titre="Espace Évaluateur"
      sousTitre="Créez votre compte évaluateur pour accéder à votre interface de notation."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ChampTexte
          label="Nom complet"
          icone={User}
          name="nom"
          autoComplete="name"
          placeholder="Rakoto Jean"
          value={form.nom}
          onChange={handleChange}
          erreur={erreurs.nom}
        />

        <ChampTexte
          label="Email"
          type="email"
          icone={Mail}
          name="email"
          autoComplete="email"
          placeholder="evaluateur@gmail.com"
          value={form.email}
          onChange={handleChange}
          erreur={erreurs.email}
        />

        <ChampTexte
          label="Mot de passe"
          type="password"
          icone={LockKeyhole}
          name="mot_de_passe"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.mot_de_passe}
          onChange={handleChange}
          erreur={erreurs.mot_de_passe}
        />

        <ChampTexte
          label="Parcours évalué"
          icone={GraduationCap}
          name="parcours"
          value={form.parcours}
          onChange={handleChange}
          options={PARCOURS}
          erreur={erreurs.parcours}
        />

        <Alerte>{errorMsg}</Alerte>

        <Bouton type="submit" disabled={enCours}>
          {enCours ? (
            <>
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
              Création du compte…
            </>
          ) : (
            'Créer mon compte'
          )}
        </Bouton>

        <Bouton variante="discret" onClick={() => navigate('/connexion')} className="!w-auto self-center">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à la connexion
        </Bouton>
      </form>
    </AuthLayout>
  )
}