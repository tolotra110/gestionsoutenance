import { useState } from 'react'
import {
  Award,
  CalendarDays,
  ClipboardCheck,
  DoorOpen,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  UserCheck,
  Users,
} from 'lucide-react'
import logoEmit from '../../assets/logo-emit.png'
import Accueil from '../informatique/Accueil'
import Etudiants from '../informatique/Etudiants'
import Salles from '../informatique/Salles'
import Evaluateurs from '../informatique/Evaluateurs'
import Soutenances from '../informatique/Soutenances'
import Resultats from './Resultats'
import ResultatsThemes from './ResultatsThemes'
import ProcesVerbaux from './ProcesVerbaux'
import ParametresCompte from '../../components/compte/ParametresCompte'
import '../informatique/dashboard.css'

/**
 * Dashboard unique des responsables de mention (Informatique,
 * Management, ICM…). Le nom de la mention vient du JWT.
 */
const MENU = [
  { id: 'accueil', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'etudiants', label: 'Étudiants', icon: Users },
  { id: 'soutenances', label: 'Planning', icon: CalendarDays },
  { id: 'resultats', label: 'Résultats', icon: Award },
  { id: 'themes', label: 'Résultats de thèmes', icon: ClipboardCheck },
  { id: 'pv', label: 'Procès-verbal', icon: FileText },
  { id: 'salles', label: 'Salles', icon: DoorOpen },
  { id: 'evaluateurs', label: 'Évaluateurs', icon: UserCheck },
  { id: 'parametres', label: 'Paramètres', icon: KeyRound },
]

export default function DashboardMention({ mention, utilisateur, onDeconnexion }) {
  const [page, setPage] = useState('accueil')
  const [menuOuvert, setMenuOuvert] = useState(false)

  const vues = {
    accueil: <Accueil mention={mention.nom} onAller={setPage} />,
    etudiants: <Etudiants mention={mention.nom} />,
    soutenances: <Soutenances />,
    resultats: <Resultats />,
    themes: <ResultatsThemes />,
    pv: <ProcesVerbaux />,
    salles: <Salles />,
    evaluateurs: <Evaluateurs />,
    parametres: <ParametresCompte />,
  }

  return (
    <div className="dash">
      <aside className={`dash__menu ${menuOuvert ? 'dash__menu--ouvert' : ''}`}>
        <div className="dash__marque">
          <img src={logoEmit} alt="EMIT" />
          <span className="flex items-center gap-2">
            <GraduationCap size={16} aria-hidden="true" />
            Mention {mention.nom}
          </span>
        </div>
        <nav>
          {MENU.map((m) => (
            <button
              key={m.id}
              className={`dash__lien ${page === m.id ? 'dash__lien--actif' : ''}`}
              onClick={() => {
                setPage(m.id)
                setMenuOuvert(false)
              }}
            >
              <m.icon size={18} aria-hidden="true" className="flex-none" />
              <span className="truncate">{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="dash__pied">
          <span>{utilisateur.nom || utilisateur.email}</span>
          <button className="dash__lien" onClick={onDeconnexion}>
            <LogOut size={16} aria-hidden="true" className="flex-none" />
            <span className="truncate">Se déconnecter</span>
          </button>
        </div>
      </aside>

      <main className="dash__contenu">
        <button
          className="dash__burger"
          onClick={() => setMenuOuvert((v) => !v)}
          aria-label="Menu"
        >
          ☰
        </button>
        {vues[page]}
      </main>
    </div>
  )
}
