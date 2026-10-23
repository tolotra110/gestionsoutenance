import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, CircleAlert, FileText, PenLine, RotateCcw, TrendingUp } from 'lucide-react'
import Bouton from '../../components/ui/Bouton'
import Alerte from '../../components/ui/Alerte'
import CarteStat from '../../components/ui/CarteStat'
import {
  ContexteSoutenance,
  FormulaireRapport,
  ListeRapports,
  SelectionVideRapport,
} from '../../components/evaluateur/rapports'
import { enregistrerBrouillonRapport, listerRapports, soumettreRapport, statistiquesRapports } from '../../services/rapportApi'
import { api } from '../../services/api'
import { construirePv } from '../../constants/pv'
import { telechargerPv } from '../../utils/pvPdf'

export default function Rapports() {
  const [searchParams] = useSearchParams()
  // Soutenance demandée depuis « Mes soutenances » (?soutenance=<id>)
  const soutenanceDemandee = searchParams.get('soutenance')

  const [rapports, setRapports] = useState([])
  const [chargement, setChargement] = useState(true)
  const [selectionId, setSelectionId] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [occupation, setOccupation] = useState(null)
  const [message, setMessage] = useState(null)

  function rafraichir(liste) {
    setRapports(liste)
    setSelectionId((precedent) => (precedent && liste.some((rapport) => rapport.id === precedent) ? precedent : null))
  }

  useEffect(() => {
    let actif = true
    listerRapports().then((liste) => {
      if (!actif) return
      setRapports(liste)
      // Pré-sélectionne le rapport de la soutenance demandée,
      // sinon le premier rapport non soumis.
      const demande = soutenanceDemandee
        ? liste.find(
            (rapport) => String(rapport.soutenanceId) === String(soutenanceDemandee)
          )
        : null
      setSelectionId(
        demande?.id ??
          (liste.find((rapport) => rapport.statut !== 'SOUMIS') ?? liste[0])?.id ??
          null
      )
      setChargement(false)
    }).catch((erreur) => {
      if (!actif) return
      setMessage({ variante: 'erreur', texte: erreur.message })
      setChargement(false)
    })
    return () => {
      actif = false
    }
  }, [soutenanceDemandee])

  const stats = useMemo(() => statistiquesRapports(rapports), [rapports])

  const rapportsFiltres = useMemo(() => {
    let resultat = [...rapports]
    if (filtreStatut) resultat = resultat.filter((rapport) => rapport.statut === filtreStatut)
    if (recherche.trim()) {
      const terme = recherche.toLowerCase().trim()
      resultat = resultat.filter(
        (rapport) =>
          rapport.soutenance?.sujet.toLowerCase().includes(terme) ||
          rapport.soutenance?.etudiant.nom.toLowerCase().includes(terme) ||
          rapport.soutenance?.etudiant.matricule.toLowerCase().includes(terme) ||
          rapport.soutenance?.encadrant.toLowerCase().includes(terme),
      )
    }
    return resultat
  }, [rapports, filtreStatut, recherche])

  const selection = rapports.find((rapport) => rapport.id === selectionId) ?? null

  async function handleEnregistrer(contenu) {
    if (!selection) return
    setOccupation('enregistrement')
    setMessage(null)
    try {
      const enregistre = await enregistrerBrouillonRapport(selection.id, contenu)
      rafraichir(await listerRapports())
      setMessage({ variante: 'succes', texte: `Brouillon enregistré pour ${enregistre.soutenance?.etudiant.nom}.` })
    } catch (erreur) {
      setMessage({ variante: 'erreur', texte: erreur.message })
    } finally {
      setOccupation(null)
    }
  }

  async function handlePv() {
    if (!selection) return
    setOccupation('pv')
    setMessage(null)
    try {
      const donnees = await api.get(`/api/rapports/${selection.id}/pv`)
      await telechargerPv(construirePv(donnees))
    } catch (erreur) {
      setMessage({ variante: 'erreur', texte: erreur.message })
    } finally {
      setOccupation(null)
    }
  }

  async function handleSoumettre(contenu) {
    if (!selection) return
    setOccupation('soumission')
    setMessage(null)
    try {
      const soumis = await soumettreRapport(selection.id, contenu)
      rafraichir(await listerRapports())
      setMessage({
        variante: 'succes',
        texte: `Rapport soumis et verrouillé — décision : ${soumis.decision === 'ADMIS' ? 'admis' : 'ajourné'}, note ${
          soumis.note
        }/20${soumis.mention ? ` (${soumis.mention})` : ''}.`,
      })
    } catch (erreur) {
      setMessage({ variante: 'erreur', texte: erreur.message })
    } finally {
      setOccupation(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Rapports de jury</h1>
          <p className="text-ink-muted mt-1">Donnez la note, rédigez et soumettez le rapport de chaque élève ; le PV se télécharge après la soumission</p>
        </div>
        <Bouton variante="secondaire" className="w-auto" onClick={async () => rafraichir(await listerRapports())}>
          <RotateCcw size={16} className="mr-1" />
          Actualiser la liste
        </Bouton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CarteStat label="Rapports" value={stats.total} classe="bg-navy-100 text-navy-700" icone={FileText} />
        <CarteStat label="À rédiger" value={stats.aRediger} classe="bg-sky-100 text-sky-700" icone={PenLine} />
        <CarteStat label="En cours" value={stats.enCours} classe="bg-amber-100 text-amber-700" icone={CircleAlert} />
        <CarteStat label="Soumis" value={stats.soumis} classe="bg-emerald-100 text-emerald-700" icone={CheckCircle2} />
        <CarteStat
          label="Moyenne"
          value={stats.moyenne === null ? '—' : `${stats.moyenne.toFixed(2)}/20`}
          classe="bg-paper-tint text-ink-soft"
          icone={TrendingUp}
        />
      </div>

      {message && <Alerte variante={message.variante}>{message.texte}</Alerte>}

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] items-start">
        <ListeRapports
          rapports={rapportsFiltres}
          chargement={chargement}
          recherche={recherche}
          onRecherche={setRecherche}
          filtreStatut={filtreStatut}
          onFiltre={setFiltreStatut}
          selectionId={selectionId}
          onSelect={(id) => {
            setSelectionId(id)
            setMessage(null)
          }}
        />

        <section className="space-y-6 min-w-0">
          {!selection ? (
            <SelectionVideRapport />
          ) : (
            <>
              <ContexteSoutenance rapport={selection} />
              <FormulaireRapport
                key={`${selection.id}-${selection.maj_le ?? selection.cree_le}`}
                rapport={selection}
                onEnregistrer={handleEnregistrer}
                onSoumettre={handleSoumettre}
                onTelechargerPv={handlePv}
                enCours={occupation !== null}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}