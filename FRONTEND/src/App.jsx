import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './pages/auth/LoginForm'
import EvaluateurAuth from './pages/auth/EvaluateurAuth'
import EvaluateurLayout from './components/layout/evaluateur/EvaluateurLayout'
import EtudiantLayout from './components/layout/etudiant/EtudiantLayout'
import EvaluateurDashboard from './pages/evaluateur/Dashboard'
import MesSoutenances from './pages/evaluateur/MesSoutenances'
import ThemesAValider from './pages/evaluateur/ThemesAValider'
import Rapports from './pages/evaluateur/Rapports'
import Parametres from './pages/evaluateur/Parametres'
import EspaceEtudiant from './pages/etudiant/EspaceEtudiant'
import Informatique from './pages/Informatique'
import PlanningEtudiant from './pages/planning/PlanningEtudiant'
import Management from './pages/Management'
import ICM from './pages/ICM'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/connexion" element={<LoginForm />} />
        <Route path="/evaluateur-inscription" element={<EvaluateurAuth />} />

        <Route element={<EvaluateurLayout />}>
          <Route path="/evaluateur" element={<EvaluateurDashboard />} />
          <Route path="/evaluateur/soutenances" element={<MesSoutenances />} />
          <Route path="/evaluateur/themes" element={<ThemesAValider />} />
          <Route path="/evaluateur/rapports" element={<Rapports />} />
          <Route path="/evaluateur/parametres" element={<Parametres />} />
        </Route>

        <Route element={<EtudiantLayout />}>
          <Route path="/etudiant" element={<EspaceEtudiant />} />
        </Route>

        <Route path="/planning" element={<PlanningEtudiant />} />
        <Route path="/informatique" element={<Informatique />} />
        <Route path="/management" element={<Management />} />
        <Route path="/icm" element={<ICM />} />
        <Route path="*" element={<Navigate to="/connexion" />} />
      </Routes>
    </BrowserRouter>
  )
}