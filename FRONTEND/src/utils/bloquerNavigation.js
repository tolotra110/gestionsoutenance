/**
 * Désactive les flèches « précédent / suivant » du navigateur (et Alt+←, Alt+→, boutons latéraux de la souris).
 *
 * Principe : à chaque appui sur précédent/suivant le navigateur émet un évènement « popstate ».
 * On l'intercepte avant React Router (écouteur en phase de capture, installé avant le rendu),
 * puis on remet immédiatement l'adresse courante dans l'historique : la page ne change pas.
 * Les navigations de l'application (menus, boutons, redirections) continuent de fonctionner.
 */
export function bloquerNavigationNavigateur() {
  if (typeof window === 'undefined' || window.__navigationBloquee) return
  window.__navigationBloquee = true

  const historique = window.history
  const pushOrigine = historique.pushState.bind(historique)
  const replaceOrigine = historique.replaceState.bind(historique)

  // Adresse affichée : mise à jour à chaque navigation faite par l'application elle-même
  let adresseCourante = window.location.href

  historique.pushState = (...args) => {
    pushOrigine(...args)
    adresseCourante = window.location.href
  }
  historique.replaceState = (...args) => {
    replaceOrigine(...args)
    adresseCourante = window.location.href
  }

  // Entrée « tampon » : le premier appui sur précédent reste sur la page
  pushOrigine(historique.state, '', adresseCourante)

  window.addEventListener(
    'popstate',
    (evenement) => {
      evenement.stopImmediatePropagation() // React Router ne voit jamais ce changement
      pushOrigine(historique.state, '', adresseCourante) // on revient à la page courante
    },
    true,
  )
}
