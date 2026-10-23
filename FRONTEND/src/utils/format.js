const formatDate = (dateStr, options = {}) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  })

export function formaterDate(dateStr) {
  return formatDate(dateStr)
}

/** Format compact pour les listes : « 20 janvier ». */
export function formaterDateCourte(dateStr) {
  return formatDate(dateStr, { weekday: undefined, year: undefined })
}

export function formaterHeure(dateStr) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function formaterDateHeure(dateStr) {
  if (!dateStr) return '—'
  return `${formatDate(dateStr, { weekday: undefined })} à ${formaterHeure(dateStr)}`
}