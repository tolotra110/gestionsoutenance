import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import DashboardMention from './DashboardMention'
import { clearSession, estEvaluateur, sessionValide } from '../../services/authApi'

/**
 * Point d'entrée unique de l'espace responsable de mention,
 * quel que soit le parcours (Informatique, Management, ICM…).
 * Le nom de la mention provient du JWT (utilisateur.parcours).
 */
export default function EspaceMention({ parcours, nomMention }) {
  const navigate = useNavigate()
  const [utilisateur] = useState(sessionValide)

  if (
    !utilisateur ||
    utilisateur.parcours?.trim().toUpperCase() !== parcours ||
    estEvaluateur(utilisateur.role)
  ) {
    return <Navigate to="/connexion" replace />
  }

  function deconnecter() {
    clearSession()
    navigate('/connexion', { replace: true })
  }

  return (
    <DashboardMention
      mention={{ code: utilisateur.parcours?.trim().toUpperCase(), nom: nomMention }}
      utilisateur={utilisateur}
      onDeconnexion={deconnecter}
    />
  )
}
