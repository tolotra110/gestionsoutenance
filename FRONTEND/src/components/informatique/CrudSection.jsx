import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { api } from '../../services/api'
import Modal from './Modal'

/**
 * Section « liste + ajout / modification / suppression » réutilisée pour
 * Étudiants, Salles et Évaluateurs.
 */
const PAR_PAGE = 12

export default function CrudSection({ titre, nomItem, endpoint, idKey, colonnes, champs, extra, aide, rendreCarte }) {
  const [lignes, setLignes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [modal, setModal] = useState(null) // { id|null, valeurs }
  const [enCours, setEnCours] = useState(false)
  const [erreurForm, setErreurForm] = useState('')
  const [visibles, setVisibles] = useState(PAR_PAGE) // affichage en cartes : « Voir plus »

  const recharger = useCallback(async () => {
    try {
      setErreur('')
      setLignes(await api.get(endpoint))
    } catch (e) {
      setErreur(e.message)
    } finally {
      setChargement(false)
    }
  }, [endpoint])

  useEffect(() => { recharger() }, [recharger])

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    if (!q) return lignes
    return lignes.filter((l) => Object.values(l).some((v) => String(v ?? '').toLowerCase().includes(q)))
  }, [lignes, recherche])

  const valeursVides = () => Object.fromEntries(champs.map((c) => [c.nom, c.defaut ?? '']))

  function ouvrirAjout() {
    setErreurForm('')
    setModal({ id: null, valeurs: valeursVides() })
  }

  function ouvrirEdition(l) {
    setErreurForm('')
    setModal({ id: l[idKey], valeurs: Object.fromEntries(champs.map((c) => [c.nom, l[c.nom] ?? ''])) })
  }

  async function enregistrer(e) {
    e.preventDefault()
    setEnCours(true)
    setErreurForm('')
    try {
      if (modal.id) await api.put(`${endpoint}/${modal.id}`, modal.valeurs)
      else await api.post(endpoint, modal.valeurs)
      setModal(null)
      await recharger()
    } catch (err) {
      setErreurForm(err.message)
    } finally {
      setEnCours(false)
    }
  }

  async function supprimer(l) {
    if (!window.confirm(`Supprimer ${nomItem} « ${colonnes[0].render ? colonnes[0].render(l) : l[colonnes[0].cle]} » ?`)) return
    try {
      await api.del(`${endpoint}/${l[idKey]}`)
      await recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  return (
    <section>
      <header className="section__tete">
        <div>
          <h1>{titre}</h1>
          <p className="section__sous">{lignes.length} enregistrement{lignes.length > 1 ? 's' : ''}</p>
        </div>
        <div className="barre">
          <input className="champ champ--recherche" type="search" placeholder="Rechercher…" value={recherche} onChange={(e) => { setRecherche(e.target.value); setVisibles(PAR_PAGE) }} />
          {extra && extra({ recharger, lignes })}
          <button className="btn btn--primaire" onClick={ouvrirAjout}>+ Ajouter</button>
        </div>
      </header>

      {aide && <p className="aide">{aide}</p>}
      {erreur && <p className="alerte alerte--erreur">{erreur}</p>}

      {rendreCarte ? (
        <>
          {chargement && <p className="tableau__vide">Chargement…</p>}
          {!chargement && filtrees.length === 0 && <p className="tableau__vide">Aucun résultat</p>}
          <div className="grille-cartes">
            {filtrees.slice(0, visibles).map((l) => (
              <article key={l[idKey]} className="carte-item">
                <div className="carte-item__actions">
                  <button className="btn btn--petit" onClick={() => ouvrirEdition(l)} title="Modifier" aria-label="Modifier">
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button className="btn btn--petit btn--danger" onClick={() => supprimer(l)} title="Supprimer" aria-label="Supprimer">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
                {rendreCarte(l)}
              </article>
            ))}
          </div>
          {filtrees.length > visibles && (
            <div className="voir-plus">
              <button className="btn" onClick={() => setVisibles((v) => v + PAR_PAGE)}>
                Voir plus ({filtrees.length - visibles} restant{filtrees.length - visibles > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </>
      ) : (
      <div className="tableau__cadre">
        <table className="tableau">
          <thead>
            <tr>
              {colonnes.map((c) => (
                <th key={c.cle}>
                  {c.icone ? (
                    <span className="th-icone">
                      <c.icone size={14} aria-hidden="true" />
                      {c.label}
                    </span>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
              <th className="tableau__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargement && <tr><td colSpan={colonnes.length + 1} className="tableau__vide">Chargement…</td></tr>}
            {!chargement && filtrees.length === 0 && (
              <tr><td colSpan={colonnes.length + 1} className="tableau__vide">Aucun résultat</td></tr>
            )}
            {filtrees.map((l) => (
              <tr key={l[idKey]}>
                {colonnes.map((c) => <td key={c.cle}>{c.render ? c.render(l) : l[c.cle] ?? '—'}</td>)}
                <td className="tableau__actions">
                  <button className="btn btn--petit" onClick={() => ouvrirEdition(l)} title="Modifier" aria-label="Modifier">
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                  <button className="btn btn--petit btn--danger" onClick={() => supprimer(l)} title="Supprimer" aria-label="Supprimer">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {modal && (
        <Modal titre={`${modal.id ? 'Modifier' : 'Ajouter'} ${nomItem}`} onFermer={() => setModal(null)}>
          <form onSubmit={enregistrer} className="formulaire">
            {champs.map((c) => (
              <label key={c.nom} className="formulaire__champ">
                <span>{c.label}{c.requis && ' *'}</span>
                {c.options ? (
                  <select className="champ" value={modal.valeurs[c.nom]} onChange={(e) => setModal({ ...modal, valeurs: { ...modal.valeurs, [c.nom]: e.target.value } })}>
                    {c.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : c.type === 'textarea' ? (
                  <textarea
                    className="champ"
                    required={c.requis}
                    placeholder={c.placeholder}
                    value={modal.valeurs[c.nom]}
                    onChange={(e) => setModal({ ...modal, valeurs: { ...modal.valeurs, [c.nom]: e.target.value } })}
                  />
                ) : (
                  <input
                    className="champ"
                    type={c.type || 'text'}
                    required={c.requis}
                    min={c.type === 'number' ? 1 : undefined}
                    placeholder={c.placeholder}
                    value={modal.valeurs[c.nom]}
                    onChange={(e) => setModal({ ...modal, valeurs: { ...modal.valeurs, [c.nom]: e.target.value } })}
                  />
                )}
              </label>
            ))}
            {erreurForm && <p className="alerte alerte--erreur">{erreurForm}</p>}
            <div className="formulaire__actions">
              <button type="button" className="btn" onClick={() => setModal(null)}>Annuler</button>
              <button type="submit" className="btn btn--primaire" disabled={enCours}>{enCours ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  )
}
