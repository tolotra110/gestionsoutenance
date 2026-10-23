import { CircleAlert, CircleCheck, Info } from 'lucide-react'

const ICONES = {
  erreur: CircleAlert,
  succes: CircleCheck,
  info: Info,
  attention: CircleAlert,
}

export default function Alerte({ variante = 'erreur', className = '', children }) {
  if (!children) return null

  const styles = {
    erreur: 'alerte-erreur',
    succes: 'alerte-succes',
    info: 'alerte-info',
    attention: 'alerte-attention',
  }

  const Icone = ICONES[variante] ?? ICONES.erreur

  return (
    <p
      className={`alerte ${styles[variante] ?? styles.erreur} ${className}`}
      role={variante === 'erreur' || variante === 'attention' ? 'alert' : 'status'}
    >
      <Icone size={18} className="mt-0.5 flex-none" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
