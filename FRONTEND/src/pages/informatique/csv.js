// Petits utilitaires d'import / export (Excel .xlsx et CSV) — aucune dépendance externe

const norm = (h) => String(h ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const alias = {
  matriculation: 'matricule', n_matricule: 'matricule', numero_matricule: 'matricule', num_matricule: 'matricule', matricule_etudiant: 'matricule',
  matri: 'matricule',
  noms: 'nom', prenoms: 'prenom', prenom_s: 'prenom',
  tel: 'telephone', telephone: 'telephone', num_telephone: 'telephone', numero_telephone: 'telephone', n_telephone: 'telephone',
  num_tel: 'telephone', numero_tel: 'telephone', phone: 'telephone', contact: 'telephone',
  date_de_naissance: 'date_naissance', date_naiss: 'date_naissance', naissance: 'date_naissance', ne_le: 'date_naissance', nee_le: 'date_naissance',
  lieu_de_naissance: 'lieu_naissance', lieux_de_naissance: 'lieu_naissance', lieu_naiss: 'lieu_naissance', ne_a: 'lieu_naissance', nee_a: 'lieu_naissance',
  lieux_de_stage: 'lieu_stage', lieu_de_stage: 'lieu_stage', lieu_stage: 'lieu_stage',
  theme: 'theme', th_e_me: 'theme',
  description: 'description',
  tous_les_tech_utiliser: 'technologies', tous_les_techs_utiliser: 'technologies', technologies_utilisees: 'technologies', technologies: 'technologies',
}
const nomColonne = (h) => alias[norm(h)] || norm(h)

/** Tableau de lignes (tableaux de cases) -> objets {colonne: valeur}. L'en-tête est cherchée dans les 15 premières lignes. */
function versObjets(tableau) {
  const lignes = tableau.filter((l) => l.some((c) => String(c ?? '').trim() !== ''))
  if (lignes.length < 2) return []
  const pos = lignes.slice(0, 15).findIndex((l) => l.some((h) => ['matricule', 'nom', 'prenom'].includes(nomColonne(h))))
  const debut = pos >= 0 ? pos : 0
  const entetes = lignes[debut].map(nomColonne)

  return lignes.slice(debut + 1).map((l) => {
    const obj = {}
    entetes.forEach((h, i) => { if (h) obj[h] = String(l[i] ?? '').trim() })
    return obj
  })
}

/** Lit un CSV (séparateur , ou ;) et renvoie des objets {colonne: valeur}. */
export function parseCsv(texte) {
  const brut = texte.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '')
  if (brut.length < 2) return []
  const sep = (brut[0].match(/;/g) || []).length > (brut[0].match(/,/g) || []).length ? ';' : ','

  const decouper = (ligne) => {
    const cases = []
    let cur = ''
    let guillemets = false
    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i]
      if (c === '"') {
        if (guillemets && ligne[i + 1] === '"') { cur += '"'; i++ } else guillemets = !guillemets
      } else if (c === sep && !guillemets) {
        cases.push(cur); cur = ''
      } else cur += c
    }
    cases.push(cur)
    return cases.map((x) => x.trim())
  }

  return versObjets(brut.map(decouper))
}

// ---------- Excel (.xlsx) : lecture sans bibliothèque ----------

const entitesXml = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e) => {
  const k = e.toLowerCase()
  if (k === 'amp') return '&'
  if (k === 'lt') return '<'
  if (k === 'gt') return '>'
  if (k === 'quot') return '"'
  if (k === 'apos') return "'"
  return String.fromCodePoint(k[1] === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10))
})

// texte d'une cellule : concatène les <t> (texte enrichi inclus), ignore les annotations phonétiques
const textesXml = (x) =>
  [...x.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '').matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => entitesXml(m[1])).join('')

/** Un .xlsx est une archive ZIP : on lit l'index puis on décompresse à la demande. */
function ouvrirZip(buf) {
  const dv = new DataView(buf)
  const u8 = new Uint8Array(buf)
  let fin = -1
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break }
  }
  if (fin < 0) throw new Error("Fichier Excel illisible (archive invalide). Réenregistrez-le au format .xlsx.")
  const nb = dv.getUint16(fin + 10, true)
  let p = dv.getUint32(fin + 16, true)
  const dec = new TextDecoder()
  const entrees = {}
  for (let i = 0; i < nb && dv.getUint32(p, true) === 0x02014b50; i++) {
    const lgNom = dv.getUint16(p + 28, true)
    const lgExtra = dv.getUint16(p + 30, true)
    const lgCom = dv.getUint16(p + 32, true)
    entrees[dec.decode(u8.subarray(p + 46, p + 46 + lgNom))] = {
      methode: dv.getUint16(p + 10, true),
      taille: dv.getUint32(p + 20, true),
      local: dv.getUint32(p + 42, true),
    }
    p += 46 + lgNom + lgExtra + lgCom
  }
  return { entrees, dv, u8 }
}

async function extraire(zip, nom) {
  const e = zip.entrees[nom]
  if (!e) return null
  const { dv, u8 } = zip
  const debut = e.local + 30 + dv.getUint16(e.local + 26, true) + dv.getUint16(e.local + 28, true)
  const brut = u8.subarray(debut, debut + e.taille)
  if (e.methode === 0) return new TextDecoder().decode(brut)
  if (e.methode !== 8) throw new Error('Fichier Excel non pris en charge. Réenregistrez-le au format .xlsx.')
  if (typeof DecompressionStream === 'undefined') {
    throw new Error("Ce navigateur ne peut pas lire les fichiers .xlsx : mettez-le à jour ou exportez le fichier en CSV.")
  }
  const flux = new Blob([brut]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new TextDecoder().decode(await new Response(flux).arrayBuffer())
}

/** Première feuille d'un .xlsx -> tableau de lignes (tableaux de textes). */
async function lireXlsx(buf) {
  const zip = ouvrirZip(buf)

  // feuille à lire : la première du classeur
  let chemin = null
  const wb = await extraire(zip, 'xl/workbook.xml')
  const rels = await extraire(zip, 'xl/_rels/workbook.xml.rels')
  const rid = /<sheet\b[^>]*\br:id="([^"]+)"/.exec(wb || '')
  if (rid && rels) {
    const rel = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((t) => t.includes(`Id="${rid[1]}"`))
    const cible = rel && /Target="([^"]+)"/.exec(rel)
    if (cible) chemin = cible[1].startsWith('/') ? cible[1].slice(1) : `xl/${cible[1]}`
  }
  if (!chemin || !zip.entrees[chemin]) {
    chemin = Object.keys(zip.entrees).filter((n) => /^xl\/worksheets\/[^/]+\.xml$/.test(n)).sort()[0]
  }
  if (!chemin) throw new Error("Aucune feuille trouvée dans ce fichier Excel.")

  const ss = await extraire(zip, 'xl/sharedStrings.xml')
  const partages = ss ? [...ss.matchAll(/<si\s*\/>|<si>([\s\S]*?)<\/si>/g)].map((m) => textesXml(m[1] || '')) : []

  const feuille = await extraire(zip, chemin)
  const grille = new Map() // n° de ligne -> { n° de colonne -> texte }
  let nbCol = 0
  for (const mc of feuille.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const attrs = mc[1]
    const corps = mc[2] || ''
    const ref = /\br="([A-Z]+)(\d+)"/.exec(attrs)
    if (!ref) continue
    const col = ref[1].split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1
    const lig = Number(ref[2]) - 1
    const type = (/\bt="(\w+)"/.exec(attrs) || [])[1]
    const v = /<v>([\s\S]*?)<\/v>/.exec(corps)
    let val = ''
    if (type === 's') val = partages[Number(v?.[1])] ?? ''
    else if (type === 'inlineStr') val = textesXml(corps)
    else if (type === 'e') val = ''
    else if (v) val = entitesXml(v[1])
    val = val.trim()
    if (val === '') continue // case vide : rien à stocker (les lignes sont complétées plus bas)
    if (!grille.has(lig)) grille.set(lig, {})
    grille.get(lig)[col] = val
    nbCol = Math.max(nbCol, col + 1)
  }

  return [...grille.keys()].sort((a, b) => a - b).map((lig) => Array.from({ length: nbCol }, (_, c) => grille.get(lig)[c] ?? ''))
}

/** Lit un fichier .xlsx ou .csv choisi par l'utilisateur -> objets {colonne: valeur}. */
export async function lireTableur(fichier) {
  const buf = await fichier.arrayBuffer()
  const t = new Uint8Array(buf, 0, Math.min(4, buf.byteLength))
  if (t[0] === 0x50 && t[1] === 0x4b) return versObjets(await lireXlsx(buf)) // « PK » : archive .xlsx
  if (t[0] === 0xd0 && t[1] === 0xcf) {
    throw new Error("Ancien format Excel (.xls) non pris en charge : ouvrez-le dans Excel puis « Enregistrer sous → Classeur Excel (.xlsx) ».")
  }
  return parseCsv(new TextDecoder().decode(buf))
}

export const A_COMPLETER = '(à compléter)'

/**
 * Accepte les lignes incomplètes : une ligne vide est ignorée ; un matricule, un nom ou un prénom
 * manquant est remplacé par une valeur provisoire (modifiable ensuite dans la liste).
 */
export function completerEtudiants(lignes) {
  const base = Date.now().toString(36).toUpperCase()
  let n = 0
  let incompletes = 0
  const etudiants = lignes
    .filter((l) => Object.values(l).some((v) => String(v ?? '').trim() !== ''))
    .map((l) => {
      const o = { ...l }
      let manque = false
      if (!String(o.matricule ?? '').trim()) { o.matricule = `SANS-MAT-${base}-${++n}`; manque = true }
      if (!String(o.nom ?? '').trim()) { o.nom = A_COMPLETER; manque = true }
      if (!String(o.prenom ?? '').trim()) { o.prenom = A_COMPLETER; manque = true }
      if (manque) incompletes++
      return o
    })
  return { etudiants, incompletes }
}

/** Télécharge des lignes (tableau de tableaux) en CSV lisible par Excel. */
export function telechargerCsv(nomFichier, lignes) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const contenu = '\uFEFF' + lignes.map((l) => l.map(esc).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([contenu], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  a.click()
  URL.revokeObjectURL(url)
}

export const formaterDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : ''
