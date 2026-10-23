import { STATUTS_RAPPORT } from '../../../constants/rapports'

export default function BadgeStatutRapport({ statut }) {
  const config = STATUTS_RAPPORT[statut] ?? STATUTS_RAPPORT.A_REDIGER

  return (
    <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${config.classe}`}>
      {config.label}
    </span>
  )
}