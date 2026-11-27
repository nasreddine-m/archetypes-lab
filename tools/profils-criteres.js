// Définition des profils selon 6 critères (estimations rédactionnelles, normalisées à 100 % par profil).
// Usage : node tools/profils-criteres.js
// Vérifie que chaque profil totalise 100 et liste les paires de profils les plus proches (distance = somme des écarts absolus, 0 à 200).
// Ces pourcentages sont indicatifs : ils servent à définir et à séparer les profils, pas à mesurer une personne.

const CRITERES = ['Empathie', 'Autorité', 'Indépendance', 'Sagesse', 'Créativité', 'Audace'];
//                      E    A    I    S    C    O
const MASCULINS = {
  'Le Roi':          [10, 40, 10, 20,  5, 15],
  'Le Père':         [30, 25,  5, 25,  5, 10],
  'Le Guerrier':     [10, 30,  5, 15,  5, 35],
  'Le Magicien':     [10, 10, 15, 30, 30,  5],
  "L'Amant":         [35,  5, 10, 10, 25, 15],
  'Le Sage':         [10, 10, 20, 50,  5,  5],
  "L'Explorateur":   [ 5,  5, 45, 15, 10, 20],
  'Le Créateur':     [ 5, 10, 20, 10, 45, 10],
  'Le Héros':        [10, 15, 20,  5, 10, 40],
  'Le Rebelle':      [ 5,  0, 35, 10, 15, 35],
  'Le Bouffon':      [20,  0, 20, 10, 30, 20],
  'Le Soignant':     [55, 10,  0, 20,  5, 10],
};
const FEMININS = {
  'La Sage':         [10, 15, 20, 40,  5, 10],
  'La Chasseresse':  [ 5, 10, 40, 10,  5, 30],
  'La Mystique':     [15,  0, 30, 35, 15,  5],
  'La Reine':        [10, 45, 10, 15,  5, 15],
  'La Mère':         [55, 15,  0, 15, 10,  5],
  'La Curieuse':  [35,  0, 10, 20, 25, 10],
  "L'Amante":        [25,  5, 10,  5, 35, 20],
};

function check(nom, set) {
  const keys = Object.keys(set);
  keys.forEach(k => { const s = set[k].reduce((a, b) => a + b, 0); if (s !== 100) { console.error(`ERREUR ${k} : total ${s}`); process.exit(1); } });
  const pairs = [];
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const d = set[keys[i]].reduce((s, v, n) => s + Math.abs(v - set[keys[j]][n]), 0);
    pairs.push([d, keys[i], keys[j]]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  console.log(`\n${nom} : ${keys.length} profils, tous à 100 %. Paires les plus proches (distance sur 200) :`);
  pairs.slice(0, 5).forEach(([d, a, b]) => console.log(`  ${String(d).padStart(3)}  ${a} / ${b}`));
  return pairs[0][0];
}

if (require.main === module) {
  console.log('Critères :', CRITERES.join(', '));
  const m = check('12 masculins', MASCULINS);
  const f = check('7 féminins', FEMININS);
  const seuil = 35;
  console.log(`\nSeuil de séparation visé : ${seuil}. Minimum masculin ${m}, féminin ${f}.`);
  process.exit(m >= seuil && f >= seuil ? 0 : 1);
}
module.exports = { CRITERES, MASCULINS, FEMININS };
