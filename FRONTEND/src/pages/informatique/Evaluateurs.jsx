import { BadgeCheck, Briefcase, Clock, Mail, Phone, User } from 'lucide-react'
import CrudSection from '../../components/informatique/CrudSection'

const STATUTS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'indisponible', label: 'Indisponible' },
]

const badge = (l) => <span className={`pastille ${l.statut === 'disponible' ? 'pastille--ok' : 'pastille--ko'}`}>{l.statut}</span>

export default function Evaluateurs() {
  return (
    <CrudSection
      titre="Évaluateurs"
      nomItem="l'évaluateur"
      endpoint="/api/evaluateurs"
      idKey="id_evaluateur"
      colonnes={[
        { cle: 'nom', label: 'Nom', icone: User, render: (l) => `${l.nom} ${l.prenom}` },
        { cle: 'specialite', label: 'Spécialité', icone: Briefcase },
        { cle: 'email', label: 'Email', icone: Mail },
        { cle: 'telephone', label: 'Téléphone', icone: Phone },
        { cle: 'disponibilite', label: 'Disponibilité', icone: Clock },
        { cle: 'statut', label: 'Statut', icone: BadgeCheck, render: badge },
      ]}
      champs={[
        { nom: 'nom', label: 'Nom', requis: true },
        { nom: 'prenom', label: 'Prénom(s)', requis: true },
        { nom: 'specialite', label: 'Spécialité', placeholder: 'ex. Génie logiciel' },
        { nom: 'email', label: 'Email', type: 'email' },
        { nom: 'telephone', label: 'Téléphone' },
        { nom: 'disponibilite', label: 'Disponibilité (note)', placeholder: 'ex. lundi au jeudi' },
        { nom: 'statut', label: 'Statut', options: STATUTS, defaut: 'disponible' },
      ]}
      aide="Seul le statut « indisponible » exclut un évaluateur du planning ; la note de disponibilité sert de rappel."
    />
  )
}
