export default function Bouton({ variante = 'primaire', taille, size, className = '', children, ...props }) {
  const variantes = {
    primaire: 'btn-primaire',
    secondaire: 'btn-secondaire',
    discret: 'btn-discret',
  }

  const tailles = {
    sm: 'w-auto px-3 py-2 text-[0.8rem] gap-1.5',
    md: '',
    lg: 'w-auto px-5 py-3.5',
    icone: 'w-auto aspect-square p-2.5',
  }

  // `size` est accepté par compatibilité avec les appelants existants.
  const tailleNormalisee = taille ?? (size === 'icon' ? 'icone' : size) ?? 'md'

  return (
    <button
      type="button"
      className={`btn ${variantes[variante] ?? variantes.primaire} ${tailles[tailleNormalisee] ?? tailles.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
