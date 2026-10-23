// Lancer (depuis BACKEND) : node --test tests/planningGenerator.test.js
const test = require("node:test");
const assert = require("node:assert");
const { genererPlanning, joursOuvres } = require("../services/planningGenerator");

const options = { dateDebut: "2026-10-09", nbJours: 2, heureDebut: "08:00", heureFin: "09:00", dureeMin: 30 };

test("les week-ends sont ignorés", () => {
    assert.deepStrictEqual(joursOuvres("2026-10-09", 2), ["2026-10-09", "2026-10-12"]); // ven -> lun
});

test("aucun chevauchement salle / évaluateur et charge équilibrée", () => {
    const etudiants = Array.from({ length: 6 }, (_, i) => ({ id_etudiant: i + 1 }));
    const salles = [{ id_salle: 1 }, { id_salle: 2 }];
    const evaluateurs = [{ id_evaluateur: 1 }, { id_evaluateur: 2 }, { id_evaluateur: 3 }];
    const { planifiees, restants } = genererPlanning({ etudiants, salles, evaluateurs, options });

    assert.strictEqual(planifiees.length, 6);
    assert.strictEqual(restants.length, 0);

    const cle = (p, k) => `${p.date_soutenance} ${p.heure_debut} ${p[k]}`;
    for (const k of ["id_salle", "id_evaluateur"]) {
        const vus = new Set(planifiees.map((p) => cle(p, k)));
        assert.strictEqual(vus.size, planifiees.length, `conflit sur ${k}`);
    }
});

test("respecte les soutenances existantes et renvoie les étudiants restants", () => {
    const etudiants = Array.from({ length: 10 }, (_, i) => ({ id_etudiant: i + 1 }));
    const existantes = [
        { date_soutenance: "2026-10-09", heure_debut: "08:00", heure_fin: "08:30", id_salle: 1, id_evaluateur: 1 },
    ];
    const { planifiees, restants } = genererPlanning({
        etudiants,
        salles: [{ id_salle: 1 }],
        evaluateurs: [{ id_evaluateur: 1 }],
        existantes,
        options,
    });
    assert.ok(!planifiees.some((p) => p.date_soutenance === "2026-10-09" && p.heure_debut === "08:00"));
    assert.strictEqual(planifiees.length, 3); // 1 créneau libre le 1er jour + 2 le lundi
    assert.strictEqual(restants.length, 7);
});
