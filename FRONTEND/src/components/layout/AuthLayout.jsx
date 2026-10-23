import logoEmit from '../../assets/logo-emit.png'
import logoUf from '../../assets/logo-uf.png'

const POINTS = [
  'Planning des soutenances en un seul écran',
  'Salles, jury et thèmes centralisés',
  'Espaces dédiés : Informatique, Management, ICM',
]

export default function AuthLayout({ titre, sousTitre, children }) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden lg:flex lg:flex-col lg:justify-between lg:p-12 relative overflow-hidden bg-linear-to-br from-navy-950 via-navy-900 to-navy-800">
        <div className="grille-techno pointer-events-none absolute inset-0 opacity-70" />
        <div className="halo pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-navy-500/25 blur-3xl" />
        <div className="halo pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative flex items-center justify-between gap-6">
          <img src={logoUf} alt="Université de Fianarantsoa" className="h-12 w-auto opacity-90" />
          <img src={logoEmit} alt="EMIT" className="h-14 w-auto" />
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
            Année universitaire 2025 – 2026
          </span>

          <h1 className="font-display mt-6 text-4xl leading-tight font-bold text-white">
            Planning de soutenance licence
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-sky-100/70">
            EMIT — École de Management et d'Innovation Technologique, Université de Fianarantsoa.
          </p>

          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/75">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-sky-300/80" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/35">
          © {new Date().getFullYear()} EMIT — Université de Fianarantsoa
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-4 lg:hidden">
            <img src={logoUf} alt="Université de Fianarantsoa" className="h-10 w-auto" />
            <span className="h-8 w-px bg-line" />
            <img src={logoEmit} alt="EMIT" className="h-12 w-auto" />
          </div>

          <header className="mb-7">
            <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900">{titre}</h2>
            <p className="mt-2 text-sm text-ink-muted">{sousTitre}</p>
          </header>

          <div className="carte-formulaire">{children}</div>
        </div>
      </section>
    </div>
  )
}