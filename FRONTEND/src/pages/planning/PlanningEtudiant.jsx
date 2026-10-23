import { useEffect, useState } from 'react'
import logoEmit from '../../assets/logo-emit.png'
import { getPlanningEtudiant } from '../../services/api'
import './planning.css'

const CLE = 'emit_dernier_matricule'
const STATUTS = { planifiee: 'Soutenance planifiée', terminee: 'Soutenance terminée', annulee: 'Soutenance annulée' }

const dateLongue = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function EtudiantApp() {
  const [matricule, setMatricule] = useState('')
  const [resultat, setResultat] = useState(null)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function chercher(valeur) {
    const m = valeur.trim()
    if (!m) return setErreur('Saisissez votre matricule.')
    setChargement(true); setErreur(''); setResultat(null)
    try {
      setResultat(await getPlanningEtudiant(m))
      try { localStorage.setItem(CLE, m) } catch { /* stockage indisponible */ }
    } catch (e) {
      setErreur(e.message)
    } finally {
      setChargement(false)
    }
  }

  // Revient directement sur le planning au prochain lancement de l'application
  useEffect(() => {
    let dernier = ''
    try { dernier = localStorage.getItem(CLE) || '' } catch { /* ignore */ }
    if (dernier) { setMatricule(dernier); chercher(dernier) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const s = resultat?.soutenance

  return (
    <div className="etu">
      <header className="etu__tete">
        <img src={logoEmit} alt="EMIT" />
        <h1>Ma soutenance</h1>
        <p>Licence 3 — consultez votre planning</p>
      </header>

      <div className="etu__boite">
        <form className="etu__form" onSubmit={(e) => { e.preventDefault(); chercher(matricule) }}>
          <input
            className="etu__input"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            placeholder="Votre matricule"
            autoComplete="off"
            autoCapitalize="characters"
            inputMode="text"
            aria-label="Matricule"
          />
          <button className="etu__bouton" disabled={chargement}>{chargement ? 'Recherche…' : 'Voir mon planning'}</button>
        </form>

        {erreur && <p className="etu__erreur" role="alert">{erreur}</p>}

        {resultat && (
          <div className="etu__carte">
            <p className="etu__nom">{resultat.etudiant.prenom} {resultat.etudiant.nom}</p>
            <p className="etu__mat">{resultat.etudiant.matricule} · {resultat.etudiant.mention}</p>

            {s ? (
              <>
                <span className={`etu__statut ${s.statut === 'annulee' ? 'etu__statut--annulee' : ''}`}>{STATUTS[s.statut]}</span>
                <div className="etu__ligne"><span className="etu__ico">📅</span><div><small>Date</small><strong>{dateLongue(s.date_soutenance)}</strong></div></div>
                <div className="etu__ligne"><span className="etu__ico">🕘</span><div><small>Heure</small><strong>{s.heure_debut} – {s.heure_fin}</strong></div></div>
                <div className="etu__ligne"><span className="etu__ico">🏫</span><div><small>Salle</small><strong>{s.nom_salle}</strong>{s.localisation && <em>{s.localisation}</em>}</div></div>
                <div className="etu__ligne"><span className="etu__ico">👤</span><div><small>Évaluateur</small><strong>{s.evaluateur_prenom} {s.evaluateur_nom}</strong></div></div>
              </>
            ) : (
              <p className="etu__attente">Votre soutenance n'est pas encore planifiée.<br />Revenez consulter l'application plus tard.</p>
            )}
          </div>
        )}

        {resultat && (
          <button className="etu__bouton etu__bouton--discret" style={{ width: '100%' }} onClick={() => { try { localStorage.removeItem(CLE) } catch { /* ignore */ } setResultat(null); setMatricule(''); setErreur('') }}>
            Changer de matricule
          </button>
        )}
      </div>
    </div>
  )
}
