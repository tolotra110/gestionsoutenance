export function creerValidateur(regles) {
  return function valider(valeurs) {
    const erreurs = {}
    for (const [champ, regle] of Object.entries(regles)) {
      const valeur = valeurs[champ]
      if (regle.requis && (!valeur || !valeur.toString().trim())) {
        erreurs[champ] = regle.message || `${champ} est obligatoire.`
        continue
      }
      if (valeur && regle.minLongueur && valeur.toString().trim().length < regle.minLongueur) {
        erreurs[champ] = regle.message || `Minimum ${regle.minLongueur} caractères.`
        continue
      }
      if (valeur && regle.motif && !regle.motif.test(valeur.toString().trim())) {
        erreurs[champ] = regle.message || `Format invalide.`
        continue
      }
      if (valeur && regle.personnalisee && !regle.personnalisee(valeur, valeurs)) {
        erreurs[champ] = regle.message || `Invalide.`
      }
    }
    return erreurs
  }
}

export const reglesEvaluateur = {
  nom: { requis: true, message: 'Le nom complet est obligatoire.' },
  email: {
    requis: true,
    motif: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Format d'email invalide.",
  },
  mot_de_passe: {
    requis: true,
    minLongueur: 6,
    message: '6 caractères minimum.',
  },
  parcours: { requis: true, message: 'Choisissez un parcours.' },
}