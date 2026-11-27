// Ordre des branches du radar : les profils les plus proches sont placés côte à côte.
// Méthode : circuit fermé de longueur minimale (programmation dynamique de Held-Karp, exact pour 12 ou 7 points)
// sur la distance entre profils définis par les 6 critères de tools/profils-criteres.js (somme des écarts absolus).
// Usage : node tools/ordre-radar.js
const { MASCULINS, FEMININS } = require('./profils-criteres.js');

function dist(a, b) { return a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0); }

function meilleurCircuit(set) {
  const noms = Object.keys(set), n = noms.length;
  const d = noms.map(a => noms.map(b => dist(set[a], set[b])));
  const FULL = 1 << n, INF = 1e9;
  const dp = Array.from({ length: FULL }, () => new Array(n).fill(INF));
  const prev = Array.from({ length: FULL }, () => new Array(n).fill(-1));
  dp[1][0] = 0;   // départ fixe sur le premier profil : le circuit est fermé, le point de départ n'a pas d'importance
  for (let mask = 1; mask < FULL; mask++) {
    if (!(mask & 1)) continue;
    for (let j = 0; j < n; j++) {
      if (dp[mask][j] >= INF) continue;
      for (let k = 1; k < n; k++) {
        if (mask & (1 << k)) continue;
        const nm = mask | (1 << k), c = dp[mask][j] + d[j][k];
        if (c < dp[nm][k]) { dp[nm][k] = c; prev[nm][k] = j; }
      }
    }
  }
  let best = INF, last = -1;
  for (let j = 1; j < n; j++) { const c = dp[FULL - 1][j] + d[j][0]; if (c < best) { best = c; last = j; } }
  const ordre = []; let mask = FULL - 1, j = last;
  while (j !== -1) { ordre.push(noms[j]); const p = prev[mask][j]; mask ^= (1 << j); j = p; }
  return { ordre: ordre.reverse(), longueur: best, d, noms };
}

// Remet le circuit dans un sens et un point de départ lisibles : on part du profil demandé, dans le sens du voisin le plus proche.
function normaliser(c, depart) {
  let o = c.ordre.slice();
  const i = o.indexOf(depart);
  o = o.slice(i).concat(o.slice(0, i));
  const dd = (a, b) => c.d[c.noms.indexOf(a)][c.noms.indexOf(b)];
  if (dd(o[0], o[o.length - 1]) < dd(o[0], o[1])) o = [o[0], ...o.slice(1).reverse()];
  return o;
}

if (require.main === module) {
  for (const [nom, set, depart] of [['12 masculines', MASCULINS, 'Le Roi'], ['7 féminines', FEMININS, 'La Reine']]) {
    const c = meilleurCircuit(set);
    const o = normaliser(c, depart);
    const idx = Object.fromEntries(c.noms.map((x, i) => [x, i]));
    const pas = o.map((x, i) => c.d[idx[x]][idx[o[(i + 1) % o.length]]]);
    console.log(`\n${nom} : circuit de longueur ${c.longueur}`);
    console.log(o.map((x, i) => `${x} (${pas[i]})`).join(' → ') + ' → retour');
    console.log('  plus grand saut entre deux voisins :', Math.max(...pas));
  }
}
module.exports = { meilleurCircuit, normaliser };
