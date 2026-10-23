import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Clock3,
  DoorOpen,
  GraduationCap,
  Pencil,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'
import { api } from '../../services/api'
import Modal from '../../components/informatique/Modal'
import { formaterDate, telechargerCsv } from './csv'

const STATUTS = { planifiee: 'Planifiée', terminee: 'Terminée', annulee: 'Annulée' }
const FORM_VIDE = { id_etudiant: '', id_salle: '', id_evaluateur: '', date_soutenance: '', heure_debut: '08:00', heure_fin: '08:30', statut: 'planifiee', theme: '' }
const GEN_DEFAUT = { date_debut: '', nb_jours: 5, heure_debut: '08:00', heure_fin: '17:00', duree_min: 30 }

export default function Soutenances() {
  const [soutenances, setSoutenances] = useState([])
  const [etudiants, setEtudiants] = useState([])
  const [salles, setSalles] = useState([])
  const [evaluateurs, setEvaluateurs] = useState([])
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const [filtreDate, setFiltreDate] = useState('')
  const [modal, setModal] = useState(null) // { id|null, valeurs }
  const [gen, setGen] = useState(null)
  const [conflits, setConflits] = useState([])
  const [erreurForm, setErreurForm] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [bilan, setBilan] = useState('')
  const [planningPublie, setPlanningPublie] = useState(false)
  const [enPublicaton, setEnPublication] = useState(false)

  const recharger = useCallback(async () => {
    try {
      setErreur('')
      const [s, e, sa, ev, pub] = await Promise.all([
        api.get('/api/soutenances'), api.get('/api/etudiants'), api.get('/api/salles'), api.get('/api/evaluateurs'),
        api.get('/api/soutenances/publication').catch(() => ({ publie: false })),
      ])
      setSoutenances(s); setEtudiants(e); setSalles(sa); setEvaluateurs(ev)
      setPlanningPublie(pub.publie)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => { recharger() }, [recharger])

  const visibles = useMemo(() => (filtreDate ? soutenances.filter((s) => s.date_soutenance === filtreDate) : soutenances), [soutenances, filtreDate])

  // Étudiants sans soutenance (+ celui en cours de modification)
  const etudiantsLibres = useMemo(() => {
    const pris = new Set(soutenances.map((s) => s.id_etudiant))
    return etudiants.filter((e) => !pris.has(e.id_etudiant) || (modal?.id && String(e.id_etudiant) === String(modal.valeurs.id_etudiant)))
  }, [etudiants, soutenances, modal])

  const ouvrir = (s) => {
    setConflits([]); setErreurForm('')
    setModal(s
      ? { id: s.id_soutenance, valeurs: { id_etudiant: s.id_etudiant, id_salle: s.id_salle, id_evaluateur: s.id_evaluateur, date_soutenance: s.date_soutenance, heure_debut: s.heure_debut, heure_fin: s.heure_fin, statut: s.statut, theme: s.theme || '' } }
      : { id: null, valeurs: { ...FORM_VIDE } })
  }

  const maj = (k, v) => setModal((m) => ({ ...m, valeurs: { ...m.valeurs, [k]: v } }))

  async function enregistrer(e) {
    e.preventDefault()
    setEnCours(true); setConflits([]); setErreurForm('')
    try {
      if (modal.id) await api.put(`/api/soutenances/${modal.id}`, modal.valeurs)
      else await api.post('/api/soutenances', modal.valeurs)
      setModal(null)
      await recharger()
    } catch (err) {
      setErreurForm(err.message)
      setConflits(err.conflits || [])
    } finally {
      setEnCours(false)
    }
  }

  async function supprimer(s) {
    if (!window.confirm(`Supprimer la soutenance de ${s.etudiant_nom} ${s.etudiant_prenom} ?`)) return
    try {
      await api.del(`/api/soutenances/${s.id_soutenance}`)
      await recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function generer(e) {
    e.preventDefault()
    setEnCours(true); setErreurForm('')
    try {
      const r = await api.post('/api/soutenances/generer', gen)
      setGen(null)
      setBilan(r.message || `${r.planifiees} soutenance(s) planifiée(s)` + (r.restants ? ` — ${r.restants} étudiant(s) restent sans créneau : prolongez la période ou ajoutez des salles/évaluateurs.` : '.'))
      await recharger()
    } catch (err) {
      setErreurForm(err.message)
    } finally {
      setEnCours(false)
    }
  }

  function exporter() {
    telechargerCsv('planning-soutenances-informatique.csv', [
      ['Date', 'Début', 'Fin', 'Thème', 'Parcours', 'Matricule', 'Nom', 'Prénom', 'Salle', 'Évaluateur', 'Statut'],
      ...visibles.map((s) => [s.date_soutenance, s.heure_debut, s.heure_fin, s.theme || '', s.parcours || '', s.matricule, s.etudiant_nom, s.etudiant_prenom, s.nom_salle, `${s.evaluateur_nom} ${s.evaluateur_prenom}`, STATUTS[s.statut]]),
    ])
  }

  async function publierPlanning() {
    if (!visibles.length) {
      setErreur('Veuillez créer au moins une soutenance avant de publier le planning.')
      return
    }
    if (!window.confirm('Êtes-vous sûr de vouloir publier le planning ? Les étudiants pourront le consulter.')) return
    
    setEnPublication(true)
    try {
      // L'API doit implémenter cet endpoint
      await api.post('/api/soutenances/publier', {})
      setPlanningPublie(true)
      setErreur('')
      setBilan('Planning publié avec succès ! Les étudiants peuvent maintenant le consulter.')
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la publication du planning.')
    } finally {
      setEnPublication(false)
    }
  }

  async function depublierPlanning() {
    if (!window.confirm('Êtes-vous sûr de vouloir dépublier le planning ? Les étudiants ne pourront plus le consulter.')) return
    
    setEnPublication(true)
    try {
      // L'API doit implémenter cet endpoint
      await api.post('/api/soutenances/depublier', {})
      setPlanningPublie(false)
      setErreur('')
      setBilan('Planning dépublié. Les étudiants ne peuvent plus le consulter.')
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la dépublication du planning.')
    } finally {
      setEnPublication(false)
    }
  }

  return (
    <section>
      <header className="section__tete">
        <div>
          <h1>Planning des soutenances {planningPublie && <span style={{ color: '#1f6b3e', marginLeft: '0.5rem' }}>✓ Publié</span>}</h1>
          <p className="section__sous">{soutenances.length} soutenance(s) · {etudiants.length - soutenances.length} étudiant(s) sans créneau</p>
        </div>
        <div className="barre">
          <input className="champ" type="date" value={filtreDate} onChange={(e) => setFiltreDate(e.target.value)} title="Filtrer par date" />
          <button className="btn" onClick={exporter} disabled={!visibles.length}>Exporter CSV</button>
          <button className="btn" onClick={() => window.print()} disabled={!visibles.length}>Imprimer / PDF</button>
          <button className="btn" onClick={() => { setErreurForm(''); setGen({ ...GEN_DEFAUT, date_debut: new Date().toISOString().slice(0, 10) }) }}>Générer</button>
          {planningPublie ? (
            <button className="btn btn--danger" onClick={depublierPlanning} disabled={enPublicaton}>
              {enPublicaton ? 'Dépublication…' : 'Dépublier'}
            </button>
          ) : (
            <button className="btn btn--primaire" onClick={publierPlanning} disabled={enPublicaton || !soutenances.length}>
              {enPublicaton ? 'Publication…' : 'Publier'}
            </button>
          )}
          <button className="btn btn--primaire" onClick={() => ouvrir(null)}>+ Soutenance</button>
        </div>
      </header>

      {bilan && <p className="alerte alerte--ok">{bilan}</p>}
      {erreur && <p className="alerte alerte--erreur">{erreur}</p>}

      <div className="tableau__cadre">
        <table className="tableau">
          <thead>
            <tr>
              <th><span className="th-icone"><CalendarDays size={14} aria-hidden="true" />Date</span></th>
              <th><span className="th-icone"><Clock3 size={14} aria-hidden="true" />Horaire</span></th>
              <th><span className="th-icone"><Users size={14} aria-hidden="true" />Étudiant</span></th>
              <th><span className="th-icone"><BookOpen size={14} aria-hidden="true" />Thème</span></th>
              <th><span className="th-icone"><GraduationCap size={14} aria-hidden="true" />Parcours</span></th>
              <th><span className="th-icone"><DoorOpen size={14} aria-hidden="true" />Salle</span></th>
              <th><span className="th-icone"><UserCheck size={14} aria-hidden="true" />Évaluateur</span></th>
              <th><span className="th-icone"><BadgeCheck size={14} aria-hidden="true" />Statut</span></th>
              <th className="tableau__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan="9" className="tableau__vide">Chargement…</td></tr>}
            {!chargement && visibles.length === 0 && <tr><td colSpan="9" className="tableau__vide">Aucune soutenance planifiée</td></tr>}
            {visibles.map((s) => (
              <tr key={s.id_soutenance}>
                <td>{formaterDate(s.date_soutenance)}</td>
                <td>{s.heure_debut} – {s.heure_fin}</td>
                <td>{s.etudiant_nom} {s.etudiant_prenom}<br /><small>{s.matricule}</small></td>
                <td>{s.theme || '—'}</td>
                <td>{s.parcours || '—'}</td>
                <td>{s.nom_salle}</td>
                <td>{s.evaluateur_nom} {s.evaluateur_prenom}</td>
                <td><span className={`pastille ${s.statut === 'annulee' ? 'pastille--ko' : 'pastille--ok'}`}>{STATUTS[s.statut]}</span></td>
                <td className="tableau__actions">
                  <button className="btn btn--petit" onClick={() => ouvrir(s)} title="Modifier" aria-label="Modifier">
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button className="btn btn--petit btn--danger" onClick={() => supprimer(s)} title="Supprimer" aria-label="Supprimer">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal titre={modal.id ? 'Modifier la soutenance' : 'Nouvelle soutenance'} onFermer={() => setModal(null)}>
          <form onSubmit={enregistrer} className="formulaire">
            <label className="formulaire__champ"><span>Étudiant *</span>
              <select className="champ" required value={modal.valeurs.id_etudiant} onChange={(e) => maj('id_etudiant', e.target.value)}>
                <option value="">— Choisir —</option>
                {etudiantsLibres.map((e) => <option key={e.id_etudiant} value={e.id_etudiant}>{e.nom} {e.prenom} ({e.matricule})</option>)}
              </select>
            </label>
            <label className="formulaire__champ"><span>Salle *</span>
              <select className="champ" required value={modal.valeurs.id_salle} onChange={(e) => maj('id_salle', e.target.value)}>
                <option value="">— Choisir —</option>
                {salles.map((s) => <option key={s.id_salle} value={s.id_salle} disabled={s.statut !== 'disponible'}>{s.nom_salle}{s.statut !== 'disponible' ? ' (indisponible)' : ''}</option>)}
              </select>
            </label>
            <label className="formulaire__champ"><span>Évaluateur *</span>
              <select className="champ" required value={modal.valeurs.id_evaluateur} onChange={(e) => maj('id_evaluateur', e.target.value)}>
                <option value="">— Choisir —</option>
                {evaluateurs.map((v) => <option key={v.id_evaluateur} value={v.id_evaluateur} disabled={v.statut !== 'disponible'}>{v.nom} {v.prenom}{v.statut !== 'disponible' ? ' (indisponible)' : ''}</option>)}
              </select>
            </label>
            <label className="formulaire__champ"><span>Thème</span>
              <input className="champ" type="text" value={modal.valeurs.theme} onChange={(e) => maj('theme', e.target.value)} placeholder="Sujet de la soutenance" />
            </label>
            <label className="formulaire__champ"><span>Date *</span>
              <input className="champ" type="date" required value={modal.valeurs.date_soutenance} onChange={(e) => maj('date_soutenance', e.target.value)} />
            </label>
            <div className="formulaire__ligne">
              <label className="formulaire__champ"><span>Début *</span>
                <input className="champ" type="time" required value={modal.valeurs.heure_debut} onChange={(e) => maj('heure_debut', e.target.value)} />
              </label>
              <label className="formulaire__champ"><span>Fin *</span>
                <input className="champ" type="time" required value={modal.valeurs.heure_fin} onChange={(e) => maj('heure_fin', e.target.value)} />
              </label>
            </div>
            <label className="formulaire__champ"><span>Statut</span>
              <select className="champ" value={modal.valeurs.statut} onChange={(e) => maj('statut', e.target.value)}>
                {Object.entries(STATUTS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            {erreurForm && (
              <div className="alerte alerte--erreur">
                <strong>{erreurForm}</strong>
                {conflits.length > 0 && <ul>{conflits.map((c, i) => <li key={i}>{c}</li>)}</ul>}
              </div>
            )}
            <div className="formulaire__actions">
              <button type="button" className="btn" onClick={() => setModal(null)}>Annuler</button>
              <button type="submit" className="btn btn--primaire" disabled={enCours}>{enCours ? 'Vérification…' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}

      {gen && (
        <Modal titre="Générer le planning automatiquement" onFermer={() => setGen(null)}>
          <form onSubmit={generer} className="formulaire">
            <p className="aide">Planifie tous les étudiants sans soutenance, sans conflit de salle ni d'évaluateur, du lundi au vendredi, en équilibrant la charge des évaluateurs disponibles.</p>
            <label className="formulaire__champ"><span>Premier jour *</span>
              <input className="champ" type="date" required value={gen.date_debut} onChange={(e) => setGen({ ...gen, date_debut: e.target.value })} />
            </label>
            <div className="formulaire__ligne">
              <label className="formulaire__champ"><span>Jours ouvrés *</span>
                <input className="champ" type="number" min="1" max="60" required value={gen.nb_jours} onChange={(e) => setGen({ ...gen, nb_jours: e.target.value })} />
              </label>
              <label className="formulaire__champ"><span>Durée (min) *</span>
                <input className="champ" type="number" min="10" max="240" step="5" required value={gen.duree_min} onChange={(e) => setGen({ ...gen, duree_min: e.target.value })} />
              </label>
            </div>
            <div className="formulaire__ligne">
              <label className="formulaire__champ"><span>Début de journée *</span>
                <input className="champ" type="time" required value={gen.heure_debut} onChange={(e) => setGen({ ...gen, heure_debut: e.target.value })} />
              </label>
              <label className="formulaire__champ"><span>Fin de journée *</span>
                <input className="champ" type="time" required value={gen.heure_fin} onChange={(e) => setGen({ ...gen, heure_fin: e.target.value })} />
              </label>
            </div>
            {erreurForm && <p className="alerte alerte--erreur">{erreurForm}</p>}
            <div className="formulaire__actions">
              <button type="button" className="btn" onClick={() => setGen(null)}>Annuler</button>
              <button type="submit" className="btn btn--primaire" disabled={enCours}>{enCours ? 'Génération…' : 'Générer'}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  )
}
