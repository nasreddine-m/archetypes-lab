// Matrices « profil de base » (alpha, bêta, sigma, gamma) associé à chaque paire « 1re figure, 2e figure ».
// Usage : node tools/matrice-profils.js
//
// ATTENTION : cette typologie est informelle (une source la qualifie de pseudo-scientifique, les définitions du gamma se
// contredisent, les versions féminines sont adaptées des masculines). Le rattachement des figures aux quatre familles est une
// INTERPRÉTATION, pas une règle établie.
//
// Règle (transparente), identique pour le monde masculin (12 figures) et le monde féminin (7 figures) :
//  1. Les figures sont disposées en cercle dans l'ordre du radar (circuit le plus court sur les 6 critères). Chaque famille
//     occupe un arc du cercle (3 figures chacune chez les masculins ; 1, 3, 2 et 1 chez les féminines).
//  2. Pour une paire (1re, 2e), on calcule le centre de gravité de leurs deux positions avec les poids 2 et 1
//     (les mêmes que le scoring : 2 points pour la cible principale, 1 pour la secondaire).
//  3. Le profil de base est la famille de l'arc où tombe ce centre de gravité. Sur une frontière exacte, la famille de la 1re figure l'emporte.
//  4. La diagonale (même figure deux fois) est impossible dans l'application : deux figures sont toujours distinctes.
const FAMILLES = ['alpha', 'sigma', 'gamma', 'bêta'];   // dans l'ordre du cercle

function construire(ordre, tailles) {
  const n = ordre.length;
  const bornes = []; let cumul = 0;
  tailles.forEach(t => { cumul += t; bornes.push(cumul); });   // ex. [3, 6, 9, 12] ou [1, 4, 6, 7]
  if (cumul !== n || tailles.length !== FAMILLES.length) throw new Error('tailles incohérentes');
  const pos = nom => { const i = ordre.indexOf(nom); if (i < 0) throw new Error('figure inconnue : ' + nom); return i; };
  const famille = nom => FAMILLES[bornes.findIndex(b => pos(nom) < b)];
  function profilDeBase(premiere, deuxieme, poids = [2, 1]) {
    const a = pos(premiere), b = pos(deuxieme);
    if (a === b) return null;
    const ang = i => (2 * Math.PI * i) / n;
    const x = poids[0] * Math.cos(ang(a)) + poids[1] * Math.cos(ang(b));
    const y = poids[0] * Math.sin(ang(a)) + poids[1] * Math.sin(ang(b));
    let p = Math.atan2(y, x) / (2 * Math.PI) * n;       // position sur le cercle, en « figures »
    if (p < 0) p += n;
    let q = p + 0.5;                                    // chaque figure occupe [i - 0,5 ; i + 0,5[ : on décale d'une demi-figure
    if (q >= n) q -= n;
    if ([0, ...bornes].some(bd => Math.abs(q - bd) < 1e-6)) return famille(premiere);   // pile sur une frontière
    return FAMILLES[bornes.findIndex(bd => q < bd)];
  }
  const matrice = () => ordre.map(a => ordre.map(b => profilDeBase(a, b)));
  return { ORDRE: ordre, FAMILLES, famille, profilDeBase, matrice };
}

// Monde masculin : Roi, Guerrier, Héros | Rebelle, Explorateur, Sage | Magicien, Créateur, Bouffon | Amant, Soignant, Père
const M = construire(['Roi', 'Guerrier', 'Héros', 'Rebelle', 'Explorateur', 'Sage', 'Magicien', 'Créateur', 'Bouffon', 'Amant', 'Soignant', 'Père'], [3, 3, 3, 3]);
// Monde féminin : La Reine, La Sage | La Mystique, La Chasseresse | L'Amante, La Curieuse | La Mère (découpage 2 / 2 / 2 / 1 choisi pour sa répartition équilibrée : 12 / 12 / 12 / 6 paires)
const F = construire(['La Reine', 'La Sage', 'La Mystique', 'La Chasseresse', "L'Amante", 'La Curieuse', 'La Mère'], [2, 2, 2, 1]);

function afficher(nom, S) {
  const L = { alpha: 'A', sigma: 'S', gamma: 'G', 'bêta': 'B' };
  const m = S.matrice();
  console.log(`\n${nom} : lignes = 1re figure, colonnes = 2e figure.   A alpha · S sigma · G gamma · B bêta\n`);
  console.log(''.padEnd(16) + S.ORDRE.map(n => n.replace(/^(Le |La |L')/, '').slice(0, 3).padEnd(4)).join(''));
  m.forEach((row, i) => console.log(S.ORDRE[i].padEnd(16) + row.map(c => (c ? L[c] : '–').padEnd(4)).join('')));
  const compte = Object.fromEntries(FAMILLES.map(f => [f, 0]));
  m.forEach(r => r.forEach(c => { if (c) compte[c]++; }));
  const n = S.ORDRE.length;
  let diff = 0;
  m.forEach((row, i) => row.forEach((c, j) => { if (c && c !== S.famille(S.ORDRE[i])) diff++; }));
  console.log(`\nRépartition des ${n * (n - 1)} paires valides :`, JSON.stringify(compte));
  console.log(`Paires dont le profil de base diffère de la famille de la 1re figure : ${diff} sur ${n * (n - 1)}`);
}

if (require.main === module) {
  afficher('12 masculines', M);
  afficher('7 féminines', F);
}
module.exports = { ...M, construire, FEMININ: F };
