import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  BookOpenCheck,
  Download,
} from 'lucide-react'
import Bouton from '../../components/ui/Bouton'
import ChampTexte from '../../components/ui/ChampTexte'
import { STATUT_CONFIG, STATUTS_SOUTENANCE } from '../../constants/soutenances'
import { formaterDateCourte, formaterHeure } from '../../utils/format'
import { listerSoutenances } from '../../services/soutenanceApi'

const STATUTS = STATUTS_SOUTENANCE

const ICONES_STATUT = {
  A_VENIR: ClockIcon,
  EN_COURS: AlertCircle,
  TERMINEE: CheckCircle,
  ANNULEE: AlertCircle,
}

function StatutBadge({ statut }) {
  const config = STATUT_CONFIG[statut] || STATUT_CONFIG.A_VENIR
  const Icone = ICONES_STATUT[statut] || ClockIcon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${config.classe}`}>
      <Icone size={10} aria-hidden="true" />
      {config.label}
    </span>
  )
}

function SoutenanceCard({ soutenance, onValider }) {
  const peutValiderTheme = ['A_VENIR', 'EN_COURS'].includes(soutenance.statut)

  return (
    <article
      className={`
        rounded-2xl border border-line bg-white p-5 transition hover:shadow-md
        ${soutenance.statut === 'EN_COURS' ? 'ring-2 ring-amber-400' : ''}
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-display font-semibold text-navy-900 truncate">{soutenance.sujet}</h3>
            <StatutBadge statut={soutenance.statut} />
          </div>
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-navy-900">{soutenance.etudiant.nom}</span> — {soutenance.etudiant.matricule}
          </p>
        </div>
        {soutenance.statut !== 'ANNULEE' && (
          <Bouton variante={peutValiderTheme ? 'primaire' : 'secondaire'} taille="sm" onClick={onValider}>
            <BookOpenCheck size={14} className="mr-1" />
            Donner la note / PV
          </Bouton>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="flex items-center gap-2 text-ink-muted">
          <Calendar size={16} aria-hidden="true" />
          <span>{formaterDateCourte(soutenance.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Clock size={16} aria-hidden="true" />
          <span>{soutenance.heure_debut} · {soutenance.duree} min</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <MapPin size={16} aria-hidden="true" />
          <span>{soutenance.salle.nom}, {soutenance.salle.batiment}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <User size={16} aria-hidden="true" />
          <span>Evaluateur : {soutenance.encadrant}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-line-soft flex flex-wrap items-center gap-4 text-sm text-ink-muted">
        <div className="flex items-center gap-1.5">
          <FileText size={14} aria-hidden="true" />
          <span>
            Parcours : <span className="font-medium text-navy-900">{soutenance.parcours}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={14} aria-hidden="true" />
          <span>Jury : {soutenance.jury.map((membre) => membre.nom).join(', ')}</span>
        </div>
        </div>
    </article>
  )
}

export default function MesSoutenances() {
  const navigate = useNavigate()
  const [soutenances, setSoutenances] = useState([])
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [statutFiltre, setStatutFiltre] = useState('')
  const [tri, setTri] = useState('date_croissant')


useEffect(() => {
  let actif = true;

  async function chargerSoutenances() {
    try {
      const donnees = await listerSoutenances();

      if (actif) {
        setSoutenances(donnees);
      }
    } catch (erreur) {
      console.error(
        'Erreur de chargement des soutenances :',
        erreur
      );

      if (actif) {
        setErreur(
          erreur.message || 'Impossible de charger les soutenances.'
        );
      }
    } finally {
      if (actif) {
        setChargement(false);
      }
    }
  }

  chargerSoutenances();

  return () => {
    actif = false;
  };
}, []);


  const soutenancesFiltrees = useMemo(() => {
    let resultat = [...soutenances]

    if (recherche.trim()) {
      const terme = recherche.toLowerCase().trim()
      resultat = resultat.filter(
        (s) =>
          s.sujet.toLowerCase().includes(terme) ||
          s.etudiant.nom.toLowerCase().includes(terme) ||
          s.etudiant.matricule.toLowerCase().includes(terme),
      )
    }

    if (statutFiltre) {
      resultat = resultat.filter((s) => s.statut === statutFiltre)
    }

    resultat.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return tri === 'date_croissant' ? dateA - dateB : dateB - dateA
    })

    return resultat
  }, [soutenances, recherche, statutFiltre, tri])

  const stats = useMemo(
    () => ({
      total: soutenances.length,
      aVenir: soutenances.filter((s) => s.statut === 'A_VENIR').length,
      enCours: soutenances.filter((s) => s.statut === 'EN_COURS').length,
      terminees: soutenances.filter((s) => s.statut === 'TERMINEE').length,
    }),
    [soutenances],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Mes soutenances</h1>
          <p className="text-ink-muted mt-1">Gérez et évaluez vos soutenances assignées</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Bouton variante="primaire" className="w-auto">
            <Download size={16} className="mr-1" />
            Exporter
          </Bouton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, classe: 'bg-navy-100 text-navy-700', icone: FileText },
          { label: 'À venir', value: stats.aVenir, classe: 'bg-sky-100 text-sky-700', icone: Clock },
          { label: 'En cours', value: stats.enCours, classe: 'bg-amber-100 text-amber-700', icone: AlertCircle },
          { label: 'Terminées', value: stats.terminees, classe: 'bg-emerald-100 text-emerald-700', icone: CheckCircle },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">{stat.label}</p>
                <p className="font-display text-2xl font-bold text-navy-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.classe}`}>
                <stat.icone size={20} aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="recherche-soutenances" className="sr-only">
              Rechercher une soutenance
            </label>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              id="recherche-soutenances"
              type="search"
              placeholder="Rechercher par sujet, étudiant, matricule…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-paper-tint focus:border-navy-400 focus:bg-white focus:outline-none text-sm"
            />
          </div>
          <ChampTexte
            label="Statut"
            name="statut"
            value={statutFiltre}
            onChange={(e) => setStatutFiltre(e.target.value)}
            options={STATUTS}
            className="w-full sm:w-48"
          />
          <ChampTexte
            label="Tri"
            name="tri"
            value={tri}
            onChange={(e) => setTri(e.target.value)}
            options={[
              { value: 'date_croissant', label: 'Date ↑' },
              { value: 'date_decroissant', label: 'Date ↓' },
            ]}
            className="w-full sm:w-40"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        {chargement ? (
          <p className="p-12 text-center text-ink-muted">Chargement des soutenances…</p>
        ) : soutenancesFiltrees.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-line mb-4" aria-hidden="true" />
            <h3 className="font-display font-semibold text-navy-900 mb-2">Aucune soutenance trouvée</h3>
            <p className="text-ink-muted">
              {recherche || statutFiltre
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Aucune soutenance n\'est assignée pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line p-4">
            {soutenancesFiltrees.map((soutenance) => (
              <SoutenanceCard
                key={soutenance.id}
                soutenance={soutenance}
                onValider={() => navigate(`/evaluateur/rapports?soutenance=${soutenance.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
