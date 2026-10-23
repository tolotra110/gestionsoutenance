import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CircleAlert, Clock, MessageSquare, RotateCcw, Users } from 'lucide-react'
import Bouton from '../../components/ui/Bouton'
import Alerte from '../../components/ui/Alerte'
import {
  CarteStat,
  DetailTheme,
  FormulaireDecision,
  ListeThemes,
  SelectionVide,
} from '../../components/evaluateur/themes'
import { DECISIONS } from '../../constants/themes'
import { listerThemes, statistiquesThemes } from '../../services/evaluateurThemesApi'

export default function ThemesAValider() {
  const [themes, setThemes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [selectionId, setSelectionId] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [message, setMessage] = useState(null)

  async function charger() {
    try {
      const liste = await listerThemes()
      setThemes(liste)
      setErreur(null)
      setSelectionId((precedent) => (liste.some((theme) => theme.id === precedent) ? precedent : null))
    } catch (e) {
      setErreur(e.message)
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    charger()
  }, [])

  const stats = useMemo(() => statistiquesThemes(themes), [themes])

  // Compteurs des filtres de statut, selon le parcours choisi
  const comptes = useMemo(() => {
    const resultat = { '': themes.length }
    themes.forEach((theme) => {
      resultat[theme.statut] = (resultat[theme.statut] ?? 0) + 1
    })
    return resultat
  }, [themes])

  const themesFiltres = useMemo(() => {
    const terme = recherche.toLowerCase().trim()
    return themes.filter(
      (theme) =>
        (!filtreStatut || theme.statut === filtreStatut) &&
        (!terme ||
          theme.titre.toLowerCase().includes(terme) ||
          theme.etudiant.nom.toLowerCase().includes(terme) ||
          theme.etudiant.matricule.toLowerCase().includes(terme)),
    )
  }, [themes, filtreStatut, recherche])

  const selection = themes.find((theme) => theme.id === selectionId) ?? null

  async function apresDecision(theme, decision) {
    await charger()
    setFormulaireOuvert(false)
    setMessage({
      variante: decision === 'VALIDE' ? 'succes' : 'info',
      texte: `Thème de ${theme.etudiant.nom} — ${DECISIONS[decision].label.toLowerCase()}.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Thèmes à valider</h1>
          <p className="text-ink-muted mt-1">
            Étudiants de votre parcours : examinez leur thème et prononcez votre décision
          </p>
        </div>
        <Bouton variante="secondaire" className="w-auto" onClick={charger}>
          <RotateCcw size={16} className="mr-1" />
          Actualiser la liste
        </Bouton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CarteStat label="Étudiants" value={stats.total} classe="bg-slate-100 text-slate-700" icone={Users} />
        <CarteStat label="À valider" value={stats.enAttente} classe="bg-sky-100 text-sky-700" icone={Clock} />
        <CarteStat label="Validés" value={stats.valides} classe="bg-emerald-100 text-emerald-700" icone={CheckCircle2} />
        <CarteStat
          label="Modifications demandées"
          value={stats.modifications}
          classe="bg-amber-100 text-amber-700"
          icone={MessageSquare}
        />
        <CarteStat label="Rejetés" value={stats.rejetes} classe="bg-red-100 text-red-700" icone={CircleAlert} />
      </div>

      {erreur && <Alerte variante="erreur">{erreur}</Alerte>}
      {message && <Alerte variante={message.variante}>{message.texte}</Alerte>}

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] items-start">
        <ListeThemes
          themes={themesFiltres}
          chargement={chargement}
          recherche={recherche}
          onRecherche={setRecherche}
          filtreStatut={filtreStatut}
          onFiltre={setFiltreStatut}
          comptes={comptes}
          selectionId={selectionId}
          onSelect={(id) => {
            setSelectionId(id)
            setFormulaireOuvert(false)
          }}
        />

        <section className="space-y-6 min-w-0">
          {!selection ? (
            <SelectionVide />
          ) : (
            <>
              <DetailTheme
                theme={selection}
                formulaireOuvert={formulaireOuvert}
                onBasculerFormulaire={() => setFormulaireOuvert((ouvert) => !ouvert)}
              />

              {formulaireOuvert && (
                <FormulaireDecision
                  key={`${selection.id}-${selection.dateDecision ?? 'nouveau'}`}
                  theme={selection}
                  onDecision={(decision) => apresDecision(selection, decision)}
                  onClose={() => setFormulaireOuvert(false)}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
