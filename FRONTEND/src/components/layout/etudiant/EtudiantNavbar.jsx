import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { clearSession, getSession } from '../../../services/authApi'
import Bouton from '../../ui/Bouton'

const LIENS = [
  { to: '/etudiant', label: 'Mon espace' },
]

export default function EtudiantNavbar() {
  const navigate = useNavigate()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const session = getSession()
  const utilisateur = session?.utilisateur

  function handleLogout() {
    clearSession()
    navigate('/connexion', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-sm border-b border-line flex items-center gap-4 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-navy-900 flex items-center justify-center">
          <GraduationCap size={18} className="text-sky-400" aria-hidden="true" />
        </div>
        <span className="font-display font-bold text-navy-900 text-sm">Espace Étudiant</span>
      </div>

      <nav className="hidden lg:flex items-center gap-2 ml-6" aria-label="Menu étudiant">
        {LIENS.map((lien) => (
          <NavLink
            key={lien.to}
            to={lien.to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                isActive ? 'bg-navy-50 text-navy-900' : 'text-ink-muted hover:bg-paper-tint hover:text-navy-900'
              }`
            }
          >
            {lien.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="hidden sm:flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-navy-100 flex items-center justify-center">
          <span className="font-display font-semibold text-navy-900 text-sm">
            {(utilisateur?.nom ?? 'E').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-navy-900 leading-tight">{utilisateur?.nom ?? 'Étudiant'}</p>
          <p className="text-[0.7rem] text-ink-muted leading-tight">
            {utilisateur?.parcours ?? 'Parcours non défini'}
          </p>
        </div>
      </div>

      <Bouton variante="discret" taille="icone" onClick={handleLogout} aria-label="Se déconnecter">
        <LogOut size={18} className="text-ink-muted" />
      </Bouton>

      <Bouton
        variante="discret"
        taille="icone"
        className="lg:hidden"
        onClick={() => setMenuOuvert((ouvert) => !ouvert)}
        aria-label="Ouvrir le menu"
        aria-expanded={menuOuvert}
      >
        {menuOuvert ? <X size={20} /> : <Menu size={20} />}
      </Bouton>

      {menuOuvert && (
        <div className="absolute top-16 right-4 w-56 bg-white border border-line rounded-xl shadow-lg py-1 z-50">
          {LIENS.map((lien) => (
            <NavLink
              key={lien.to}
              to={lien.to}
              onClick={() => setMenuOuvert(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-paper-tint"
            >
              {lien.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-soft"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      )}
    </header>
  )
}