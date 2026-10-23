import { FileText } from 'lucide-react'

export default function SelectionVideRapport() {
  return (
    <div className="rounded-2xl border border-line bg-white p-12 text-center shadow-sm">
      <FileText size={40} className="mx-auto text-ink-muted mb-4" aria-hidden="true" />
      <h2 className="font-display font-semibold text-navy-900">Sélectionnez un rapport</h2>
      <p className="text-ink-muted mt-1">Choisissez une soutenance dans la liste pour rédiger ou consulter son rapport de jury.</p>
    </div>
  )
}