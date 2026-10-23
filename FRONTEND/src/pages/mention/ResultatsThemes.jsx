import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  CircleAlert,
  Clock,
  Download,
  FileText,
  MessageSquare,
  RefreshCw,
  Users,
} from 'lucide-react'
import { api } from '../../services/api'
import Alerte from '../../components/ui/Alerte'
import Bouton from '../../components/ui/Bouton'
import CarteStat from '../../components/ui/CarteStat'
import BadgeStatut from '../../components/evaluateur/themes/BadgeStatut'
import { STATUT_CONFIG } from '../../constants/themes'
import { formaterDateHeure } from '../../utils/format'
import { telechargerCsv } from '../informatique/csv'

const FILTRES = [
  { value: '', label: 'Tous les étudiants' },
  { value: 'VALIDE', label: 'Thèmes validés' },
  { value: 'MODIFICATIONS', label: 'Modifications demandées' },
  { value: 'REJETE', label: 'Thèmes rejetés' },
  { value: 'EN_ATTENTE', label: 'À valider' },
  { value: 'SANS_THEME', label: 'Sans thème' },
]

/** Résultats de la validation des thèmes (décidée par les évaluateurs) pour la mention connectée. */
export default function ResultatsThemes() {
  const [lignes, setLignes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [filtre, setFiltre] = useState('')

  async function recharger() {
    try {
      setErreur('')
      const donnees = await api.get('/api/resultats/themes')
      setLignes(
        donnees.map((l) => ({
          ...l,
          statut: (l.theme || '').trim() ? l.theme_statut || 'EN_ATTENTE' : 'SANS_THEME',
        })),
      )
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    recharger()
  }, [])

  const visibles = useMemo(
    () => (filtre ? lignes.filter((l) => l.statut === filtre) : lignes),
    [lignes, filtre],
  )

  const compter = (statut) => lignes.filter((l) => l.statut === statut).length

  function exporter() {
    telechargerCsv(`resultats_themes_${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Matricule', 'Nom', 'Prénom', 'Lieu de stage', 'Thème', 'Statut', 'Évaluateur', 'Date'],
      ...visibles.map((l) => [
        l.matricule,
        l.nom,
        l.prenom,
        l.lieu_stage ?? '',
        l.theme ?? '',
        STATUT_CONFIG[l.statut]?.label ?? l.statut,
        l.decide_par ?? '',
        l.theme_date_decision ?? '',
      ]),
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Résultats de thèmes</h1>
          <p className="text-ink-muted mt-1">
            Décisions des évaluateurs sur les thèmes des étudiants de votre parcours
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filtrer par statut"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            className="px-4 py-2.5 text-sm text-navy-900 bg-white border border-line rounded-xl focus:border-navy-400 focus:outline-none transition cursor-pointer"
          >
            {FILTRES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <Bouton variante="secondaire" className="w-auto" onClick={exporter} disabled={visibles.length === 0}>
            <Download size={16} className="mr-1" />
            Exporter CSV
          </Bouton>
          <Bouton variante="discret" taille="icone" onClick={recharger} aria-label="Actualiser">
            <RefreshCw size={16} />
          </Bouton>
        </div>
      </div>

      {erreur && <Alerte variante="erreur">{erreur}</Alerte>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CarteStat label="Étudiants" value={lignes.length} classe="bg-slate-100 text-slate-700" icone={Users} />
        <CarteStat label="Validés" value={compter('VALIDE')} classe="bg-emerald-100 text-emerald-700" icone={CheckCircle2} />
        <CarteStat label="Modifications" value={compter('MODIFICATIONS')} classe="bg-amber-100 text-amber-700" icone={MessageSquare} />
        <CarteStat label="Rejetés" value={compter('REJETE')} classe="bg-red-100 text-red-700" icone={CircleAlert} />
        <CarteStat label="À valider" value={compter('EN_ATTENTE')} classe="bg-sky-100 text-sky-700" icone={Clock} />
      </div>

      <div className="tableau__cadre">
        {chargement ? (
          <p className="p-12 text-center text-ink-muted">Chargement des résultats…</p>
        ) : visibles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-line mb-4" aria-hidden="true" />
            <h3 className="font-display font-semibold text-navy-900 mb-2">Aucun résultat</h3>
            <p className="text-ink-muted">Aucun étudiant ne correspond au filtre choisi.</p>
          </div>
        ) : (
          <table className="tableau">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Matricule</th>
                <th>Lieu de stage</th>
                <th>Thème</th>
                <th>Statut</th>
                <th>Évaluateur</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((l) => (
                <tr key={l.id_etudiant}>
                  <td className="font-medium text-navy-900 whitespace-nowrap">
                    {l.prenom} {l.nom}
                  </td>
                  <td>{l.matricule}</td>
                  <td>{l.lieu_stage || '—'}</td>
                  <td>{l.theme || '—'}</td>
                  <td>
                    <BadgeStatut statut={l.statut} />
                  </td>
                  <td className="whitespace-nowrap">{l.decide_par || '—'}</td>
                  <td className="whitespace-nowrap">
                    {l.theme_date_decision ? formaterDateHeure(l.theme_date_decision) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
