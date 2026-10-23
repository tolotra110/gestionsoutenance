import EspaceMention from './mention/EspaceMention'

// Ouverte par le login existant (pages/auth/LoginForm.jsx) pour la mention Management
export default function Management() {
  return <EspaceMention parcours="MANAGEMENT" nomMention="Management" />
}
