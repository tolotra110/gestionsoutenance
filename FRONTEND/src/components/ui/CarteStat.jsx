export default function CarteStat({ label, value, classe, icone: Icone }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="font-display text-2xl font-bold text-navy-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${classe}`}>
          <Icone size={20} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}