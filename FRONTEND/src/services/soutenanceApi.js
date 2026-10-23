
/**
 * Accès aux soutenances de l'espace évaluateur.
 */
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/soutenances`;

function obtenirToken() {
  const token = localStorage.getItem('emit_token');

  if (!token) {
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  return token;
}

async function requeteAPI(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${obtenirToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const erreur = await response.json().catch(() => ({}));

    throw new Error(
      erreur.message || `Erreur HTTP ${response.status}`
    );
  }

  return response.json();
}

/**
 * Convertit les statuts du backend en statuts du frontend.
 */
function convertirStatut(statut) {
  const correspondances = {
    planifiee: 'A_VENIR',
    planifiée: 'A_VENIR',
    a_venir: 'A_VENIR',
    en_cours: 'EN_COURS',
    terminee: 'TERMINEE',
    terminée: 'TERMINEE',
    annulee: 'ANNULEE',
    annulée: 'ANNULEE',
  };

  return correspondances[
    String(statut || '').toLowerCase()
  ] || 'A_VENIR';
}

/**
 * Convertit une soutenance de l'API au format utilisé par React.
 */
function adapterSoutenance(s) {
  const debut = String(s.heure_debut || '').slice(0, 5);
  const fin = String(s.heure_fin || '').slice(0, 5);

  const [heureDebut, minuteDebut] = debut.split(':').map(Number);
  const [heureFin, minuteFin] = fin.split(':').map(Number);

  let duree =
    (heureFin * 60 + minuteFin) -
    (heureDebut * 60 + minuteDebut);

  if (duree < 0) duree += 24 * 60;

  return {
    id: s.id_soutenance,
    // Thème de la soutenance, sinon thème déposé par l'étudiant (mobile / import)
    sujet: String(s.theme || s.theme_etudiant || '').trim() || 'Thème non déposé',
    statut: convertirStatut(s.statut),
    // Combine date + heure de début pour que formaterDateCourte
    // et formaterHeure affichent le bon créneau.
    date: `${s.date_soutenance}T${debut}:00`,
    heure_debut: debut,
    duree,

    etudiant: {
      nom: [s.etudiant_prenom, s.etudiant_nom]
        .filter(Boolean)
        .join(' ') || 'Étudiant non renseigné',
      matricule: s.matricule || 'Non renseigné',
    },

    salle: {
      nom: s.nom_salle || 'Salle non renseignée',
      batiment: s.localisation || '',
    },

    parcours: s.parcours || 'Non renseigné',

    encadrant: [
      s.evaluateur_prenom,
      s.evaluateur_nom,
    ]
      .filter(Boolean)
      .join(' ') || 'Non renseigné',

    jury: Array.isArray(s.jury) ? s.jury : [],
  };
}

/** Liste les soutenances de l'évaluateur connecté. */
export async function listerSoutenances() {
  const donnees = await requeteAPI(
    `${API_URL}/evaluateur/soutenances`
  );

  return donnees.map(adapterSoutenance);
}

/** Recherche une soutenance dans la liste de l'évaluateur connecté. */
export async function obtenirSoutenance(soutenanceId) {
  const soutenances = await listerSoutenances();

  return (
    soutenances.find(
      (s) => Number(s.id) === Number(soutenanceId)
    ) ?? null
  );
}
