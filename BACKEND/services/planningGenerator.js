// Génération automatique du planning (fonction pure, testable sans base de données).
// Contraintes respectées : une salle / un évaluateur ne peut avoir qu'une soutenance
// à la fois, répartition équilibrée de la charge entre évaluateurs, week-ends exclus.

const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

const toHHMM = (min) =>
    `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// nbJours jours OUVRÉS (lun-ven) à partir de dateDebut (YYYY-MM-DD)
const joursOuvres = (dateDebut, nbJours) => {
    const jours = [];
    const d = new Date(`${dateDebut}T00:00:00Z`);
    while (jours.length < nbJours) {
        const dow = d.getUTCDay();
        if (dow !== 0 && dow !== 6) jours.push(d.toISOString().slice(0, 10));
        d.setUTCDate(d.getUTCDate() + 1);
    }
    return jours;
};

/**
 * @param etudiants   [{ id_etudiant }]            à planifier (dans l'ordre voulu)
 * @param salles      [{ id_salle }]               salles disponibles
 * @param evaluateurs [{ id_evaluateur }]          évaluateurs disponibles
 * @param existantes  [{ date_soutenance, heure_debut, heure_fin, id_salle, id_evaluateur }]  déjà planifiées
 * @param options     { dateDebut, nbJours, heureDebut, heureFin, dureeMin }
 * @returns { planifiees: [...], restants: [...] }
 */
const genererPlanning = ({ etudiants, salles, evaluateurs, existantes = [], options }) => {
    const { dateDebut, nbJours, heureDebut, heureFin, dureeMin } = options;
    const debutJour = toMin(heureDebut);
    const finJour = toMin(heureFin);

    const occupe = existantes.map((s) => ({
        date: s.date_soutenance,
        debut: toMin(s.heure_debut),
        fin: toMin(s.heure_fin),
        id_salle: s.id_salle,
        id_evaluateur: s.id_evaluateur,
    }));

    const charge = new Map(evaluateurs.map((e) => [e.id_evaluateur, 0]));
    existantes.forEach((s) => {
        if (charge.has(s.id_evaluateur)) charge.set(s.id_evaluateur, charge.get(s.id_evaluateur) + 1);
    });

    const chevauche = (o, date, t) => o.date === date && o.debut < t + dureeMin && o.fin > t;

    const planifiees = [];
    let i = 0;

    for (const date of joursOuvres(dateDebut, nbJours)) {
        for (let t = debutJour; t + dureeMin <= finJour && i < etudiants.length; t += dureeMin) {
            const sallesLibres = salles.filter(
                (s) => !occupe.some((o) => o.id_salle === s.id_salle && chevauche(o, date, t))
            );
            const evalLibres = evaluateurs
                .filter((e) => !occupe.some((o) => o.id_evaluateur === e.id_evaluateur && chevauche(o, date, t)))
                .sort((a, b) => charge.get(a.id_evaluateur) - charge.get(b.id_evaluateur));

            const n = Math.min(sallesLibres.length, evalLibres.length, etudiants.length - i);
            for (let k = 0; k < n; k++) {
                const salle = sallesLibres[k];
                const evaluateur = evalLibres[k];
                const slot = {
                    id_etudiant: etudiants[i].id_etudiant,
                    id_salle: salle.id_salle,
                    id_evaluateur: evaluateur.id_evaluateur,
                    date_soutenance: date,
                    heure_debut: toHHMM(t),
                    heure_fin: toHHMM(t + dureeMin),
                };
                planifiees.push(slot);
                occupe.push({
                    date,
                    debut: t,
                    fin: t + dureeMin,
                    id_salle: salle.id_salle,
                    id_evaluateur: evaluateur.id_evaluateur,
                });
                charge.set(evaluateur.id_evaluateur, charge.get(evaluateur.id_evaluateur) + 1);
                i++;
            }
        }
    }

    return { planifiees, restants: etudiants.slice(i) };
};

module.exports = { genererPlanning, joursOuvres, toMin, toHHMM };
