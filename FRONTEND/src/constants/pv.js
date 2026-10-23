// Procès-verbal de soutenance : textes et mise en forme (partagés par l'aperçu écran et le PDF).
import { mentionPour } from './rapports'

/**
 * Texte « MENTION : … / PARCOURS : … » du PV selon la mention de l'étudiant
 * (code_mention en base : INFO | MNGT | COMM).
 * ➜ Modifiez ici les libellés si le parcours officiel est différent
 *   (ex. un parcours autre que DA2I pour la mention Informatique).
 */
export const PARCOURS_PV = {
  INFO: { mention: 'INFORMATIQUE', parcours: 'DA2I' },
  MNGT: { mention: 'MANAGEMENT', parcours: 'MANAGEMENT' },
  COMM: { mention: 'COMMUNICATION', parcours: 'ICM' },
}

/** Libellés du PV pour un résultat (repli sur le nom de la mention si le code est inconnu). */
export function libellesParcours(r) {
  const code = String(r.parcours ?? '').trim().toUpperCase()
  const connu = PARCOURS_PV[code]
  if (connu) return connu
  const nom = String(r.nom_mention ?? code ?? '').toUpperCase()
  return { mention: nom, parcours: nom }
}

/** « 2025-2026 » à partir de la date de soutenance (l'année universitaire se termine en octobre). */
export function anneeUniversitaire(dateIso) {
  const d = dateIso ? new Date(`${dateIso}T00:00:00`) : new Date()
  const annee = d.getFullYear()
  return d.getMonth() >= 10 ? `${annee}-${annee + 1}` : `${annee - 1}-${annee}`
}

/** 2026-10-13 -> 13/10/2026 */
export function dateFr(iso) {
  if (!iso) return ''
  const [a, m, j] = String(iso).slice(0, 10).split('-')
  return a && m && j ? `${j}/${m}/${a}` : ''
}

const nomComplet = (nom, prenom) =>
  `${String(nom ?? '').trim().toUpperCase()} ${String(prenom ?? '').trim()}`.trim()

/**
 * Données prêtes à imprimer pour un résultat de l'API /api/resultats/pv.
 * ajust = { lieuNaissance, annee } (valeurs saisies à la main, facultatives).
 */
export function construirePv(r, ajust = {}) {
  const note = Number(r.note)
  const admis = r.decision ? r.decision === 'ADMIS' : note >= 10
  const mentionObtenue = String(r.mention || mentionPour(note)?.label || '').toUpperCase()
  const { mention, parcours } = libellesParcours(r)

  return {
    id_etudiant: r.id_etudiant,
    matricule: r.matricule,
    mention,
    parcours,
    annee: (ajust.annee || '').trim() || anneeUniversitaire(r.date_soutenance),
    nom: String(r.etudiant_nom ?? '').trim().toUpperCase(),
    prenom: String(r.etudiant_prenom ?? '').trim(),
    nomComplet: nomComplet(r.etudiant_nom, r.etudiant_prenom),
    dateNaissance: dateFr(r.date_naissance),
    lieuNaissance: (ajust.lieuNaissance ?? r.lieu_naissance ?? '').trim(),
    theme: String(r.theme ?? '').trim(),
    lieuStage: String(r.lieu_stage ?? '').trim(),
    dateSoutenance: dateFr(r.date_soutenance),
    admis,
    mentionObtenue,
    note: `${note.toFixed(2).replace('.', ',')}/20`,
    evaluateur: nomComplet(r.evaluateur_nom, r.evaluateur_prenom),
  }
}

const POINTILLES = '..........'

/** Paragraphes du PV : { segs: [{ t, b?, u? }], apres } (apres = espace en mm sous le paragraphe). */
export function paragraphesPv(pv) {
  const p = [
    { segs: [{ t: "Nom de l'impétrant(e) : " }, { t: pv.nomComplet, b: true }], apres: 2 },
    {
      segs: [
        { t: 'Né(e) le : ' },
        { t: pv.dateNaissance || POINTILLES, b: true },
        { t: ' à ' },
        { t: pv.lieuNaissance || POINTILLES, b: true },
      ],
      apres: 2,
    },
    {
      segs: [
        { t: "A soutenu publiquement son mémoire pour l'obtention du diplôme de Licence en " },
        { t: pv.mention.toLowerCase(), b: true },
        { t: ' , parcours ' },
        { t: pv.parcours, b: true },
        { t: " à l'École de Management et d'Innovation Technologique (EMIT) de l'Université de Fianarantsoa." },
      ],
      apres: 1,
    },
    { segs: [{ t: 'Intitulé du mémoire :', u: true }, { t: ' ' }, { t: pv.theme || POINTILLES, b: true }], apres: 6 },
    { segs: [{ t: 'Lieu de stage :', u: true }, { t: ' ' }, { t: pv.lieuStage || POINTILLES, b: true }], apres: 6 },
    { segs: [{ t: 'Date de soutenance :', u: true }, { t: ' ' }, { t: pv.dateSoutenance, b: true }], apres: 12 },
  ]

  if (pv.admis) {
    p.push({
      segs: [{ t: "Un exemplaire corrigé, plus un CD contenant la version numérique du mémoire devront être déposés à l'EMIT." }],
      apres: 8,
    })
    p.push({
      segs: [
        { t: "Après délibération, le Jury a déclaré l'admission du candidat(e) et lui a décerné la mention " },
        { t: pv.mentionObtenue, b: true },
        { t: ' avec une note égale à : ' },
        { t: pv.note, b: true },
      ],
      apres: 10,
    })
  } else {
    p.push({
      segs: [
        { t: "Après délibération, le Jury a déclaré l'ajournement du candidat(e) avec une note égale à : " },
        { t: pv.note, b: true },
      ],
      apres: 10,
    })
  }

  p.push({ segs: [{ t: 'Les membres du Jury :', u: true }], apres: 6 })
  p.push({ segs: [{ t: "L'Évaluateur : " }, { t: pv.evaluateur, b: true }], apres: 0 })
  return p
}

/** PV_296I24_ANDRIAHASINIAINA_Mirindra.pdf */
export function nomFichierPv(pv) {
  const propre = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '')
  return `PV_${propre(pv.matricule)}_${propre(pv.nom)}_${propre(pv.prenom)}.pdf`
}
