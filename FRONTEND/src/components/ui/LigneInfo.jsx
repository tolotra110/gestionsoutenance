export default function LigneInfo({ icone: Icone, label, valeur, complement }) {
  return (
    <div className="flex items-start gap-3">
      <Icone size={16} className="text-navy-600 flex-none mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
        <p className="text-sm text-navy-900 break-words">{valeur}</p>
        {complement ? <p className="text-xs text-ink-muted break-words">{complement}</p> : null}
      </div>
    </div>
  )
}