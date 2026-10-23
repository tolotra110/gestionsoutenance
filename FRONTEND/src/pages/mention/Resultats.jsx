import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  Download,
  FileText,
  Hash,
  RefreshCw,
  Star,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import { api } from '../../services/api'
import Alerte from '../../components/ui/Alerte'
import Bouton from '../../components/ui/Bouton'
import CarteStat from '../../components/ui/CarteStat'
import { formaterDate, telechargerCsv } from '../informatique/csv'

const FILTRES = [
  { value: 'SOUMIS', label: 'Soumis (résultats)' },
  { value: '', label: 'Tous les rapports' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'A_REDIGER', label: 'À rédiger' },
]

const LIBELLES_STATUT = { SOUMIS: 'Soumis', EN_COURS: 'En cours', A_REDIGER: 'À rédiger' }

const LIBELLES_PARCOURS = { INFO: 'Informatique', MNGT: 'Management', COMM: 'ICM' }

const CLASSE_STATUT = {
  SOUMIS: 'bg-emerald-100 text-emerald-700',
  EN_COURS: 'bg-amber-100 text-amber-700',
  A_REDIGER: 'bg-sky-100 text-sky-700',
}

export default function Resultats() {
  const [resultats, setResultats] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('SOUMIS')

  async function recharger() {
    try {
      setErreur('')
      setResultats(await api.get('/api/resultats'))
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
    () => (filtreStatut ? resultats.filter((r) => r.statut === filtreStatut) : resultats),
    [resultats, filtreStatut]
  )

  const stats = useMemo(() => {
    const soumis = resultats.filter((r) => r.statut === 'SOUMIS')
    const notes = soumis.filter((r) => r.note !== null && r.note !== undefined)
    return {
      total: soumis.length,
      admis: soumis.filter((r) => r.decision === 'ADMIS').length,
      ajournes: soumis.filter((r) => r.decision === 'AJOURNE').length,
      moyenne:
        notes.length > 0
          ? notes.reduce((somme, r) => somme + Number(r.note), 0) / notes.length
          : null,
    }
  }, [resultats])

  function exporter() {
    telechargerCsv(
      `resultats_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        [
          'Rapport', 'Soutenance', 'Date', 'Créneau', 'Étudiant', 'Matricule', 'Parcours', 'Sujet',
          'Salle', 'Évaluateur', 'Statut', 'Décision', 'Mention', 'Note', 'Soumis le',
        ],
        ...visibles.map((r) => [
          r.id_rapport,
          r.id_soutenance,
          r.date_soutenance,
          r.heure_debut,
          `${r.etudiant_prenom} ${r.etudiant_nom}`.trim(),
          r.matricule,
          LIBELLES_PARCOURS[r.parcours] ?? r.parcours,
          r.theme,
          `${r.nom_salle} (${r.localisation})`,
          `${r.evaluateur_prenom} ${r.evaluateur_nom}`.trim(),
          LIBELLES_STATUT[r.statut] ?? r.statut,
          r.decision ?? '',
          r.mention ?? '',
          r.note ?? '',
          r.soumis_le ?? '',
        ]),
      ]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Résultats des soutenances</h1>
          <p className="text-ink-muted mt-1">
            Résultats des étudiants de votre parcours, une fois le rapport soumis par l'évaluateur
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filtrer par statut"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CarteStat label="Résultats soumis" value={stats.total} classe="bg-navy-100 text-navy-700" icone={FileText} />
        <CarteStat label="Admis" value={stats.admis} classe="bg-emerald-100 text-emerald-700" icone={CheckCircle2} />
        <CarteStat label="Ajournés" value={stats.ajournes} classe="bg-amber-100 text-amber-700" icone={XCircle} />
        <CarteStat
          label="Moyenne"
          value={stats.moyenne === null ? '—' : `${stats.moyenne.toFixed(2)}/20`}
          classe="bg-sky-100 text-sky-700"
          icone={Award}
        />
      </div>

      <div className="tableau__cadre">
        {chargement ? (
          <p className="p-12 text-center text-ink-muted">Chargement des résultats…</p>
        ) : visibles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-line mb-4" aria-hidden="true" />
            <h3 className="font-display font-semibold text-navy-900 mb-2">Aucun résultat</h3>
            <p className="text-ink-muted">
              {filtreStatut === 'SOUMIS'
                ? "Aucun rapport n'a encore été soumis pour votre parcours."
                : 'Aucun rapport ne correspond au filtre choisi.'}
            </p>
          </div>
        ) : (
          <table className="tableau">
            <thead>
              <tr>
                <th><span className="th-icone"><Users size={14} aria-hidden="true" />Étudiant</span></th>
                <th><span className="th-icone"><Hash size={14} aria-hidden="true" />Matricule</span></th>
                <th><span className="th-icone"><Users size={14} aria-hidden="true" />Parcours</span></th>
                <th><span className="th-icone"><BookOpen size={14} aria-hidden="true" />Sujet</span></th>
                <th><span className="th-icone"><CalendarDays size={14} aria-hidden="true" />Date</span></th>
                <th><span className="th-icone"><DoorOpen size={14} aria-hidden="true" />Salle</span></th>
                <th><span className="th-icone"><UserCheck size={14} aria-hidden="true" />Évaluateur</span></th>
                <th><span className="th-icone"><BadgeCheck size={14} aria-hidden="true" />Statut</span></th>
                <th><span className="th-icone"><CheckCircle2 size={14} aria-hidden="true" />Décision</span></th>
                <th><span className="th-icone"><Award size={14} aria-hidden="true" />Mention</span></th>
                <th className="text-right"><span className="th-icone"><Star size={14} aria-hidden="true" />Note</span></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((r) => (
                <tr key={r.id_rapport}>
                  <td className="font-medium text-navy-900 whitespace-nowrap">
                    {r.etudiant_prenom} {r.etudiant_nom}
                  </td>
                  <td>{r.matricule}</td>
                  <td>{LIBELLES_PARCOURS[r.parcours] ?? r.parcours}</td>
                  <td>{r.theme}</td>
                  <td className="whitespace-nowrap">{formaterDate(r.date_soutenance)}</td>
                  <td className="whitespace-nowrap">{r.nom_salle}</td>
                  <td className="whitespace-nowrap">
                    {r.evaluateur_prenom} {r.evaluateur_nom}
                  </td>
                  <td>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${CLASSE_STATUT[r.statut] ?? 'bg-paper-tint text-ink-soft'}`}
                    >
                      {LIBELLES_STATUT[r.statut] ?? r.statut}
                    </span>
                  </td>
                  <td>
                    {r.decision === 'ADMIS' ? 'Admis' : r.decision === 'AJOURNE' ? 'Ajourné' : '—'}
                  </td>
                  <td>{r.mention ?? '—'}</td>
                  <td className="text-right font-semibold text-navy-900">
                    {r.note !== null && r.note !== undefined && r.note !== ''
                      ? `${Number(r.note).toFixed(2)}/20`
                      : '—'}
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
