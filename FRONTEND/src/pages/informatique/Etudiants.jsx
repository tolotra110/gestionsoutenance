import { useRef, useState } from 'react'
import {
  AlignLeft,
  BookOpen,
  Briefcase,
  CalendarDays,
  Cpu,
  Hash,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import CrudSection from '../../components/informatique/CrudSection'
import { api } from '../../services/api'
import { dateFr } from '../../constants/pv'
import { lireTableur, completerEtudiants } from './csv'

const COLONNES = [
  { cle: 'matricule', label: 'Matricule', icone: Hash },
  { cle: 'nom', label: 'Nom', icone: User },
  { cle: 'prenom', label: 'Prénom', icone: User },
  { cle: 'telephone', label: 'Téléphone', icone: Phone },
  { cle: 'date_naissance', label: 'Date de naissance', icone: CalendarDays, render: (l) => dateFr(l.date_naissance) || '—' },
  { cle: 'lieu_naissance', label: 'Lieu de naissance', icone: MapPin },
  { cle: 'lieu_stage', label: 'Lieu de stage', icone: MapPin },
  { cle: 'theme', label: 'Thème', icone: BookOpen },
  { cle: 'description', label: 'Description', icone: AlignLeft },
  { cle: 'technologies', label: 'Technologies', icone: Cpu },
]

const CHAMPS = [
  { nom: 'matricule', label: 'Matricule', requis: true, placeholder: 'ex. 1234 H-F' },
  { nom: 'nom', label: 'Nom', requis: true },
  { nom: 'prenom', label: 'Prénom(s)', requis: true },
  { nom: 'telephone', label: 'Numéro de téléphone', type: 'tel', placeholder: 'ex. 034 12 345 67' },
  { nom: 'date_naissance', label: 'Date de naissance (imprimée sur le PV)', type: 'date' },
  { nom: 'lieu_naissance', label: 'Lieu de naissance (imprimé sur le PV)', placeholder: 'ex. Antananarivo' },
  { nom: 'lieu_stage', label: 'Lieu de stage', placeholder: 'ex. Entreprise XYZ' },
  { nom: 'theme', label: 'Thème', placeholder: 'ex. Application web de gestion' },
  { nom: 'description', label: 'Description', type: 'textarea', placeholder: 'Description du thème...' },
  { nom: 'technologies', label: 'Technologies utilisées', type: 'textarea', placeholder: 'ex. React, Node.js, PostgreSQL' },
]

const initiales = (l) => `${(l.nom || '?').trim()[0] || '?'}${(l.prenom || '').trim()[0] || ''}`.toUpperCase()

// Une carte par étudiant : identité en en-tête, infos clés, puis thème et technologies
function CarteEtudiant({ l }) {
  const techs = String(l.technologies ?? '').split(/[,;\n]/).map((t) => t.trim()).filter(Boolean)
  const infos = [
    { Icone: Phone, titre: 'Téléphone', val: l.telephone },
    { Icone: CalendarDays, titre: 'Date de naissance', val: dateFr(l.date_naissance) },
    { Icone: MapPin, titre: 'Lieu de naissance', val: l.lieu_naissance },
    { Icone: Briefcase, titre: 'Lieu de stage', val: l.lieu_stage },
  ].filter((i) => i.val)

  return (
    <>
      <div className="carte-etu__tete">
        <span className="carte-etu__avatar" aria-hidden="true">{initiales(l)}</span>
        <div className="carte-etu__id">
          <h3>{l.nom} {l.prenom}</h3>
          <span className="pastille carte-etu__matricule"><Hash size={12} aria-hidden="true" />{l.matricule}</span>
        </div>
      </div>

      {infos.length > 0 && (
        <ul className="carte-etu__infos">
          {infos.map(({ Icone, titre, val }) => (
            <li key={titre} title={titre}>
              <Icone size={14} aria-hidden="true" />
              <span>{val}</span>
            </li>
          ))}
        </ul>
      )}

      {(l.theme || l.description || techs.length > 0) && (
        <div className="carte-etu__theme">
          {l.theme && <p className="carte-etu__titre"><BookOpen size={14} aria-hidden="true" />{l.theme}</p>}
          {l.description && <p className="carte-etu__desc">{l.description}</p>}
          {techs.length > 0 && (
            <div className="carte-etu__techs">
              {techs.map((t) => <span key={t} className="puce">{t}</span>)}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function ImportCsv({ recharger, lignes }) {
  const fichier = useRef(null)
  const [message, setMessage] = useState(null)
  const [enCours, setEnCours] = useState(false)

  async function importer(e) {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    try {
      const { etudiants, incompletes } = completerEtudiants(await lireTableur(f))
      if (!etudiants.length) throw new Error('Fichier vide ou sans en-tête (matricule, nom, prenom…)')
      const bilan = await api.post('/api/etudiants/import', { etudiants })
      setMessage({
        ok: bilan.erreurs.length === 0,
        texte: `${bilan.crees} créé(s), ${bilan.mis_a_jour} mis à jour, ${bilan.erreurs.length} erreur(s)` +
          (incompletes ? ` — dont ${incompletes} ligne(s) incomplète(s) importée(s) (cherchez « (à compléter) » ou « SANS-MAT »)` : '') +
          (bilan.erreurs.length ? ` — ex. ligne ${bilan.erreurs[0].ligne} : ${bilan.erreurs[0].message}` : ''),
      })
      recharger()
    } catch (err) {
      setMessage({ ok: false, texte: err.message })
    }
  }

  // Supprime d'un coup tous les étudiants importés (et leurs soutenances) : une seule requête
  async function supprimerImport() {
    const n = lignes.length
    if (!window.confirm(`Supprimer les ${n} étudiant(s) importé(s) ?\nLeurs soutenances planifiées seront supprimées aussi. Cette action est irréversible.`)) return
    setEnCours(true)
    try {
      const res = await api.del('/api/etudiants')
      setMessage({ ok: true, texte: `${res.supprimes} étudiant(s) supprimé(s). Vous pouvez importer un nouveau fichier.` })
      await recharger()
    } catch (err) {
      setMessage({ ok: false, texte: err.message })
    } finally {
      setEnCours(false)
    }
  }

  return (
    <>
      <input ref={fichier} type="file" accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={importer} />
      <button className="btn" onClick={() => fichier.current.click()}>Importer Excel / CSV</button>
      {lignes.length > 0 && (
        <button className="btn btn--danger" onClick={supprimerImport} disabled={enCours}>
          {enCours ? 'Suppression…' : 'Supprimer les données importées'}
        </button>
      )}
      {message && <span className={`pastille ${message.ok ? 'pastille--ok' : 'pastille--ko'}`}>{message.texte}</span>}
    </>
  )
}

export default function Etudiants({ mention = 'Informatique' }) {
  return (
    <CrudSection
      titre={`Étudiants — ${mention}`}
      nomItem="l'étudiant"
      endpoint="/api/etudiants"
      idKey="id_etudiant"
      colonnes={COLONNES}
      champs={CHAMPS}
      rendreCarte={(l) => <CarteEtudiant l={l} />}
      extra={(p) => <ImportCsv {...p} />}
      aide="Import Excel (.xlsx) ou CSV : colonnes attendues — Matri, Nom, Prenom, Téléphone, Date de naissance, Lieu de naissance, Lieux de stage, Théme, Description, tous les téch utiliser (téléphone, date et lieu de naissance facultatifs). Les lignes incomplètes sont importées (valeurs provisoires à compléter). Un matricule existant est mis à jour."
    />
  )
}
