import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut } from 'lucide-react'
import { getSession, clearSession } from '../../../services/authApi'
import Bouton from '../../ui/Bouton'

export default function EvaluateurNavbar({ onMenuClick }) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const session = getSession()
  const utilisateur = session?.utilisateur

  function handleLogout() {
    clearSession()
    navigate('/connexion', { replace: true })
  }

  return (
    <header className="dash__navbar sans-impression flex items-center gap-4 px-4 lg:px-6">
      <Bouton
        variante="discret"
        taille="icone"
        onClick={onMenuClick}
        className="lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} />
      </Bouton>

      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-paper-tint transition"
          aria-label="Menu utilisateur"
          aria-expanded={profileOpen}
        >
          <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center">
            <span className="font-display font-semibold text-navy-900 text-sm">
              {utilisateur?.nom?.charAt(0)?.toUpperCase() ?? 'E'}
            </span>
          </div>
          <span className="hidden lg:block text-sm font-medium text-navy-900 truncate max-w-[140px]">
            {utilisateur?.nom ?? 'Évaluateur'}
          </span>
          <ChevronDown size={16} className="text-ink-muted lg:hidden" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg py-1 z-50">
            <div className="px-4 py-3 border-b border-line">
              <p className="font-medium text-navy-900 truncate">{utilisateur?.nom ?? 'Évaluateur'}</p>
              <p className="text-xs text-ink-muted truncate">{utilisateur?.email}</p>
              <span className="inline-block mt-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] bg-navy-100 text-navy-700 px-2 py-0.5 rounded">
                {utilisateur?.parcours ?? 'Parcours'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-danger-soft"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
