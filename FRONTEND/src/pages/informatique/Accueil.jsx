import { useEffect, useState } from 'react'
import {
  CalendarClock,
  DoorOpen,
  GraduationCap,
  UserCheck,
  Users,
} from 'lucide-react'
import { api } from '../../services/api'
import Modal from '../../components/informatique/Modal'
import { formaterDate } from './csv'

function Barres({ titre, donnees, libelle = (d) => d.nom }) {
  const max = Math.max(1, ...donnees.map((d) => d.total))
  return (
    <div className="carte">
      <h3>{titre}</h3>
      {donnees.length === 0 && <p className="section__sous">Aucune donnée</p>}
      {donnees.map((d, i) => (
        <div className="barre-stat" key={i}>
          <span className="barre-stat__label">{libelle(d)}</span>
          <span className="barre-stat__piste"><span className="barre-stat__rempli" style={{ width: `${(d.total / max) * 100}%` }} /></span>
          <span className="barre-stat__val">{d.total}</span>
        </div>
      ))}
    </div>
  )
}

const MOT_CONFIRMATION = 'REINITIALISER'

function ZoneReinitialisation({ onFait }) {
  const [ouvert, setOuvert] = useState(false)
  const [saisie, setSaisie] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  const fermer = () => { setOuvert(false); setSaisie(''); setErreur('') }

  async function reinitialiser(e) {
    e.preventDefault()
    setEnCours(true)
    setErreur('')
    try {
      const res = await api.post('/api/donnees/reinitialiser', { confirmation: MOT_CONFIRMATION })
      fermer()
      onFait(res)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="carte zone-danger">
      <h3>Réinitialiser les données</h3>
      <p className="section__sous">Supprime tous les étudiants, soutenances, salles et évaluateurs pour repartir de zéro. Les comptes utilisateurs sont conservés.</p>
      <button className="btn btn--danger" onClick={() => setOuvert(true)}>Réinitialiser toutes les données</button>

      {ouvert && (
        <Modal titre="Réinitialiser toutes les données" onFermer={fermer}>
          <form onSubmit={reinitialiser} className="formulaire">
            <p className="alerte alerte--erreur">Action irréversible : étudiants, soutenances, salles et évaluateurs seront définitivement supprimés.</p>
            <label className="formulaire__champ">
              <span>Tapez <strong>{MOT_CONFIRMATION}</strong> pour confirmer</span>
              <input className="champ" value={saisie} onChange={(e) => setSaisie(e.target.value)} autoFocus autoComplete="off" />
            </label>
            {erreur && <p className="alerte alerte--erreur">{erreur}</p>}
            <div className="formulaire__actions">
              <button type="button" className="btn" onClick={fermer}>Annuler</button>
              <button type="submit" className="btn btn--danger-plein" disabled={saisie !== MOT_CONFIRMATION || enCours}>
                {enCours ? 'Suppression…' : 'Tout supprimer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default function Accueil({ mention = 'Informatique', onAller }) {
  const [stats, setStats] = useState(null)
  const [erreur, setErreur] = useState('')
  const [bilan, setBilan] = useState(null)

  const charger = () => api.get('/api/soutenances/stats').then(setStats).catch((e) => setErreur(e.message))

  useEffect(() => { charger() }, [])

  const apresReinitialisation = (res) => {
    setBilan(`Données réinitialisées : ${res.etudiants} étudiant(s), ${res.soutenances} soutenance(s), ${res.salles} salle(s) et ${res.evaluateurs} évaluateur(s) supprimés.`)
    charger()
  }

  if (erreur) return <p className="alerte alerte--erreur">{erreur}</p>
  if (!stats) return <p className="section__sous">Chargement…</p>

  const cartes = [
    { label: 'Étudiants', val: stats.etudiants, cible: 'etudiants', icon: Users },
    { label: 'Soutenances planifiées', val: stats.planifies, cible: 'soutenances', icon: CalendarClock },
    { label: 'Sans créneau', val: stats.non_planifies, cible: 'soutenances', alerte: stats.non_planifies > 0, icon: CalendarClock },
    { label: 'Salles', val: stats.salles, cible: 'salles', icon: DoorOpen },
    { label: 'Évaluateurs', val: stats.evaluateurs, cible: 'evaluateurs', icon: UserCheck },
  ]

  return (
    <section>
      <header className="section__tete"><div className="flex items-center gap-3"><span className="carte__icone carte__icone--marque"><GraduationCap size={22} aria-hidden="true" /></span><div><h1>Tableau de bord — Mention {mention}</h1><p className="section__sous">Vue d'ensemble de la planification des soutenances de Licence</p></div></div></header>
      <div className="cartes">
        {cartes.map((c) => (
          <button key={c.label} className={`carte carte--stat ${c.alerte ? 'carte--alerte' : ''}`} onClick={() => onAller(c.cible)}>
            <span className={`carte__icone ${c.alerte ? 'carte__icone--alerte' : ''}`}>
              <c.icon size={18} aria-hidden="true" />
            </span>
            <span className="carte__val">{c.val}</span>
            <span className="carte__label">{c.label}</span>
          </button>
        ))}
      </div>
      <div className="grille-2">
        <Barres titre="Soutenances par jour" donnees={stats.par_jour} libelle={(d) => formaterDate(d.date)} />
        <Barres titre="Salles utilisées" donnees={stats.par_salle} />
        <Barres titre="Charge par évaluateur" donnees={stats.par_evaluateur} />
      </div>
      {bilan && <p className="alerte alerte--ok">{bilan}</p>}
      <ZoneReinitialisation onFait={apresReinitialisation} />
    </section>
  )
}
