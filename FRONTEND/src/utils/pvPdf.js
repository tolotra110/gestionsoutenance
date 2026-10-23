// Génération du PDF du procès-verbal de soutenance avec jsPDF (chargé à la demande).
// Mise en page calquée sur le PV officiel de l'EMIT (A4 portrait, cadre, en-tête avec les deux logos).
import { paragraphesPv, nomFichierPv } from '../constants/pv'

const MARGE = 10 // cadre
const X_TEXTE = 22
const LARGEUR_TEXTE = 166
const TAILLE = 11.5
const INTERLIGNE = 7.2

/** Écrit un paragraphe (segments gras / soulignés) avec retour à la ligne. Renvoie le y suivant. */
function ecrireRiche(doc, segs, x, y, largeur) {
  const jetons = []
  for (const s of segs) {
    for (const mot of s.t.match(/\S+|\s+/g) ?? []) {
      doc.setFont('times', s.b ? 'bold' : 'normal')
      jetons.push({ txt: mot, b: !!s.b, u: !!s.u, w: doc.getTextWidth(mot), espace: /^\s+$/.test(mot) })
    }
  }

  const lignes = []
  let courante = []
  let wCourante = 0
  for (const j of jetons) {
    if (j.espace && courante.length === 0) continue
    if (!j.espace && wCourante + j.w > largeur && courante.length > 0) {
      while (courante.length && courante[courante.length - 1].espace) courante.pop()
      lignes.push(courante)
      courante = []
      wCourante = 0
    }
    courante.push(j)
    wCourante += j.w
  }
  while (courante.length && courante[courante.length - 1].espace) courante.pop()
  if (courante.length) lignes.push(courante)

  doc.setLineWidth(0.25)
  for (const ligne of lignes) {
    let cx = x
    for (const j of ligne) {
      doc.setFont('times', j.b ? 'bold' : 'normal')
      if (!j.espace) doc.text(j.txt, cx, y)
      if (j.u) doc.line(cx, y + 0.9, cx + j.w, y + 0.9)
      cx += j.w
    }
    y += INTERLIGNE
  }
  return y
}

function centre(doc, txt, y, { taille, gras = false, souligne = false }) {
  doc.setFont('times', gras ? 'bold' : 'normal')
  doc.setFontSize(taille)
  doc.text(txt, 105, y, { align: 'center' })
  if (souligne) {
    const w = doc.getTextWidth(txt)
    doc.setLineWidth(0.4)
    doc.line(105 - w / 2, y + 1.4, 105 + w / 2, y + 1.4)
  }
}

/** Dessine une page de PV sur le document jsPDF (logos = { uf, emit } chargés par chargerLogos). */
export function dessinerPv(doc, pv, logos = {}) {
  doc.setDrawColor(0)
  doc.setTextColor(0)

  // cadre de la page + filet sous l'en-tête
  doc.setLineWidth(0.6)
  doc.rect(MARGE, MARGE, 190, 277)
  doc.line(MARGE, 45, MARGE + 190, 45)

  // logos (hauteur fixe, largeur selon les proportions de l'image)
  const poser = (logo, xGauche, hauteur, yHaut, aDroite = false) => {
    if (!logo) return
    const w = (logo.w / logo.h) * hauteur
    doc.addImage(logo.dataUrl, logo.format, aDroite ? xGauche - w : xGauche, yHaut, w, hauteur)
  }
  poser(logos.uf, MARGE + 5, 26, 14)
  poser(logos.emit, MARGE + 190 - 5, 15, 20, true)

  // en-tête texte
  centre(doc, 'UNIVERSITE DE FIANARANTSOA', 18, { taille: 9 })
  centre(doc, "ECOLE DE MANAGEMENT ET D'INNOVATION TECHNOLOGIQUE", 22.5, { taille: 9 })
  centre(doc, 'E.M.I.T.', 27, { taille: 9 })
  centre(doc, 'TEL: 034.87.042.16 - 033.70.470.00- BP : 1135', 32, { taille: 7.5 })
  centre(doc, 'e.mail : renseignement@emit.mg', 36, { taille: 7.5 })
  centre(doc, 'site web : www.emit.mg', 40, { taille: 7.5 })

  // titre + intitulé du diplôme (texte variable selon la mention / le parcours)
  centre(doc, 'PROCES VERBAL DE SOUTENANCE', 62, { taille: 14, gras: true, souligne: true })
  centre(doc, "SOUTENANCE DE MEMOIRE EN VUE DE L'OBTENTION DU DIPLOME DE LICENCE", 74, { taille: 9.5, gras: true })
  centre(doc, `MENTION : ${pv.mention}`, 80, { taille: 9.5, gras: true })
  centre(doc, `PARCOURS : ${pv.parcours}`, 86, { taille: 9.5, gras: true })
  centre(doc, `ANNÉE UNIVERSITAIRE : ${pv.annee}`, 92, { taille: 9.5, gras: true })

  // corps
  doc.setFontSize(TAILLE)
  let y = 110
  for (const para of paragraphesPv(pv)) {
    doc.setFontSize(TAILLE)
    y = ecrireRiche(doc, para.segs, X_TEXTE, y, LARGEUR_TEXTE) + para.apres
  }
}

// ---------- chargement des logos (PNG du dossier assets) ----------

async function chargerImage(url) {
  const blob = await (await fetch(url)).blob()
  const dataUrl = await new Promise((resolve, reject) => {
    const lecteur = new FileReader()
    lecteur.onload = () => resolve(lecteur.result)
    lecteur.onerror = reject
    lecteur.readAsDataURL(blob)
  })
  const dims = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = reject
    img.src = dataUrl
  })
  const format = /jpe?g/i.test(blob.type) ? 'JPEG' : 'PNG'
  return { dataUrl, format, ...dims }
}

let logosEnCache = null
async function chargerLogos() {
  if (logosEnCache) return logosEnCache
  try {
    const [uf, emit] = await Promise.all([
      import('../assets/logo-uf.png').then((m) => chargerImage(m.default)),
      import('../assets/logo-emit.png').then((m) => chargerImage(m.default)),
    ])
    logosEnCache = { uf, emit }
  } catch {
    logosEnCache = {} // le PV reste généré, sans logos
  }
  return logosEnCache
}

async function nouveauDocument() {
  const { jsPDF } = await import('jspdf')
  return new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
}

/** Télécharge le PV d'un étudiant (PV_matricule_NOM_Prenom.pdf). */
export async function telechargerPv(pv) {
  const doc = await nouveauDocument()
  dessinerPv(doc, pv, await chargerLogos())
  doc.save(nomFichierPv(pv))
}

/** Télécharge tous les PV dans un seul PDF (une page par étudiant). */
export async function telechargerTousPv(pvs, nomFichier = 'PV_soutenances.pdf') {
  if (pvs.length === 0) return
  const doc = await nouveauDocument()
  const logos = await chargerLogos()
  pvs.forEach((pv, i) => {
    if (i > 0) doc.addPage()
    dessinerPv(doc, pv, logos)
  })
  doc.save(nomFichier)
}
