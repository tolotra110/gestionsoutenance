import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, FileText, CalendarDays, TrendingUp, BookOpenCheck, BookOpen } from 'lucide-react'
import { getSession } from '../../services/authApi'
import { api } from '../../services/api'
import { listerSoutenances } from '../../services/soutenanceApi'
import { listerThemes, statistiquesThemes } from '../../services/evaluateurThemesApi'
import { STATUT_CONFIG } from '../../constants/soutenances'
import { formaterDateCourte } from '../../utils/format'
import Alerte from '../../components/ui/Alerte'

const COULEURS = {
  navy: 'bg-navy-900 text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  sky: 'bg-sky-500 text-white',
}

const ACTIONS = [
  { label: 'Valider les thèmes', icon: BookOpenCheck, to: '/evaluateur/themes' },
  { label: 'Mes soutenances', icon: ClipboardList, to: '/evaluateur/soutenances' },
  { label: 'Notes et rapports', icon: BookOpen, to: '/evaluateur/rapports' },
]

export default function EvaluateurDashboard() {
  const session = getSession()
  const utilisateur = session?.utilisateur
  const parcours = utilisateur?.parcours ?? 'Non défini'

  const [donnees, setDonnees] = useState({ soutenances: [], themes: [], rapports: [] })
  const [chargement, setChargement] = useState(true)
  const [erreurs, setErreurs] = useState([])

  // Données réelles de la base : soutenances assignées, thèmes de la mention, rapports (notes)
  useEffect(() => {
    let actif = true
    Promise.allSettled([listerSoutenances(), listerThemes(), api.get('/api/rapports')]).then((res) => {
      if (!actif) return
      const [sou, the, rap] = res
      setDonnees({
        soutenances: sou.status === 'fulfilled' ? sou.value : [],
        themes: the.status === 'fulfilled' ? the.value : [],
        rapports: rap.status === 'fulfilled' ? rap.value : [],
      })
      setErreurs(
        [
          sou.status === 'rejected' && `soutenances (${sou.reason?.message})`,
          the.status === 'rejected' && `thèmes (${the.reason?.message})`,
          rap.status === 'rejected' && `notes (${rap.reason?.message})`,
        ].filter(Boolean),
      )
      setChargement(false)
    })
    return () => {
      actif = false
    }
  }, [])

  const { stats, prochaines } = useMemo(() => {
    const { soutenances, themes, rapports } = donnees
    const actives = soutenances.filter((s) => s.statut !== 'ANNULEE')
    const themesStats = statistiquesThemes(themes)
    const notes = rapports.filter((r) => r.statut === 'SOUMIS' && r.note !== null && r.note !== undefined)
    const moyenne = notes.length ? notes.reduce((somme, r) => somme + Number(r.note), 0) / notes.length : null

    const debutJour = new Date()
    debutJour.setHours(0, 0, 0, 0)
    const aVenir = actives
      .filter((s) => ['A_VENIR', 'EN_COURS'].includes(s.statut) && new Date(s.date) >= debutJour)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)

    return {
      prochaines: aVenir,
      stats: [
        { label: 'Soutenances assignées', value: String(actives.length), icon: ClipboardList, couleur: 'navy' },
        { label: 'Thèmes validés', value: String(themesStats.valides), icon: FileText, couleur: 'success' },
        { label: 'Thèmes en attente', value: String(themesStats.enAttente), icon: CalendarDays, couleur: 'warning' },
        {
          label: 'Moyenne des notes',
          value: moyenne === null ? '—' : `${moyenne.toFixed(2).replace('.', ',')}/20`,
          detail: `${notes.length} note${notes.length > 1 ? 's' : ''} soumise${notes.length > 1 ? 's' : ''}`,
          icon: TrendingUp,
          couleur: 'sky',
        },
      ],
    }
  }, [donnees])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Tableau de bord — {utilisateur?.nom ?? 'Évaluateur'}
          </h1>
          <p className="text-ink-muted mt-1">
            Bienvenue dans votre espace d'évaluation. Parcours : <span className="font-medium text-navy-900">{parcours}</span>
          </p>
        </div>
        <Link
          to="/evaluateur/themes"
          className="btn btn-primaire w-full sm:w-auto text-sm font-semibold no-underline"
        >
          <BookOpenCheck size={16} />
          Valider un thème
        </Link>
      </div>

      {erreurs.length > 0 && <Alerte variante="erreur">Impossible de charger : {erreurs.join(' ; ')}</Alerte>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-ink-muted">{stat.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-navy-900">{chargement ? '…' : stat.value}</p>
                {stat.detail && !chargement && <p className="text-xs text-ink-muted mt-0.5">{stat.detail}</p>}
              </div>
              <div className={`${COULEURS[stat.couleur]} rounded-xl p-3`}>
                <stat.icon size={22} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-900">Prochaines soutenances</h2>
            <Link to="/evaluateur/soutenances" className="text-sm text-sky-500 hover:text-sky-700 no-underline">
              Voir tout
            </Link>
          </header>
          <div className="space-y-3">
            {chargement && <p className="text-sm text-ink-muted">Chargement…</p>}
            {!chargement && prochaines.length === 0 && (
              <p className="text-sm text-ink-muted">Aucune soutenance à venir pour le moment.</p>
            )}
            {prochaines.map((s) => {
              const statut = STATUT_CONFIG[s.statut] ?? STATUT_CONFIG.A_VENIR
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-paper-tint/50 hover:bg-paper-tint transition">
                  <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center flex-none">
                    <span className="font-display font-semibold text-navy-900 text-sm">{s.etudiant.nom.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 truncate">{s.etudiant.nom}</p>
                    <p className="text-sm text-ink-muted truncate">{s.sujet}</p>
                  </div>
                  <div className="hidden sm:block text-sm text-ink-muted text-right w-40">
                    <p>{formaterDateCourte(s.date)}, {s.heure_debut}</p>
                    <p>{s.salle.nom}</p>
                  </div>
                  <span className={`flex-none px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${statut.classe}`}>
                    {statut.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-900">Actions rapides</h2>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACTIONS.map((action) => (
              <Link key={action.label} to={action.to} className="flex items-center gap-3 p-4 rounded-xl border border-line bg-white hover:border-sky-300 hover:bg-navy-50 transition">
                <div className="h-10 w-10 rounded-lg bg-navy-100 flex items-center justify-center">
                  <action.icon size={20} className="text-navy-700" />
                </div>
                <span className="font-medium text-navy-900">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
