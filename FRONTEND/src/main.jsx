import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './App.css'
import { bloquerNavigationNavigateur } from './utils/bloquerNavigation'

// Les flèches précédent / suivant du navigateur sont désactivées sur tout le site
bloquerNavigationNavigateur()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
