import { useEffect } from 'react'

export default function Modal({ titre, onFermer, children, large = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onFermer])

  return (
    <div className="modal__fond" onMouseDown={(e) => e.target === e.currentTarget && onFermer()}>
      <div className={`modal ${large ? 'modal--large' : ''}`} role="dialog" aria-modal="true" aria-label={titre}>
        <div className="modal__tete">
          <h2>{titre}</h2>
          <button type="button" className="modal__fermer" onClick={onFermer} aria-label="Fermer">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
