// Matrice 12 x 12 : profil de base (alpha, bêta, sigma, gamma) associé à chaque paire « 1re figure, 2e figure » du monde masculin.
// Usage : node tools/matrice-profils.js
//
// ATTENTION : cette typologie est informelle (une source la qualifie de pseudo-scientifique, les définitions du gamma se
// contredisent). Le rattachement des figures aux quatre familles est une INTERPRÉTATION, pas une règle établie.
//
// Règle (transparente) :
//  1. Les 12 figures sont disposées en cercle dans l'ordre du radar (circuit le plus court sur les 6 critères) :
//     Roi, Guerrier, Héros | Rebelle, Explorateur, Sage | Magicien, Créateur, Bouffon | Amant, Soignant, Père.
//     Chaque famille occupe un quart du cercle : alpha, sigma, gamma, bêta.
//  2. Pour une paire (1re, 2e), on calcule le centre de gravité de leurs deux positions sur le cercle avec les poids 2 et 1
//     (les mêmes que le scoring : 2 points pour la cible principale, 1 pour la secondaire).
//  3. Le profil de base est la famille du secteur où tombe ce centre de gravité. Sur une frontière exacte, la famille de la 1re figure l'emporte.
//  4. La diagonale (même figure deux fois) est impossible dans l'application : deux figures sont toujours distinctes.
const ORDRE = ['Roi', 'Guerrier', 'Héros', 'Rebelle', 'Explorateur', 'Sage', 'Magicien', 'Créateur', 'Bouffon', 'Amant', 'Soignant', 'Père'];
const FAMILLES = ['alpha', 'sigma', 'gamma', 'bêta'];   // dans l'ordre du cercle, trois figures chacune

const pos = nom => { const i = ORDRE.indexOf(nom); if (i < 0) throw new Error('figure inconnue : ' + nom); return i; };
const famille = nom => FAMILLES[Math.floor(pos(nom) / 3)];

function profilDeBase(premiere, deuxieme, poids = [2, 1]) {
  const a = pos(premiere), b = pos(deuxieme);
  if (a === b) return null;
  const ang = i => (2 * Math.PI * i) / 12;
  const x = poids[0] * Math.cos(ang(a)) + poids[1] * Math.cos(ang(b));
  const y = poids[0] * Math.sin(ang(a)) + poids[1] * Math.sin(ang(b));
  // angle exprimé en « positions » (0 à 12), décalé d'une demi-position pour que chaque figure soit au centre de sa case
  let p = Math.atan2(y, x) / (2 * Math.PI) * 12;
  if (p < 0) p += 12;
  const sect = (p + 0.5) / 3;                      // 0 à 4 : quart du cercle (frontières à -0,5 ; 2,5 ; 5,5 ; 8,5 ; 11,5)
  const idx = Math.floor(sect + 1e-9) % 4;
  const proche = Math.abs(sect - Math.round(sect)) < 1e-6;   // pile sur une frontière
  return proche ? famille(premiere) : FAMILLES[idx];
}

function matrice() {
  return ORDRE.map(a => ORDRE.map(b => profilDeBase(a, b)));
}

if (require.main === module) {
  const L = { alpha: 'A', sigma: 'S', gamma: 'G', 'bêta': 'B' };
  const m = matrice();
  console.log('Lignes = 1re figure (score le plus haut), colonnes = 2e figure.   A alpha · S sigma · G gamma · B bêta\n');
  console.log('              ' + ORDRE.map(n => n.slice(0, 3).padEnd(4)).join(''));
  m.forEach((row, i) => console.log(ORDRE[i].padEnd(14) + row.map(c => (c ? L[c] : '–').padEnd(4)).join('')));
  const compte = { alpha: 0, sigma: 0, gamma: 0, 'bêta': 0 };
  m.forEach(r => r.forEach(c => { if (c) compte[c]++; }));
  console.log('\nRépartition des 132 paires valides :', JSON.stringify(compte));
  let diff = 0;
  m.forEach((row, i) => row.forEach((c, j) => { if (c && c !== famille(ORDRE[i])) diff++; }));
  console.log(`Paires dont le profil de base diffère de la famille de la 1re figure : ${diff} sur 132`);
}
module.exports = { ORDRE, FAMILLES, famille, profilDeBase, matrice };
