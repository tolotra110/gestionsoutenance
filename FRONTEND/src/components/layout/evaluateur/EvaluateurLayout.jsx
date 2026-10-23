import { useState, useEffect } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { getSession } from '../../../services/authApi'
import EvaluateurSidebar from './EvaluateurSidebar'
import EvaluateurNavbar from './EvaluateurNavbar'
import './evaluateur.css'

export default function EvaluateurLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const session = getSession()

  useEffect(() => {
    if (!session) {
      navigate('/connexion', { replace: true })
    }
  }, [session, navigate])

  if (!session) {
    return <Navigate to="/connexion" replace />
  }

  return (
    <div className="dash">
      <EvaluateurSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <div className="dash__wrapper">
        <EvaluateurNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="dash__contenu">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden sans-impression"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}