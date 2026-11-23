// Test de bout en bout avec faux DOM. Usage : node tools/smoke.js
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const els = {};
function el(id) {
  if (els[id]) return els[id];
  const o = (els[id] = {
    id, textContent: '', value: 'Test', checked: false, style: {}, children: [], dataset: {},
    classList: { _s: new Set(), add(...c) { c.forEach(x => this._s.add(x)); }, remove(...c) { c.forEach(x => this._s.delete(x)); }, toggle(c, f) { f ? this._s.add(c) : this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    appendChild(c) { this.children.push(c); },
    getContext() { return new Proxy({}, { get: () => () => {}, set: () => true }); },
  });
  let html = '';
  Object.defineProperty(o, 'innerHTML', { get: () => html, set: v => { html = v; o.children = []; } });
  return o;
}
const doc = {
  getElementById: el,
  createElement: () => el('x' + Math.random()),
  querySelector: () => ({ textContent: '1. Déclaratif Pur' }),
  querySelectorAll: () => [],
  body: { classList: { toggle() {} } },
};
const store = {};
const ctx = {
  document: doc, console, Math, JSON, Object, Array, Set, Number, String,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => store[k] = v },
  getComputedStyle: () => ({ getPropertyValue: () => '#fff' }),
  window: { devicePixelRatio: 1 },
  setInterval: () => 1, clearInterval: () => {},
  navigator: {}, location: { protocol: 'file:' },
};
vm.createContext(ctx);
vm.runInContext(script + `;this.S=state;this.start=startQuiz;this.choose=chooseOption;this.skip=skipQuestion;this.setU=setUniverse;this.duo=prepareDuoCompare;this.synth=buildSynthesis;this.M12=META_12;this.M7=META_7;this.SYN=SYNTH;`, ctx);

let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) fail++; };

// 1. Parcours complet monde 12, toujours l'option 0
for (const u of ['12', '7']) {
  ctx.setU(u); els.rankingList && (els.rankingList.children = []);
  ctx.start();
  for (let i = 0; i < 10; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[0][1], q.o[0][2]); }
  ok(!els.viewResult.classList.contains('hidden'), `monde ${u} : écran résultats affiché`);
  ok(ctx.S.answered.length === 10, `monde ${u} : 10 réponses comptées`);
  ok(els.resSignature.textContent.includes('—'), `monde ${u} : signature = "${els.resSignature.textContent}"`);
  ok(els.rankingList.children.length === (u === '12' ? 12 : 7), `monde ${u} : classement complet`);
}

// 2. Chrono expiré sur 3 questions
ctx.setU('12'); ctx.start();
for (let i = 0; i < 10; i++) { const q = ctx.S.questions[ctx.S.idx]; i < 3 ? ctx.skip() : ctx.choose(q.o[1][1], q.o[1][2]); }
ok(ctx.S.answered.length === 7, '3 expirées : 7 réponses comptées');
ok(/3 questions sans réponse/.test(els.resSummary.innerHTML), 'mention des 3 questions sans réponse');
const total = Object.values(ctx.S.scores).reduce((a, b) => a + b, 0);
ok(total === 7 * 3, `aucun point pour les questions expirées (total brut ${total} = 21)`);

// 3. Tout expiré
ctx.start();
for (let i = 0; i < 10; i++) ctx.skip();
ok(!els.viewHome.classList.contains('hidden') && !els.notice.classList.contains('hidden'), 'tout expiré : retour accueil + message');

// 4. Duo
ctx.start();
for (let i = 0; i < 10; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[2][1], q.o[2][2]); }
ctx.duo();
ctx.start();
for (let i = 0; i < 10; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[3][1], q.o[3][2]); }
ok(!els.duoDiagnostic.classList.contains('hidden') && /Passage 1/.test(els.duoDiagnostic.innerHTML), 'duo : diagnostic affiché');

// 4b. Synthèse du profil
const bare = n => n.replace(/^(Le |L')/, ''); // le texte écrit « du Sage », « de l'Innocent »
ok(els.synthText.children.length === 3, 'synthèse affichée : 3 paragraphes dans la page');
for (const [w, meta] of [['12', ctx.M12], ['7', ctx.M7]]) {
  const keys = Object.keys(meta);
  keys.forEach(k => ok(ctx.SYN[k] && ['trait', 'nuance', 'relation', 'piste'].every(f => ctx.SYN[k][f] && ctx.SYN[k][f].length > 15), `SYNTH complet : ${k}`));
  let bad = 0, n = 0;
  for (const a of keys) for (const b of keys) {
    if (a === b) continue;
    const order = [a, b, ...keys.filter(x => x !== a && x !== b)];
    for (const level of [200, 100]) {
      const adj = Object.fromEntries(keys.map(k => [k, 50])); adj[a] = level; adj[b] = level === 200 ? 150 : 100;
      const txt = ctx.synth(meta, order, adj, 10).join(' '); n++;
      if (/ de (Le|L'|Les) | d'(Le|L')|de L'|de Le /.test(txt) || txt.includes('undefined') || txt.includes('NaN') || !txt.includes(bare(meta[a].full)) || !txt.includes(bare(meta[b].full))) bad++;
    }
  }
  ok(bad === 0, `monde ${w} : ${n} synthèses (toutes paires, profil marqué et plat) sans texte manquant`);
}
const flatTxt = ctx.synth(ctx.M12, Object.keys(ctx.M12), Object.fromEntries(Object.keys(ctx.M12).map(k => [k, 100])), 10)[0];
const all = (meta, v) => Object.fromEntries(Object.keys(meta).map(k => [k, v]));
const p12 = ctx.synth(ctx.M12, ['Innocent', 'Sage', ...Object.keys(ctx.M12).filter(k => k !== 'Innocent' && k !== 'Sage')], all(ctx.M12, 200), 10)[0];
ok(p12.includes("autour de l'Innocent et du Sage"), "accords monde 12 : autour de l'Innocent et du Sage");
const p7 = ctx.synth(ctx.M7, ['Aphrodite', 'Hestia', ...Object.keys(ctx.M7).filter(k => k !== 'Aphrodite' && k !== 'Hestia')], all(ctx.M7, 200), 10)[0];
ok(p7.includes("autour d'Aphrodite et d'Hestia"), "accords monde 7 : autour d'Aphrodite et d'Hestia");
ok(/peu contrasté/.test(flatTxt), 'profil plat détecté (indice < 130)');

// 5. PWA : fichiers et cohérence des versions
const path = require('path'), root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
ok(manifest.display === 'standalone' && manifest.start_url && manifest.name, 'manifest : champs essentiels');
const pngSize = f => { const b = fs.readFileSync(path.join(root, f)); return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20); };
manifest.icons.forEach(i => ok(fs.existsSync(path.join(root, i.src)) && pngSize(i.src) === i.sizes, `icône ${i.src} (${i.purpose}) = ${i.sizes}`));
ok(manifest.icons.some(i => i.purpose === 'maskable') && manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'any'), 'icônes 512 any + maskable');
ok(/rel="manifest" href="manifest.json"/.test(html) && /rel="apple-touch-icon"/.test(html), 'index.html : lien manifest + apple-touch-icon');
ok(pngSize('icons/apple-touch-icon.png') === '180x180', 'apple-touch-icon 180x180');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const swVersion = sw.match(/CACHE_VERSION = '([^']+)'/)[1];
const appVersion = html.match(/APP_VERSION = '([^']+)'/)[1];
ok(swVersion === appVersion, `version sw.js (${swVersion}) = APP_VERSION (${appVersion})`);
const shellBlock = sw.match(/const SHELL = \[([\s\S]*?)\];/)[1];
const shell = [...shellBlock.matchAll(/'\.\/([^']*)'/g)].map(m => m[1] || 'index.html');
shell.forEach(f => ok(fs.existsSync(path.join(root, f)), `SHELL : ${f} existe`));

// 6. Banque de questions : structure et charte de style
const cp = require('child_process');
const style = cp.spawnSync('node', [path.join(__dirname, 'style-check.js')], { encoding: 'utf8' });
ok(style.status === 0, 'charte de style respectée (tools/style-check.js)' + (style.status ? '\n' + style.stdout : ''));
for (const w of ['12', '7']) {
  const keys = Object.keys(w === '12' ? ctx.M12 : ctx.M7);
  const bank = vm.runInContext('BANK_' + w, ctx);
  const bad = bank.filter(q => q.o.length !== 4 || new Set(q.o.map(o => o[1])).size !== 4 || q.o.some(o => o[1] === o[2] || !keys.includes(o[1]) || !keys.includes(o[2])));
  ok(bank.length === 100 && bad.length === 0 && new Set(bank.map(q => q.id)).size === 100, `monde ${w} : 100 questions valides (4 options, principaux distincts, ids uniques)`);
}

console.log(fail ? `\n${fail} ÉCHEC(S)` : '\nTous les tests passent');
process.exit(fail ? 1 : 0);
