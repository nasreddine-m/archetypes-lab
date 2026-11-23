// Test de bout en bout avec faux DOM. Usage : node tools/smoke.js
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const els = {};
function el(id) {
  return els[id] || (els[id] = {
    id, textContent: '', innerHTML: '', value: 'Test', checked: false, style: {}, children: [], dataset: {},
    classList: { _s: new Set(), add(...c) { c.forEach(x => this._s.add(x)); }, remove(...c) { c.forEach(x => this._s.delete(x)); }, toggle(c, f) { f ? this._s.add(c) : this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    appendChild(c) { this.children.push(c); },
    getContext() { return new Proxy({}, { get: () => () => {}, set: () => true }); },
  });
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
vm.runInContext(script + `;this.S=state;this.start=startQuiz;this.choose=chooseOption;this.skip=skipQuestion;this.setU=setUniverse;this.duo=prepareDuoCompare;`, ctx);

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

console.log(fail ? `\n${fail} ÉCHEC(S)` : '\nTous les tests passent');
process.exit(fail ? 1 : 0);
