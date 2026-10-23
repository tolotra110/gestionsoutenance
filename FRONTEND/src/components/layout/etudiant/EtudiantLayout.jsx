import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { getSession } from '../../../services/authApi'
import EtudiantNavbar from './EtudiantNavbar'

export default function EtudiantLayout() {
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
    <div className="min-h-screen bg-paper">
      <EtudiantNavbar />

      <main id="etudiant-main" className="pt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}