// Migration unique du monde « 12 » vers la liste masculine (v0.16.0). Usage : node docs/drafts/to-male.js
// Remplace Innocent et Homme ordinaire par Père et Guerrier ; renomme Souverain, Amoureux, Hors-la-loi, Protecteur.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const { REWRITE, RENAME, SECONDARY } = require('./male-rewrite.js');
const die = m => { console.error('ERREUR ' + m); process.exit(1); };

let h = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const once = (a, b, l) => { const n = h.split(a).length - 1; if (n !== 1) die(`${l} : ${n}`); h = h.replace(a, () => b); };
const J = JSON.stringify;

// 1. Banque de questions
const lines = h.split('\n');
const start = lines.findIndex(l => l.startsWith('const BANK_12 = ['));
const end = lines.findIndex((l, i) => i > start && l === '];');
if (start < 0 || end < 0) die('bloc banque');
let nRewritten = 0, nSecondary = 0, nRenamed = 0;
const used = new Set();
for (let i = start + 1; i < end; i++) {
  const m = lines[i].match(/^  \{id:(\d+),/);
  if (!m) continue;
  const q = new Function('return (' + lines[i].trim().replace(/,$/, '') + ')')();
  if (Object.keys(q).join(',') !== 'id,m,t,a,q,o') die('champs inattendus q' + q.id);
  q.o = q.o.map((o, idx) => {
    const key = `${q.id}:${idx}`;
    if (REWRITE[key]) { used.add(key); nRewritten++; return REWRITE[key].slice(); }
    let [text, p, s] = o;
    if (p === 'Innocent' || p === 'Homme ordinaire') die(`option non réécrite ${key}`);
    p = RENAME[p] || p;
    s = RENAME[s] || s;
    if (s === 'Innocent' || s === 'Homme ordinaire') {
      const to = SECONDARY[s][p];
      if (!to) die(`pas de règle secondaire ${key} ${p}/${s}`);
      s = to; nSecondary++;
    }
    if (p !== o[1] || s !== o[2]) nRenamed++;
    return [text, p, s];
  });
  // contrôles : quatre cibles principales distinctes, primaire différent du secondaire
  const prims = q.o.map(o => o[1]);
  if (new Set(prims).size !== prims.length) die(`cibles principales en double dans la question ${q.id} : ${prims.join(', ')}`);
  q.o.forEach(o => { if (o[1] === o[2]) die(`primaire = secondaire dans la question ${q.id}`); });
  lines[i] = `  {id:${q.id},m:${J(q.m)},t:${J(q.t)},a:${J(q.a)},q:${J(q.q)},o:${J(q.o)}},`;
}
Object.keys(REWRITE).forEach(k => { if (!used.has(k)) die('réécriture inutilisée ' + k); });
h = lines.join('\n');
console.log(`banque : ${nRewritten} options réécrites, ${nSecondary} cibles secondaires reprises, ${nRenamed} options touchées par un renommage`);

// 2. Métadonnées des 12 profils masculins
const m0 = h.indexOf('const META_12 = {'), m1 = h.indexOf('\n};\n', m0);
if (m0 < 0 || m1 < 0) die('META_12');
h = h.slice(0, m0) + `const META_12 = {
  "Roi": { full: "Le Roi", motor: "Structurer, gouverner et garantir la stabilité.", shadow: "Tyrannie, ou abdication et laisser-faire." },
  "Père": { full: "Le Père", motor: "Protéger les siens, subvenir à leurs besoins et transmettre.", shadow: "Excès de contrôle, ou absence et indisponibilité." },
  "Guerrier": { full: "Le Guerrier", motor: "Servir une cause avec discipline, courage et loyauté.", shadow: "Dureté sans limite, ou soumission à toute pression." },
  "Magicien": { full: "Le Magicien", motor: "Comprendre les lois cachées pour transformer la réalité.", shadow: "Mise à distance analytique ou manipulation." },
  "Amant": { full: "L'Amant", motor: "Créer une connexion profonde et sensorielle.", shadow: "Dépendance affective, ou détachement émotionnel." },
  "Sage": { full: "Le Sage", motor: "Chercher la vérité objective et modéliser les systèmes.", shadow: "Paralysie par l'analyse, détachement." },
  "Explorateur": { full: "L'Explorateur", motor: "Repousser les frontières et préserver son autonomie.", shadow: "Instabilité chronique, fuite de l'engagement." },
  "Créateur": { full: "Le Créateur", motor: "Bâtir une œuvre durable et singulière.", shadow: "Perfectionnisme bloquant." },
  "Héros": { full: "Le Héros", motor: "Relever les défis et triompher par l'effort.", shadow: "Besoin constant d'un combat." },
  "Rebelle": { full: "Le Rebelle", motor: "Briser les règles absurdes et renverser le statu quo.", shadow: "Rupture gratuite, marginalisation." },
  "Bouffon": { full: "Le Bouffon", motor: "Dédramatiser le réel par l'humour et le paradoxe.", shadow: "Fuite des responsabilités." },
  "Soignant": { full: "Le Soignant", motor: "Prendre soin des autres et se mettre à leur service.", shadow: "Oubli de soi, surprotection." }` + h.slice(m1);

// 3. Synthèses
const synthLine = (key, o) => `  "${key}": { trait: ${J(o.trait)}, nuance: ${J(o.nuance)}, relation: ${J(o.relation)}, piste: ${J(o.piste)} },`;
const synthRe = key => new RegExp(`^  "${key}": \\{.*\\},?$`, 'm');
const replaceSynth = (key, newKey, o) => {
  const re = synthRe(key);
  if (!re.test(h)) die('SYNTH ' + key);
  h = h.replace(re, () => synthLine(newKey, o));
};
const readSynth = key => { const m = h.match(synthRe(key)); if (!m) die('lecture SYNTH ' + key); return new Function('return {' + m[0].trim().replace(/,$/, '') + '}')()[key]; };
const sAmoureux = readSynth('Amoureux'), sHors = readSynth('Hors-la-loi');
replaceSynth('Souverain', 'Roi', { trait: "structurer, décider et garantir l'ordre et la prospérité de ce dont tu as la charge", nuance: "un sens des responsabilités, de l'organisation et de l'autorité légitime", relation: "tu inspires confiance et autorité, au risque de décider un peu vite pour les autres", piste: "déléguer davantage, écouter avant de trancher et partager le pouvoir" });
replaceSynth('Protecteur', 'Soignant', { trait: "prendre soin des autres et te mettre à leur service", nuance: "une grande générosité et le sens du service", relation: "tu es quelqu'un sur qui l'on peut toujours compter", piste: "t'inclure dans ta propre attention : poser des limites et recevoir autant que tu donnes" });
replaceSynth('Amoureux', 'Amant', sAmoureux);
replaceSynth('Hors-la-loi', 'Rebelle', sHors);
replaceSynth('Innocent', 'Père', { trait: "protéger les tiens, subvenir à leurs besoins et leur transmettre ce que tu sais", nuance: "une présence solide, le sens du devoir et le goût de transmettre", relation: "on s'appuie sur toi et tu rassures, au risque de vouloir tout contrôler ou de t'oublier", piste: "faire confiance et laisser chacun grandir par lui-même, sans tout porter seul" });
replaceSynth('Homme ordinaire', 'Guerrier', { trait: "servir une cause avec discipline, courage et loyauté", nuance: "de la rigueur, de l'endurance et le sens de l'honneur", relation: "on compte sur ta fermeté et ta parole, parfois ressentie comme de la dureté", piste: "assouplir ta dureté et accepter de montrer ta fatigue ou tes doutes" });

// 4. Couleurs (les teintes de l'Innocent et de l'Homme ordinaire passent au Père et au Guerrier)
once('"Souverain": ["#f5c572", "#9d6d00"]', '"Roi": ["#f5c572", "#9d6d00"]', 'couleur roi');
once('"Homme ordinaire": ["#addf92", "#558736"]', '"Guerrier": ["#addf92", "#558736"]', 'couleur guerrier');
once('"Protecteur": ["#65c495", "#006f41"]', '"Soignant": ["#65c495", "#006f41"]', 'couleur soignant');
once('"Innocent": ["#46bfe0", "#00698b"]', '"Père": ["#46bfe0", "#00698b"]', 'couleur père');
once('"Hors-la-loi": ["#eab7ff", "#935faa"]', '"Rebelle": ["#eab7ff", "#935faa"]', 'couleur rebelle');
once('"Amoureux": ["#e58fb8", "#8c3865"]', '"Amant": ["#e58fb8", "#8c3865"]', 'couleur amant');

// 5. Figures (uniquement des repères déjà sourcés et masculins)
const f0 = h.indexOf('const FIGURES = {'), f1 = h.indexOf('\n};\n', f0);
if (f0 < 0 || f1 < 0) die('FIGURES');
h = h.slice(0, f0) + `const FIGURES = {
  "Sage": ["Albert Einstein", "Yoda (fiction)"],
  "Magicien": ["Steve Jobs", "Gandalf (fiction)"],
  "Rebelle": ["Robin des Bois (légende)"],
  "Créateur": ["Léonard de Vinci"],
  "Roi": ["le roi Arthur (légende)"],
  "Héros": ["Luke Skywalker (fiction)"],
  "Soignant": ["Samwise Gamgee (fiction)"],
  "Amant": ["Roméo (fiction)", "John Keats"]` + h.slice(f1);
once('Aucune figure sourcée pour Bouffon ni pour les 7 Princesses.', "Aucune figure sourcée pour Bouffon, Père, Guerrier, Explorateur ni pour les 7 Princesses.", 'commentaire figures');

// 6. Tampons
once(`"Hors-la-loi": '`, `"Rebelle": '`, 'icône rebelle');
once(`"Souverain": '`, `"Roi": '`, 'icône roi');
once(`"Protecteur": '`, `"Soignant": '`, 'icône soignant');
once(`"Amoureux": '`, `"Amant": '`, 'icône amant');
const icon = (key, newKey, svg) => { const re = new RegExp(`"${key}": '[^']*'`); if (!re.test(h)) die('icône ' + key); h = h.replace(re, () => `"${newKey}": '${svg}'`); };
icon('Homme ordinaire', 'Guerrier', '<path d="M24 4 L28 10 V30 H20 V10 Z"/><path d="M13 30 H35"/><path d="M24 30 V43"/><path d="M20 43 H28"/>');
icon('Innocent', 'Père', '<path d="M7 24 L24 9 L41 24"/><path d="M12 21 V39 H36 V21"/><path d="M21 39 V29 H27 V39"/>');

// 7. Historique : conversion des noms renommés ; les résultats contenant un profil disparu sont ignorés
once(`"Aphrodite":"L'Amante"};`, `"Aphrodite":"L'Amante","Souverain":"Roi","Amoureux":"Amant","Hors-la-loi":"Rebelle","Protecteur":"Soignant"};`, 'migration');
once("    return Array.isArray(raw) ? raw.map(migrateEntry) : [];",
  "    // Un résultat du monde « 12 » qui contenait l'Innocent ou l'Homme ordinaire (grille remplacée en v0.16.0) n'est plus lisible : il est ignoré.\n    const valid = e => e && Array.isArray(e.order) && e.order.every(k => (e.universe === '7' ? META_7 : META_12)[k]);\n    return Array.isArray(raw) ? raw.map(migrateEntry).filter(valid) : [];", 'filtre historique');

// 8. Textes
once('Une grille mixte : Héros, Sage, Créateur, Souverain, Amoureux, Bouffon…', "Un monde au masculin : le Roi, le Père, le Guerrier, le Magicien, l'Amant, le Sage…", 'accueil 12');
once("APP_VERSION = 'v0.15.0'", "APP_VERSION = 'v0.16.0'", 'version');
fs.writeFileSync(path.join(root, 'index.html'), h);
const swp = path.join(root, 'sw.js');
const sw = fs.readFileSync(swp, 'utf8');
if (sw.split("CACHE_VERSION = 'v0.15.0'").length !== 2) die('sw');
fs.writeFileSync(swp, sw.replace("CACHE_VERSION = 'v0.15.0'", "CACHE_VERSION = 'v0.16.0'"));
console.log('monde 12 : liste masculine appliquée');
