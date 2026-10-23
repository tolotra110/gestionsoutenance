import { ClipboardList } from 'lucide-react'

export default function SelectionVide() {
  return (
    <div className="rounded-2xl border border-line bg-white p-12 text-center shadow-sm">
      <ClipboardList size={40} className="mx-auto text-ink-muted mb-4" aria-hidden="true" />
      <h2 className="font-display font-semibold text-navy-900">Sélectionnez un étudiant</h2>
      <p className="text-ink-muted mt-1">Choisissez un étudiant dans la liste pour lire son thème et le valider.</p>
    </div>
  )
}