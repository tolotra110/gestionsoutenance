import { CheckCircle2, CircleAlert, FileUp, Paperclip } from 'lucide-react'
import Bouton from '../ui/Bouton'
import { rappelDocuments } from '../../constants/etudiant'
import { formaterDateHeure } from '../../utils/format'

export default function BlocDocuments({ documents, onDeposer, enCours }) {
  const resume = rappelDocuments(documents)

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-semibold text-navy-900">Mes pièces justificatives</h2>
        <span className="text-sm text-ink-muted">
          {resume.deposes}/{resume.total} déposées
        </span>
      </div>

      {resume.manquants.length > 0 && (
        <p className="mt-3 flex items-center gap-2 text-sm text-amber-700">
          <CircleAlert size={16} aria-hidden="true" />
          {resume.manquants.length} pièce(s) obligatoire(s) encore manquante(s).
        </p>
      )}

      <ul className="mt-4 divide-y divide-line-soft">
        {documents.map((document) => (
          <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={`h-9 w-9 flex-none rounded-lg flex items-center justify-center ${
                  document.depose ? 'bg-success-soft text-success' : 'bg-paper-tint text-ink-muted'
                }`}
              >
                {document.depose ? <CheckCircle2 size={18} aria-hidden="true" /> : <Paperclip size={18} aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-navy-900">
                  {document.libelle}
                  {document.obligatoire && <span className="ml-1 text-danger">*</span>}
                </p>
                <p className="text-xs text-ink-muted">
                  {document.depose ? `Déposé le ${formaterDateHeure(document.depose_le)}` : document.precision}
                </p>
              </div>
            </div>

            <Bouton
              variante="secondaire"
              taille="sm"
              onClick={() => onDeposer(document.id)}
              disabled={document.depose || enCours}
            >
              <FileUp size={14} className="mr-1" />
              {document.depose ? 'Déjà déposé' : 'Déposer'}
            </Bouton>
          </li>
        ))}
      </ul>
    </div>
  )
}