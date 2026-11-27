// Rééquilibrage du Guerrier après la migration (v0.16.0). Usage : node docs/drafts/male-balance.js
// Mesure avant : Guerrier -34 % du poids idéal (27 apparitions principales, 12 secondaires), Soignant +22 %.
// 1) Cible secondaire = Guerrier sur des options qui parlent déjà d'effort, de devoir, de loyauté ou de fermeté.
// 2) Deux options du Père (sacrifice pour l'équipe, parole ferme) deviennent principales pour le Guerrier.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const die = m => { console.error('ERREUR ' + m); process.exit(1); };
// "id:index": [primaire attendue, nouvelle primaire, nouvelle secondaire]
const CHANGES = {
  // Héros : devoir, courage, endurance
  '8:2': ['Héros', 'Héros', 'Guerrier'], '26:2': ['Héros', 'Héros', 'Guerrier'], '30:1': ['Héros', 'Héros', 'Guerrier'],
  '56:2': ['Héros', 'Héros', 'Guerrier'], '72:0': ['Héros', 'Héros', 'Guerrier'], '85:3': ['Héros', 'Héros', 'Guerrier'],
  '32:0': ['Héros', 'Héros', 'Guerrier'], '5:1': ['Héros', 'Héros', 'Guerrier'], '21:0': ['Héros', 'Héros', 'Guerrier'],
  '43:2': ['Héros', 'Héros', 'Guerrier'], '50:1': ['Héros', 'Héros', 'Guerrier'],
  // Roi : devoir, exigence, loyauté, vigilance
  '9:2': ['Roi', 'Roi', 'Guerrier'], '24:2': ['Roi', 'Roi', 'Guerrier'], '14:0': ['Roi', 'Roi', 'Guerrier'],
  '19:3': ['Roi', 'Roi', 'Guerrier'], '42:2': ['Roi', 'Roi', 'Guerrier'], '30:2': ['Roi', 'Roi', 'Guerrier'], '47:3': ['Roi', 'Roi', 'Guerrier'],
  // Père -> Guerrier (principale)
  '26:3': ['Père', 'Guerrier', 'Père'], '34:3': ['Père', 'Guerrier', 'Père'],
};
const f = path.join(root, 'index.html');
const lines = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n').split('\n');
const J = JSON.stringify;
let n = 0;
const b0 = lines.findIndex(l => l.startsWith('const BANK_12 = ['));
const b1 = lines.findIndex((l, i) => i > b0 && l === '];');
if (b0 < 0 || b1 < 0) die('bloc banque');
for (let i = b0 + 1; i < b1; i++) {
  const m = lines[i].match(/^  \{id:(\d+),/);
  if (!m) continue;
  const q = new Function('return (' + lines[i].trim().replace(/,$/, '') + ')')();
  let touched = false;
  q.o.forEach((o, idx) => {
    const c = CHANGES[`${q.id}:${idx}`];
    if (!c) return;
    if (o[1] !== c[0]) die(`primaire inattendue ${q.id}:${idx} (${o[1]} au lieu de ${c[0]})`);
    o[1] = c[1]; o[2] = c[2]; touched = true; n++;
  });
  if (!touched) continue;
  const prims = q.o.map(o => o[1]);
  if (new Set(prims).size !== prims.length) die(`cibles principales en double, question ${q.id}`);
  lines[i] = `  {id:${q.id},m:${J(q.m)},t:${J(q.t)},a:${J(q.a)},q:${J(q.q)},o:${J(q.o)}},`;
}
if (n !== Object.keys(CHANGES).length) die(`${n} changements appliqués sur ${Object.keys(CHANGES).length}`);
fs.writeFileSync(f, lines.join('\n'));
console.log(n + ' options rééquilibrées');
