import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, FileText, RefreshCw, Search } from 'lucide-react'
import { api } from '../../services/api'
import Alerte from '../../components/ui/Alerte'
import Bouton from '../../components/ui/Bouton'
import Modal from '../../components/informatique/Modal'
import { construirePv, dateFr, paragraphesPv } from '../../constants/pv'
import { telechargerPv, telechargerTousPv } from '../../utils/pvPdf'

/** Aperçu à l'écran : mêmes textes que le PDF (constants/pv.js). */
function FeuillePv({ pv }) {
  return (
    <div className="pv-feuille">
      <div className="pv-feuille__tete">
        <strong>UNIVERSITE DE FIANARANTSOA</strong>
        <span>ECOLE DE MANAGEMENT ET D'INNOVATION TECHNOLOGIQUE</span>
        <span>E.M.I.T.</span>
      </div>
      <h3 className="pv-feuille__titre">PROCES VERBAL DE SOUTENANCE</h3>
      <p className="pv-feuille__sous">
        SOUTENANCE DE MEMOIRE EN VUE DE L'OBTENTION DU DIPLOME DE LICENCE
        <br />
        MENTION : {pv.mention}
        <br />
        PARCOURS : {pv.parcours}
        <br />
        ANNÉE UNIVERSITAIRE : {pv.annee}
      </p>
      {paragraphesPv(pv).map((p, i) => (
        <p key={i} className="pv-feuille__para">
          {p.segs.map((s, k) => (
            <span key={k} style={{ fontWeight: s.b ? 700 : 400, textDecoration: s.u ? 'underline' : 'none' }}>
              {s.t}
            </span>
          ))}
        </p>
      ))}
    </div>
  )
}

export default function ProcesVerbaux() {
  const [resultats, setResultats] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [ajustements, setAjustements] = useState({}) // { [id_etudiant]: { lieuNaissance, annee } }
  const [ouvert, setOuvert] = useState(null) // résultat affiché dans l'aperçu
  const [occupe, setOccupe] = useState(false)

  async function recharger() {
    try {
      setErreur('')
      setResultats(await api.get('/api/resultats/pv'))
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    recharger()
  }, [])

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    if (!q) return resultats
    return resultats.filter((r) =>
      `${r.etudiant_nom} ${r.etudiant_prenom} ${r.matricule}`.toLowerCase().includes(q)
    )
  }, [resultats, recherche])

  const pvDe = (r) => construirePv(r, ajustements[r.id_etudiant])

  async function lancer(action) {
    try {
      setOccupe(true)
      setErreur('')
      await action()
    } catch (err) {
      setErreur(`Impossible de générer le PDF : ${err.message}`)
    } finally {
      setOccupe(false)
    }
  }

  function modifier(r, champ, valeur) {
    setAjustements((a) => ({ ...a, [r.id_etudiant]: { ...a[r.id_etudiant], [champ]: valeur } }))
  }

  // Enregistre le lieu de naissance saisi (sans bloquer le PDF si la colonne n'existe pas encore)
  async function memoriserLieu(r) {
    const lieu = ajustements[r.id_etudiant]?.lieuNaissance
    if (lieu === undefined || lieu === (r.lieu_naissance ?? '')) return
    try {
      await api.put(`/api/resultats/pv/etudiants/${r.id_etudiant}/lieu-naissance`, { lieu_naissance: lieu })
      setResultats((liste) => liste.map((x) => (x.id_etudiant === r.id_etudiant ? { ...x, lieu_naissance: lieu } : x)))
    } catch {
      /* migration 016 non exécutée : la valeur reste valable pour ce PV */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Procès-verbaux de soutenance</h1>
          <p className="text-ink-muted mt-1">
            Un PV par étudiant, généré à partir de la note et du nom de l'évaluateur (rapport soumis)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              className="champ champ--recherche"
              style={{ paddingLeft: '2rem' }}
              placeholder="Rechercher…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </label>
          <Bouton
            variante="secondaire"
            className="w-auto"
            disabled={occupe || visibles.length === 0}
            onClick={() => lancer(() => telechargerTousPv(visibles.map(pvDe)))}
          >
            <Download size={16} className="mr-1" />
            Tous les PV (1 PDF)
          </Bouton>
          <Bouton variante="discret" taille="icone" onClick={recharger} aria-label="Actualiser">
            <RefreshCw size={16} />
          </Bouton>
        </div>
      </div>

      {erreur && <Alerte variante="erreur">{erreur}</Alerte>}

      <div className="tableau__cadre">
        {chargement ? (
          <p className="p-12 text-center text-ink-muted">Chargement des procès-verbaux…</p>
        ) : visibles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-line mb-4" aria-hidden="true" />
            <h3 className="font-display font-semibold text-navy-900 mb-2">Aucun procès-verbal</h3>
            <p className="text-ink-muted">
              Un PV est disponible dès que l'évaluateur a soumis son rapport avec la note de l'étudiant.
            </p>
          </div>
        ) : (
          <table className="tableau">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Matricule</th>
                <th>Soutenance</th>
                <th>Évaluateur</th>
                <th>Décision</th>
                <th>Mention</th>
                <th className="text-right">Note</th>
                <th className="text-right">PV</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((r) => (
                <tr key={r.id_rapport}>
                  <td className="font-medium text-navy-900 whitespace-nowrap">
                    {r.etudiant_prenom} {r.etudiant_nom}
                  </td>
                  <td>{r.matricule}</td>
                  <td className="whitespace-nowrap">{dateFr(r.date_soutenance)}</td>
                  <td className="whitespace-nowrap">
                    {r.evaluateur_prenom} {r.evaluateur_nom}
                  </td>
                  <td>{r.decision === 'ADMIS' ? 'Admis' : r.decision === 'AJOURNE' ? 'Ajourné' : '—'}</td>
                  <td>{pvDe(r).mentionObtenue || '—'}</td>
                  <td className="text-right font-semibold text-navy-900">{Number(r.note).toFixed(2)}/20</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Bouton variante="secondaire" taille="sm" onClick={() => setOuvert(r)}>
                        <Eye size={14} aria-hidden="true" />
                        Aperçu
                      </Bouton>
                      <Bouton
                        taille="sm"
                        disabled={occupe}
                        onClick={() => lancer(() => telechargerPv(pvDe(r)))}
                      >
                        <Download size={14} aria-hidden="true" />
                        PDF
                      </Bouton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {ouvert && (
        <Modal titre={`PV · ${ouvert.etudiant_prenom} ${ouvert.etudiant_nom}`} onFermer={() => setOuvert(null)} large>
          <div className="formulaire">
            <div className="formulaire__ligne">
              <label className="formulaire__champ">
                Lieu de naissance
                <input
                  className="champ"
                  value={ajustements[ouvert.id_etudiant]?.lieuNaissance ?? ouvert.lieu_naissance ?? ''}
                  onChange={(e) => modifier(ouvert, 'lieuNaissance', e.target.value)}
                  placeholder="Ex. Antananarivo"
                />
              </label>
              <label className="formulaire__champ">
                Année universitaire
                <input
                  className="champ"
                  value={pvDe(ouvert).annee}
                  onChange={(e) => modifier(ouvert, 'annee', e.target.value)}
                  placeholder="2025-2026"
                />
              </label>
            </div>
            <FeuillePv pv={pvDe(ouvert)} />
            <div className="formulaire__actions">
              <Bouton variante="secondaire" className="w-auto" onClick={() => setOuvert(null)}>
                Fermer
              </Bouton>
              <Bouton
                className="w-auto"
                disabled={occupe}
                onClick={() =>
                  lancer(async () => {
                    await memoriserLieu(ouvert)
                    await telechargerPv(pvDe(ouvert))
                  })
                }
              >
                <Download size={16} className="mr-1" aria-hidden="true" />
                Télécharger en PDF
              </Bouton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
