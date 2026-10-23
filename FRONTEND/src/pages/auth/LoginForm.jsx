import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, KeyRound, LoaderCircle, ArrowRight } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout'
import Bouton from '../../components/ui/Bouton'
import ChampTexte from '../../components/ui/ChampTexte'
import Alerte from '../../components/ui/Alerte'
import { login, saveSession, clearSession, estParcoursInformatique, estEvaluateur, estEtudiant, estResponsableMention } from '../../services/authApi'

function getParcoursPath(parcours) {
  const p = (parcours || '').toUpperCase()
  if (p === 'INFORMATIQUE' || p === 'INFO') return '/informatique'
  if (p === 'MANAGEMENT') return '/management'
  if (p === 'ICM') return '/icm'
  return null
}

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const enCours = status === 'loading'

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg('')

    if (!email.trim() || !code) {
      setStatus('error')
      setErrorMsg('Renseignez votre email et votre code pour continuer.')
      return
    }

    setStatus('loading')

    try {
      const data = await login(email.trim(), code)
      const { role, parcours } = data.utilisateur
      const estUnEvaluateur = estEvaluateur(role)
      const estUnEtudiant = estEtudiant(role)
      const estUnResponsableMention = estResponsableMention(role)

      if (estUnEvaluateur) {
        saveSession(data.token, data.utilisateur)
        setStatus(null)
        navigate('/evaluateur', { replace: true })
        return
      }

      if (estUnEtudiant) {
        saveSession(data.token, data.utilisateur)
        setStatus(null)
        navigate('/etudiant', { replace: true })
        return
      }

      if (estUnResponsableMention) {
        saveSession(data.token, data.utilisateur)
        setStatus(null)
        const path = getParcoursPath(parcours)
        navigate(path ?? '/responsable-mention', { replace: true })
        return
      }

      if (!estParcoursInformatique(parcours)) {
        clearSession()
        setStatus('error')
        setErrorMsg(
          `Connexion réussie, mais l'interface « ${parcours || 'inconnue'} » n'est pas encore disponible ` +
            `(seul le côté Informatique est en ligne pour le moment).`,
        )
        return
      }

      saveSession(data.token, data.utilisateur)
      setStatus(null)
      navigate(getParcoursPath(parcours) ?? '/connexion', { replace: true })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Email ou code incorrect.')
    }
  }

  return (
    <AuthLayout titre="Connexion" sousTitre="Accédez à votre espace EMIT avec votre email et votre code d'accès.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <ChampTexte
          label="Email"
          type="email"
          icone={Mail}
          name="email"
          autoComplete="email"
          placeholder="Info@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <ChampTexte
          label="Code d'accès"
          type="password"
          icone={KeyRound}
          name="code"
          autoComplete="current-password"
          placeholder="INFORMATIQUE"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted select-none">
          <input type="checkbox" name="remember" className="h-4 w-4 cursor-pointer accent-navy-900" />
          Se souvenir de moi
        </label>

        <Alerte>{errorMsg}</Alerte>

        <Bouton type="submit" disabled={enCours} className="w-full">
          {enCours ? (
            <>
              <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </Bouton>

        <div className="flex items-center gap-3 text-ink-muted/70">
          <span className="h-px flex-1 bg-line-soft" />
          <span className="text-[0.68rem] uppercase tracking-[0.16em]">ou</span>
          <span className="h-px flex-1 bg-line-soft" />
        </div>

        <Bouton variante="secondaire" onClick={() => navigate('/evaluateur-inscription')}>
          Espace Évaluateur
        </Bouton>

        <p className="rounded-lg bg-paper-tint px-3 py-2 text-center text-xs text-ink-muted">
          Identifiants de test : <strong className="font-semibold text-ink">Info@gmail.com</strong> /{' '}
          <strong className="font-semibold text-ink">INFORMATIQUE</strong>
        </p>

        </form>
    </AuthLayout>
  )
}