import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  BookOpenCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  KeyRound,
} from 'lucide-react'
import { getSession, clearSession } from '../../../services/authApi'
import Bouton from '../../ui/Bouton'

const NAV_ITEMS = [
  { to: '/evaluateur', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/evaluateur/soutenances', label: 'Mes soutenances', icon: ClipboardList },
  { to: '/evaluateur/themes', label: 'Thèmes à valider', icon: BookOpenCheck },
  { to: '/evaluateur/rapports', label: 'Notes et rapports', icon: BookOpen },
  { to: '/evaluateur/parametres', label: 'Paramètres', icon: KeyRound },
]

export default function EvaluateurSidebar({ isOpen, onToggle }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const session = getSession()
  const utilisateur = session?.utilisateur

  const isActive = (path) => location.pathname === path || (path !== '/evaluateur' && location.pathname.startsWith(path + '/'))

  return (
    <aside
      className={`
        dash__menu ${isOpen ? 'dash__menu--ouvert' : ''}
        ${collapsed ? 'w-16' : ''}
      `}
      aria-label="Navigation évaluateur"
    >
      <div className="flex h-full flex-col">
        <div className="dash__marque">
          <img src="/icon.png" alt="Évaluateur" />
          {!collapsed && <span>Évaluateur</span>}
        </div>
        <nav>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: navActive }) => `
                  dash__lien ${navActive ? 'dash__lien--actif' : ''}
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
                onClick={() => window.innerWidth < 1024 && onToggle?.(false)}
              >
                <item.icon size={18} aria-hidden="true" className="flex-none" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>
        <div className="dash__pied">
          {!collapsed && utilisateur && (
            <span>{utilisateur.nom || utilisateur.email}</span>
          )}
          <button className="dash__lien" onClick={() => { clearSession(); window.location.href = '/connexion' }}>
            <LogOut size={16} aria-hidden="true" className="flex-none" />
            {!collapsed && <span className="truncate">Déconnexion</span>}
          </button>
          {!collapsed && (
            <Bouton
              variante="discret"
              taille="icone"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
              className="ml-auto"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Bouton>
          )}
        </div>
      </div>
    </aside>
  )
}