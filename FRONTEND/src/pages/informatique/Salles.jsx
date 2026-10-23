import { BadgeCheck, DoorOpen, MapPin, Monitor, Users } from 'lucide-react'
import CrudSection from '../../components/informatique/CrudSection'

const STATUTS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'indisponible', label: 'Indisponible' },
]

const badge = (l) => <span className={`pastille ${l.statut === 'disponible' ? 'pastille--ok' : 'pastille--ko'}`}>{l.statut}</span>

export default function Salles() {
  return (
    <CrudSection
      titre="Salles"
      nomItem="la salle"
      endpoint="/api/salles"
      idKey="id_salle"
      colonnes={[
        { cle: 'nom_salle', label: 'Salle', icone: DoorOpen },
        { cle: 'capacite', label: 'Capacité', icone: Users },
        { cle: 'localisation', label: 'Localisation', icone: MapPin },
        { cle: 'equipement', label: 'Équipement', icone: Monitor },
        { cle: 'statut', label: 'Statut', icone: BadgeCheck, render: badge },
      ]}
      champs={[
        { nom: 'nom_salle', label: 'Nom de la salle', requis: true },
        { nom: 'capacite', label: 'Capacité', type: 'number' },
        { nom: 'localisation', label: 'Localisation', placeholder: 'ex. Bâtiment A, 1er étage' },
        { nom: 'equipement', label: 'Équipement', placeholder: 'ex. Vidéoprojecteur' },
        { nom: 'statut', label: 'Statut', options: STATUTS, defaut: 'disponible' },
      ]}
      aide="Une salle « indisponible » n'est jamais utilisée par la génération automatique ni acceptée pour une soutenance."
    />
  )
}
