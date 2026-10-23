import { useEffect, useMemo, useState } from 'react'
import { BookOpenCheck, CircleAlert, FileText, RefreshCw } from 'lucide-react'
import Bouton from '../../components/ui/Bouton'
import Alerte from '../../components/ui/Alerte'
import CarteStat from '../../components/ui/CarteStat'
import HistoriqueTheme from '../../components/ui/HistoriqueTheme'
import {
  BlocDocuments,
  BlocSoutenance,
  BlocTheme,
  EtapesWorkflow,
  FormulaireTheme,
} from '../../components/etudiant'
import { etapeCourante, rappelDocuments } from '../../constants/etudiant'
import { formaterDateHeure } from '../../utils/format'
import { deposerDocument, enregistrerThemeEtudiant, obtenirEspaceEtudiant } from '../../services/etudiantApi'

export default function EspaceEtudiant() {
  const [espace, setEspace] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [occupation, setOccupation] = useState(null)
  const [message, setMessage] = useState(null)

  async function charger() {
    const donnees = await obtenirEspaceEtudiant()
    setEspace(donnees)
    setChargement(false)
  }

  useEffect(() => {
    charger()
  }, [])

  const stats = useMemo(() => {
    if (!espace) return { themes: 0, documents: 0, piecesRestantes: 0 }

    return {
      themes: espace.aUnTheme ? 1 : 0,
      documents: rappelDocuments(espace.documents).deposes,
      piecesRestantes: rappelDocuments(espace.documents).manquants.length,
    }
  }, [espace])

  const etape = useMemo(
    () => etapeCourante(espace?.theme, espace?.soutenance),
    [espace],
  )

  async function handleSoumettreTheme(contenu) {
    setOccupation('theme')
    setMessage(null)
    try {
      const theme = await enregistrerThemeEtudiant(espace.etudiant.id_theme, contenu)
      await charger()
      setFormulaireOuvert(false)
      setMessage({
        variante: 'succes',
        texte: `Thème « ${theme.titre} » envoyé pour validation. L'évaluateur est notifié.`,
      })
    } finally {
      setOccupation(null)
    }
  }

  async function handleDeposer(documentId) {
    setOccupation(`document-${documentId}`)
    setMessage(null)
    try {
      await deposerDocument(documentId)
      await charger()
      setMessage({ variante: 'succes', texte: 'Pièce ajoutée à votre dossier.' })
    } finally {
      setOccupation(null)
    }
  }

  if (chargement) {
    return <div className="py-16 text-center text-ink-muted">Chargement de votre espace…</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Bonjour {espace.etudiant.nom}
          </h1>
          <p className="text-ink-muted mt-1">
            {espace.etudiant.niveau} · {espace.etudiant.parcours} · {espace.etudiant.matricule} · promo{' '}
            {espace.etudiant.promo}
          </p>
        </div>
        <Bouton variante="secondaire" className="w-auto" onClick={charger}>
          <RefreshCw size={16} className="mr-1" />
          Actualiser
        </Bouton>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <CarteStat label="Thème déposé" value={stats.themes ? 'Oui' : 'Non'} classe="bg-navy-100 text-navy-700" icone={BookOpenCheck} />
        <CarteStat label="Pièces déposées" value={stats.documents} classe="bg-emerald-100 text-emerald-700" icone={FileText} />
        <CarteStat
          label="Pièces manquantes"
          value={stats.piecesRestantes}
          classe={stats.piecesRestantes > 0 ? 'bg-amber-100 text-amber-700' : 'bg-paper-tint text-ink-soft'}
          icone={CircleAlert}
        />
      </div>

      {message && <Alerte variante={message.variante}>{message.texte}</Alerte>}

      <EtapesWorkflow index={etape.index} etat={etape.etat} libelle={etape.libelle} />

      <BlocTheme
        theme={espace.theme}
        onBasculerFormulaire={() => setFormulaireOuvert((ouvert) => !ouvert)}
        peutModifier
      />

      {formulaireOuvert && (
        <FormulaireTheme
          key={espace.theme?.date_depot ?? 'nouveau'}
          theme={espace.theme}
          enCours={occupation === 'theme'}
          onSoumettre={handleSoumettreTheme}
          onAnnuler={() => setFormulaireOuvert(false)}
        />
      )}

      <BlocSoutenance soutenance={espace.soutenance} />

      <BlocDocuments
        documents={espace.documents}
        onDeposer={handleDeposer}
        enCours={occupation !== null && occupation !== 'theme'}
      />

      {espace.theme && (
        <HistoriqueTheme
          theme={espace.theme}
        />
      )}

      {espace.soutenance && (
        <p className="text-xs text-ink-muted text-center">
          Soutenance programmée le {formaterDateHeure(espace.soutenance.date)} en {espace.soutenance.salle.nom}.
        </p>
      )}
    </div>
  )
}