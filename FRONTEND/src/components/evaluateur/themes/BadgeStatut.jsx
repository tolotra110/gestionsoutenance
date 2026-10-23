import { STATUT_CONFIG } from '../../../constants/themes'

export default function BadgeStatut({ statut }) {
  const config = STATUT_CONFIG[statut] ?? STATUT_CONFIG.EN_ATTENTE

  return (
    <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${config.classe}`}>
      {config.label}
    </span>
  )
}