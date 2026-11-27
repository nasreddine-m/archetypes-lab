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
  setInterval: () => 1, clearInterval: () => {}, setTimeout: () => 1, clearTimeout: () => {},
  navigator: {}, location: { protocol: 'file:' },
};
vm.createContext(ctx);
vm.runInContext(script + `;this.S=state;this.start=startQuiz;this.choose=chooseOption;this.skip=skipQuestion;this.setU=setUniverse;this.duo=prepareDuoCompare;this.synth=buildSynthesis;this.M12=META_12;this.M7=META_7;this.SYN=SYNTH;this.setLen=setLength;this.setMode=selectMode;this.eff=effectiveLength;this.strength=profileStrength;this.randTop=randomTopFor;this.refine=refineSession;this.refineN=refineCount;this.hist=loadHistory;this.openH=openHistory;this.delH=deleteHistory;this.clrH=clearHistory;this.shareText=buildShareText;this.card=drawShareCard;this.stamp=stampSvg;this.icons=STAMP_ICONS;this.figs=FIGURES;this.openFK=openFicheKey;this.closeF=closeFiche;this.mailUrl=buildEmailUrl;this.baseProfile=baseProfile;this.baseText=buildBaseText;this.openCat=openCatalog;this.histAll=loadHistoryAll;this.dateFull=fullDateLabel;this.typedName=typedName;this.renderH=renderHistory;this.setCat=setCatalog;this.startCat=startFromCatalog;this.B12=BANK_12;this.B7=BANK_7;this.pdf=buildPdf;this.rep=buildReportContent;this.drawRep=drawReport;this.landing=renderLanding;this.goLand=goLanding;this.goHome=goHome;this.archColor=archColor;this.colors=ARCH_COLORS;`, ctx);

let fail = 0;
const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + m); if (!c) fail++; };

ctx.setLen(10); // les tests historiques supposent 10 questions

// 1. Parcours complet monde 12, toujours l'option 0
for (const u of ['12', '7']) {
  ctx.setU(u); els.rankingList && (els.rankingList.children = []);
  ctx.start();
  for (let i = 0; i < ctx.S.total; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[0][1], q.o[0][2]); }
  ok(!els.viewResult.classList.contains('hidden'), `monde ${u} : écran résultats affiché`);
  ok(ctx.S.answered.length === 10 && ctx.S.total === 10, `monde ${u} : 10 réponses comptées`);
  ok(els.resSignature.textContent.includes('—'), `monde ${u} : signature = "${els.resSignature.textContent}"`);
  ok(els.rankingList.children.length === (u === '12' ? 12 : 7), `monde ${u} : classement complet`);
}

// 2. Chrono expiré sur 3 questions
ctx.setU('12'); ctx.start();
for (let i = 0; i < ctx.S.total; i++) { const q = ctx.S.questions[ctx.S.idx]; i < 3 ? ctx.skip() : ctx.choose(q.o[1][1], q.o[1][2]); }
ok(ctx.S.answered.length === 7, '3 expirées : 7 réponses comptées');
ok(/3 questions sans réponse/.test(els.resSummary.innerHTML), 'mention des 3 questions sans réponse');
const total = Object.values(ctx.S.scores).reduce((a, b) => a + b, 0);
ok(total === 7 * 3, `aucun point pour les questions expirées (total brut ${total} = 21)`);

// 3. Tout expiré
ctx.start();
for (let i = 0; i < ctx.S.total; i++) ctx.skip();
ok(!els.viewHome.classList.contains('hidden') && !els.notice.classList.contains('hidden'), 'tout expiré : retour accueil + message');

// 3b. Longueurs de session (10 / 20 / 30), modes limités, mode mixte, doublons
const finish = () => { for (let i = 0; i < ctx.S.total; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[0][1], q.o[0][2]); } };
for (const u of ['12', '7']) {
  for (const n of [10, 20, 30]) {
    ctx.setU(u); ctx.setMode('decl'); ctx.setLen(n); ctx.start();
    ok(ctx.S.total === n && new Set(ctx.S.questions.map(q => q.id)).size === n, `monde ${u} Déclaratif ${n} : ${n} questions distinctes`);
    ok(els.qCounter.textContent === `Question 1 / ${n}`, `compteur « ${els.qCounter.textContent} »`);
    finish();
    ok(ctx.S.answered.length === n && !els.viewResult.classList.contains('hidden'), `monde ${u} ${n} : session terminée, ${n} réponses`);
  }
}
for (const [u, cap] of [['12', 22], ['7', 21]]) {
  ctx.setU(u); ctx.setMode('miroir'); ctx.setLen(30);
  ok(ctx.eff(u, 'miroir', 30) === cap && /\(${cap} questions\)/.test(els.startBtn.textContent) || els.startBtn.textContent.includes('(' + cap + ' questions)'), `monde ${u} Miroir limité à ${cap} (bouton : « ${els.startBtn.textContent} »)`);
  ok(/ne compte que/.test(els.lenNote.textContent), 'note de limitation affichée');
  ctx.start(); ok(ctx.S.total === cap && new Set(ctx.S.questions.map(q => q.id)).size === cap, `monde ${u} Miroir 30 : ${cap} questions distinctes`);
  finish();
}
ctx.setU('12'); ctx.setMode('mix'); ctx.setLen(30); ctx.start();
ok(ctx.S.total === 30 && ctx.S.questions.filter(q => q.m === 'Déclaratif').length === 15 && ctx.S.questions.filter(q => q.m === 'Observation').length === 15, 'mode mixte 30 : 15 déclaratives + 15 observation');
finish();
ctx.setMode('random'); ctx.setLen(20); ctx.start();
ok(ctx.S.total === 20 && new Set(ctx.S.questions.map(q => q.id)).size === 20, 'tirage intégral 20 : 20 questions distinctes');
finish();
ctx.setMode('dilemme'); ctx.setLen(30); ctx.start();
ok(ctx.S.total === 27 && ctx.S.questions.every(q => q.t === 'dilemme'), 'dilemmes 30 (monde 12) : limité à 27, tous de type dilemme');
finish();
ok(store['arch_length'] === '30', 'longueur mémorisée (localStorage)');
ctx.setMode('decl'); ctx.setLen(10);

// 4. Duo
ctx.start();
for (let i = 0; i < ctx.S.total; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[2][1], q.o[2][2]); }
ctx.duo();
ctx.start();
for (let i = 0; i < ctx.S.total; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[3][1], q.o[3][2]); }
ok(!els.duoDiagnostic.classList.contains('hidden') && /Passage 1/.test(els.duoDiagnostic.innerHTML), 'duo : diagnostic affiché');
ok(/10 réponses/.test(els.duoDiagnostic.innerHTML), 'duo : nombre de réponses affiché pour chaque passage');
ctx.setLen(30); ok(ctx.S.length === 10, 'duo : longueur verrouillée (setLen ignoré)');

// 4b. Synthèse du profil
const bare = n => n.replace(/^(Le |La |L')/, ''); // le texte écrit « du Sage », « de la Reine », « de l'Innocent »
ok(els.synthText.children.length === 4, 'synthèse affichée : tampon + 3 paragraphes dans la page');
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
      if (/ de (Le|La|L'|Les) | d'(Le|La|L')|de L'|de Le |de La /.test(txt)|| txt.includes('undefined') || txt.includes('NaN') || !txt.includes(bare(meta[a].full)) || !txt.includes(bare(meta[b].full))) bad++;
    }
  }
  ok(bad === 0, `monde ${w} : ${n} synthèses (toutes paires, profil marqué et plat) sans texte manquant`);
}
const flatTxt = ctx.synth(ctx.M12, Object.keys(ctx.M12), Object.fromEntries(Object.keys(ctx.M12).map(k => [k, 100])), 10, 'flat')[0];
const all = (meta, v) => Object.fromEntries(Object.keys(meta).map(k => [k, v]));
const p12 = ctx.synth(ctx.M12, ['Amant', 'Sage', ...Object.keys(ctx.M12).filter(k => k !== 'Amant' && k !== 'Sage')], all(ctx.M12, 200), 10)[0];
ok(p12.includes("autour de l'Amant et du Sage"), "accords monde 12 : autour de l'Amant et du Sage");
const p7 = ctx.synth(ctx.M7, ["L'Amante", 'La Mystique', ...Object.keys(ctx.M7).filter(k => k !== "L'Amante" && k !== 'La Mystique')], all(ctx.M7, 200), 10)[0];
ok(p7.includes("autour de l'Amante et de la Mystique"), "accords monde 7 : autour de l'Amante et de la Mystique");
ok(/dominante nette|se détache vraiment/.test(flatTxt) && !/hasard/.test(flatTxt) && /Quelques questions de plus/.test(flatTxt), 'profil plat : texte « équilibré », sans mention du hasard, avec invitation à affiner');

// 4c. Force du profil : seuils calibrés sur des réponses au hasard
const t12 = ctx.randTop('12', 10);
ok(ctx.strength('12', 10, t12.p75 - 1) === 'flat' && ctx.strength('12', 10, t12.p75) === 'moderate' && ctx.strength('12', 10, t12.p95) === 'clear', 'force du profil : flat / moderate / clear aux seuils (monde 12, 10 q.)');
ok(ctx.randTop('12', 22).p50 === ctx.randTop('12', 20).p50 && ctx.randTop('7', 26).p50 === ctx.randTop('7', 30).p50, 'seuils : longueur voisine la plus proche (22 → 20, 26 → 30)');
const k12 = Object.keys(ctx.M12), ord12 = ['Sage', 'Magicien', ...k12.filter(k => k !== 'Sage' && k !== 'Magicien')];
const adjHi = Object.fromEntries(k12.map(k => [k, 80])); adjHi.Sage = 300; adjHi.Magicien = 250;
const modTxt10 = ctx.synth(ctx.M12, ord12, adjHi, 10, 'moderate').join(' ');
const modTxt30 = ctx.synth(ctx.M12, ord12, adjHi, 30, 'moderate').join(' ');
ok(/(à confirmer|fragile) : quelques questions de plus/.test(modTxt10) && /sans être tranchée\./.test(modTxt30) && !/questions de plus/.test(modTxt30) && !/hasard/.test(modTxt10), 'synthèse « modérée » : invite à affiner avant 30 questions seulement');

// 4d. Affiner : continuer la même session avec des questions nouvelles
const finishAll = () => { while (ctx.S.idx < ctx.S.total) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[0][1], q.o[0][2]); } };
ctx.setU('7'); ctx.setU('12');   // change d'univers pour clore le Duo laissé actif par le test précédent
ctx.setMode('decl'); ctx.setLen(10); ctx.start(); finishAll();
ok(ctx.refineN() === 10 && !els.refineCard.classList.contains('hidden') && /\+10 questions/.test(els.refineBtn.textContent), 'affiner : « +10 questions » proposé après un aperçu');
ok(/trait vertical/.test(els.rankLegend.textContent) && /229/.test(els.rankLegend.textContent), 'légende du classement : repère du hasard affiché (229 pour 10 q., monde 12)');
const sumBefore = Object.values(ctx.S.scores).reduce((a, b) => a + b, 0), sid = ctx.S.historyId;
ctx.refine();
ok(ctx.S.total === 20 && ctx.S.idx === 10 && els.qCounter.textContent === 'Question 11 / 20', 'affiner : session prolongée à 20 (Question 11 / 20)');
ok(new Set(ctx.S.questions.map(q => q.id)).size === 20, 'affiner : 20 questions toutes distinctes');
finishAll();
ok(ctx.S.answered.length === 20 && !els.viewResult.classList.contains('hidden') && Object.values(ctx.S.scores).reduce((a, b) => a + b, 0) > sumBefore, 'affiner : 20 réponses, scores additionnés, résultats ré-affichés');
ctx.refine(); finishAll();
ok(ctx.S.total === 30 && ctx.S.answered.length === 30 && ctx.refineN() === 0 && els.refineCard.classList.contains('hidden'), 'affiner : plafond à 30 questions, plus de proposition');
ok(ctx.hist().filter(e => e.id === sid).length === 1 && ctx.hist().find(e => e.id === sid).answered === 30, 'historique : une seule entrée pour la session affinée (30 réponses)');
ctx.setMode('mix'); ctx.setLen(10); ctx.start(); finishAll();
ok(ctx.refineN() === 10, 'affiner (mode mixte) : +10 proposé');
ctx.refine();
ok(ctx.S.total === 20 && ctx.S.questions.filter(q => q.m === 'Déclaratif').length === 10 && ctx.S.questions.filter(q => q.m === 'Observation').length === 10, 'affiner (mode mixte) : reste 10 déclaratives + 10 observation');
finishAll();
ctx.setMode('miroir'); ctx.setLen(20); ctx.start(); finishAll();
ok(ctx.refineN() === 0, 'affiner : refusé en Miroir (2 questions restantes sur 22, moins de 5)');

// 4e. Historique local
for (let i = 0; i < 104; i++) { ctx.setMode('decl'); ctx.setLen(10); ctx.start(); finishAll(); }
ok(ctx.hist().length === 100, 'historique : plafonné à 100 entrées');
const hid = ctx.hist()[3].id;
ctx.openH(hid);
ok(!els.viewResult.classList.contains('hidden') && /Retour/.test(els.backBtn.textContent) && els.refineCard.classList.contains('hidden') && els.duoBtn.classList.contains('hidden'), 'historique : réouverture sans « Affiner » ni Duo, bouton Retour');
const nH = ctx.hist().length; ctx.delH(hid);
ok(ctx.hist().length === nH - 1 && !ctx.hist().some(e => e.id === hid), 'historique : suppression d\'une entrée');
ctx.clrH(); ok(ctx.hist().length > 0, 'historique : « Tout effacer » demande une confirmation');
ctx.clrH(); ok(ctx.hist().length === 0, 'historique : effacé au second appui');

// 4f. Partage
ctx.setMode('decl'); ctx.setLen(10); ctx.start(); finishAll();
const rr = ctx.S.lastResult, st = ctx.shareText(rr);
ok(st.includes(rr.subject) && st.includes('https://nasreddine-m.github.io/archetypes-lab/') && /pas un diagnostic/.test(st) && /Moteur :/.test(st), 'partage : texte avec sujet, moteur, ombre, lien et mention');
const cv = ctx.card(rr);
ok(cv.width === 1080 && cv.height === 1350, 'partage : carte 1080 x 1350 dessinée sans erreur');

// 4g. Tampon, figures associées, fiches de profil type, e-mail
const allKeys = [...Object.keys(ctx.M12), ...Object.keys(ctx.M7)];
const fullName = k => (ctx.M12[k] || ctx.M7[k]).full;
ok(allKeys.length === 19 && allKeys.every(k => ctx.icons[k] && ctx.icons[k].length > 40), 'tampon : un emblème dessiné pour chacun des 19 archétypes');
const svgs = allKeys.map(k => ctx.stamp(k, fullName(k), 100));
const stampIds = svgs.flatMap(sv => [...sv.matchAll(/id="(st\d+[ab])"/g)].map(m => m[1]));
ok(svgs.every((sv, i) => sv.includes('<svg') && sv.includes('</svg>') && sv.includes(fullName(allKeys[i]).toUpperCase())) && new Set(stampIds).size === stampIds.length, 'tampon : 19 SVG complets, nom en majuscules, identifiants de tracé uniques');
ok(Object.keys(ctx.figs).every(k => ctx.M12[k]) && !ctx.figs['Bouffon'] && !Object.keys(ctx.M7).some(k => ctx.figs[k]), 'figures : seulement des archétypes du monde 12, aucune pour Bouffon ni pour les Princesses');
const adjS = Object.fromEntries(k12.map(k => [k, 80])); adjS.Sage = 300; adjS.Magicien = 250;
const txtSage = ctx.synth(ctx.M12, ['Sage', 'Magicien', ...k12.filter(k => k !== 'Sage' && k !== 'Magicien')], adjS, 20).join(' ');
ok(txtSage.includes('associés au Sage (repères culturels) : Albert Einstein'), 'synthèse : figures associées au n° 1, avec la mention « repères culturels »');
const txtBouf = ctx.synth(ctx.M12, ['Bouffon', 'Sage', ...k12.filter(k => k !== 'Sage' && k !== 'Bouffon')], adjS, 20).join(' ');
ok(!/Personnages souvent associés/.test(txtBouf), 'synthèse : aucune figure inventée pour un archétype sans source (Bouffon)');
ctx.setU('12'); ctx.setMode('decl'); ctx.setLen(10); ctx.start(); finishAll();
const top1k = ctx.S.lastResult.order[0];
ctx.openFK(top1k, '12');
ok(!els.viewFiche.classList.contains('hidden') && els.viewResult.classList.contains('hidden') && els.ficheName.textContent === fullName(top1k) && els.ficheStamp.innerHTML.includes('<svg'), 'fiche : ouverture du profil type avec son tampon');
ok(els.ficheBody.children.length >= 8, 'fiche : 4 sections (titre + texte) au minimum');
ctx.closeF();
ok(els.viewFiche.classList.contains('hidden') && !els.viewResult.classList.contains('hidden'), 'fiche : retour au résultat');
ctx.openFK('La Sage', '7');
ok(els.ficheName.textContent === 'La Sage' && !/Personnages souvent associés/.test(els.ficheBody.children.map(c => c.textContent).join(' ')), 'fiche Princesses : ouverture sans figure associée');
ctx.closeF();
const mail = ctx.mailUrl(ctx.S.lastResult);
ok(mail.startsWith('mailto:?subject=') && mail.length < 1950 && decodeURIComponent(mail).includes('pas un diagnostic') && decodeURIComponent(mail).includes('nasreddine-m.github.io/archetypes-lab'), 'e-mail : lien mailto avec sujet, texte, mention et lien, moins de 1950 caractères');

// 4h. Page d'accueil, navigation, palette élargie, rapport PDF
ok(/id="viewLanding"/.test(html) && /id="homeBtn"/.test(html) && /id="viewHome" class="hidden"/.test(html), 'accueil : page d\'accueil présente, réglages masqués au départ, bouton Accueil dans l\'en-tête');
const landingHtml = html.slice(html.indexOf('id="viewLanding"'), html.indexOf('<!-- HOME VIEW -->'));
ok(['Déclaratif pur', 'Observation pure', 'Mixte équilibré', 'Dilemmes &amp; pression', 'Miroir social', 'Tirage intégral', 'Aperçu', 'Standard', 'Approfondi', 'Duo', 'affiner', 'Les 7 Figures', 'Les 12 Figures', 'rapport PDF'].every(t => landingHtml.includes(t)), 'accueil : concept, deux univers, six modes, longueurs, Duo, affiner et rapport expliqués');
ctx.landing();
ok((els.landOrb.innerHTML.match(/class="petal"/g) || []).length === 12 && els.dots12.children.length === 12 && els.dots7.children.length === 7, 'accueil : illustration (rosace de 12 pétales) et pastilles 12 / 7');
ctx.goHome();
ok(!els.homeBtn.classList.contains('hidden') && els.viewLanding.classList.contains('hidden') && !els.viewHome.classList.contains('hidden'), 'navigation : bouton Accueil visible hors de la page d\'accueil');
ctx.goLand();
ok(els.homeBtn.classList.contains('hidden') && !els.viewLanding.classList.contains('hidden') && els.viewHome.classList.contains('hidden'), 'navigation : retour à la page d\'accueil, bouton masqué');
ctx.goHome(); ctx.setU('7'); ctx.setU('12'); ctx.setMode('decl'); ctx.setLen(10); ctx.start();
{ const q0 = ctx.S.questions[ctx.S.idx]; ctx.choose(q0.o[0][1], q0.o[0][2]); }
ctx.goLand();
ok(!els.viewQuiz.classList.contains('hidden') && /Quitter la session/.test(els.homeBtnLabel.textContent), 'navigation : en pleine session, le premier appui demande confirmation');
ctx.goLand();
ok(els.viewQuiz.classList.contains('hidden') && !els.viewLanding.classList.contains('hidden') && els.homeBtnLabel.textContent === 'Accueil', 'navigation : le second appui ramène à l\'accueil');
ctx.goHome();

const hexLum = hx => { const l = [1, 3, 5].map(i => { const v = parseInt(hx.slice(i, i + 2), 16) / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
const cr = (x, y) => { const p = hexLum(x), q = hexLum(y); return (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05); };
const allK = [...Object.keys(ctx.M12), ...Object.keys(ctx.M7)];
ok(allK.every(k => ctx.colors[k] && /^#[0-9a-f]{6}$/.test(ctx.colors[k][0]) && /^#[0-9a-f]{6}$/.test(ctx.colors[k][1])), 'palette : une couleur sombre et une couleur papier pour chacun des 19 archétypes');
ok(allK.every(k => cr(ctx.colors[k][0], '#1c2846') >= 6 && cr(ctx.colors[k][1], '#fbf8f3') >= 3.5), 'palette : contraste ≥ 6:1 sur le fond bleu nuit et ≥ 3,5:1 sur le papier (éléments graphiques : 3:1 requis)');

ctx.setMode('decl'); ctx.setLen(10); ctx.start(); for (let i = 0; i < ctx.S.total; i++) { const q = ctx.S.questions[ctx.S.idx]; ctx.choose(q.o[i % 4][1], q.o[i % 4][2]); }
const rrr = ctx.S.lastResult, rc2 = ctx.rep(rrr);
ok(rc2.strengths.length === 3 && rc2.work.length === 3 && rc2.lecture.length > 50 && rc2.title.includes((ctx.M12[rrr.order[0]] || ctx.M7[rrr.order[0]]).full) && rc2.reliability.includes(String(rrr.answeredCount)), 'rapport : 3 points forts, 3 points à travailler, lecture, fiabilité et titre');
const fake = new Uint8Array(60); fake[0] = 0xFF; fake[1] = 0xD8; fake[58] = 0xFF; fake[59] = 0xD9; for (let i = 2; i < 58; i++) fake[i] = i;
const pdfBuf = Buffer.from(ctx.pdf(fake, 100, 141, 'Rapport é'));
const pdfTxt = pdfBuf.toString('latin1');
const xrefPos = Number(pdfTxt.match(/startxref\n(\d+)/)[1]);
const entries = [...pdfTxt.slice(xrefPos).matchAll(/(\d{10}) 00000 n /g)].map(m => Number(m[1]));
ok(pdfTxt.startsWith('%PDF-1.4') && pdfTxt.trimEnd().endsWith('%%EOF') && pdfTxt.slice(xrefPos, xrefPos + 4) === 'xref' && (pdfTxt.match(/\/Type \/Page /g) || []).length === 1 && /MediaBox \[0 0 595.28 841.89\]/.test(pdfTxt), 'PDF : en-tête, une seule page A4, tableau xref localisé');
ok(entries.length === 6 && entries.every((off, i) => pdfTxt.slice(off).startsWith(`${i + 1} 0 obj`)), 'PDF : les 6 décalages du tableau xref pointent chacun sur son objet');
const streamAt = pdfBuf.indexOf('stream\n', pdfBuf.indexOf('/Subtype /Image')) + 7;
ok(/\/Length 60 /.test(pdfTxt) && pdfBuf.subarray(streamAt, streamAt + 60).equals(Buffer.from(fake)) && /Filter \/DCTDecode/.test(pdfTxt) && /Title <FEFF/.test(pdfTxt), 'PDF : image JPEG intacte, longueur exacte, titre encodé en UTF-16');
const repPromise = ctx.drawRep(rrr);

// 4i. Alternance crème / bleu nuit et icônes
{
  const ids = [...html.matchAll(/<symbol id="(i-[a-z]+)"/g)].map(m => m[1]);
  const used = [...html.matchAll(/<use href="#(i-[a-z]+)"/g)].map(m => m[1]);
  ok(ids.length >= 18 && used.length >= 15 && used.every(u => ids.includes(u)), 'icônes : chaque icône utilisée existe dans le sprite (' + used.length + ' emplois, ' + ids.length + ' icônes)');
  const bands = [...landingHtml.matchAll(/<section class="land-sec( paper)?/g)].map(m => !!m[1]);
  ok(bands.length === 5 && bands.every((p, i) => i === 0 ? p : p !== bands[i - 1]), 'accueil : les bandes alternent crème et bleu nuit');
  ok(/\.paper \{[^}]*--text: #0f2a2e/.test(html) && /class="card paper"/.test(html) && !/classList\.toggle\('paper'/.test(html), 'alternance : surfaces crème sur les autres pages, la carte de question reste en bleu nuit');
}

// 4j. Migration de l'historique enregistré avant v0.15.0 (anciens noms de déesses)
{
  const old = ['Athéna', 'Artémis', 'Hestia', 'Héra', 'Déméter', 'Perséphone', 'Aphrodite'];
  store['arch_history'] = JSON.stringify([{ id: 424242, universe: '7', mode: 'decl', modeLabel: 'Déclaratif pur', subject: 'Test', total: 10, answered: 10, adj: Object.fromEntries(old.map((k, i) => [k, 200 - i * 20])), order: old, v: 'v0.14.1' }]);
  const e0 = ctx.hist()[0];
  ok(e0.order[0] === 'La Sage' && e0.order[6] === "L'Amante" && Object.keys(e0.adj).every(k => ctx.M7[k]) && e0.order.every(k => ctx.M7[k]), 'historique : les anciens noms de déesses sont convertis à la lecture');
  ctx.openH(424242);
  ok(!els.viewResult.classList.contains('hidden') && /Sage/.test(els.resSignature.textContent), "historique : un ancien résultat s'ouvre avec les nouveaux noms");
  delete store['arch_history'];
  ctx.goHome();
}

// 4k. Monde 12 = 12 archétypes masculins (v0.16.0)
{
  const male = ['Roi', 'Père', 'Guerrier', 'Magicien', 'Amant', 'Sage', 'Explorateur', 'Créateur', 'Héros', 'Rebelle', 'Bouffon', 'Soignant'];
  ok(JSON.stringify(Object.keys(ctx.M12).sort()) === JSON.stringify(male.slice().sort()), 'monde 12 : les 12 profils masculins (Roi, Père, Guerrier, Magicien, Amant, Sage, Explorateur, Créateur, Héros, Rebelle, Bouffon, Soignant)');
  ok(!('Innocent' in ctx.M12) && !('Homme ordinaire' in ctx.M12) && !('Innocent' in ctx.SYN) && !('Homme ordinaire' in ctx.SYN), "monde 12 : plus d'Innocent ni d'Homme ordinaire");
  const badTag = ctx.B12.some(q => q.o.some(o => !ctx.M12[o[1]] || !ctx.M12[o[2]] || o[1] === o[2]));
  ok(!badTag, 'banque 12 : toutes les cibles principales et secondaires sont des profils masculins, jamais identiques');
  ok(ctx.B12.every(q => new Set(q.o.map(o => o[1])).size === 4), 'banque 12 : quatre cibles principales distinctes dans chaque question');
  const w = Object.fromEntries(male.map(k => [k, 0]));
  ctx.B12.forEach(q => q.o.forEach(o => { w[o[1]] += 2; w[o[2]] += 1; }));
  const ws = Object.values(w);
  ok(Math.max(...ws) / Math.min(...ws) <= 1.4 && w['Guerrier'] >= 80 && w['Père'] >= 80, 'banque 12 : équilibre des poids (max/min ≤ 1,4 ; Père et Guerrier bien représentés)');
  store['arch_history'] = JSON.stringify([{ id: 777, universe: '12', mode: 'decl', modeLabel: 'x', subject: 't', total: 10, answered: 10, adj: {}, order: ['Souverain', 'Innocent', 'Sage', 'Homme ordinaire', 'Magicien', 'Hors-la-loi', 'Explorateur', 'Créateur', 'Héros', 'Protecteur', 'Amoureux', 'Bouffon'], v: 'v0.15.0' }]);
  ok(ctx.hist().length === 0 && ctx.histAll().length === 1, 'historique : un ancien résultat du monde mixte reste conservé mais n\'est plus ouvrable');
  delete store['arch_history'];
}

// 4l. Catalogue des figures : lire les profils sans passer le test
{
  ctx.goLand();
  ok(/sans passer le test/.test(landingHtml) && /openCatalog\(\)/.test(landingHtml), "catalogue : accessible depuis l'accueil");
  const qBefore = ctx.S.answered.length;
  ctx.openCat('12');
  ok(!els.viewCatalog.classList.contains('hidden') && els.viewLanding.classList.contains('hidden') && els.viewQuiz.classList.contains('hidden'), "catalogue : la page s'ouvre sans lancer de session");
  ok(els.catalogList.children.length === 12 && /Le Roi/.test(els.catalogList.children[0].innerHTML) && /Le Guerrier/.test(els.catalogList.children.map(c => c.innerHTML).join(' ')), 'catalogue : les 12 figures masculines sont listées avec leur tampon');
  ctx.setCat('7');
  ok(els.catalogList.children.length === 7 && /La Sage/.test(els.catalogList.children.map(c => c.innerHTML).join(' ')) && els.btnCat7.classList.contains('active') && !els.btnCat12.classList.contains('active'), 'catalogue : bascule vers les 7 figures féminines');
  els.catalogList.children[0].onclick();   // La Reine ouvre la liste féminine (ordre du radar)
  ok(!els.viewFiche.classList.contains('hidden') && els.viewCatalog.classList.contains('hidden') && els.ficheName.textContent === 'La Reine' && els.ficheBack.textContent === 'Retour aux figures', 'catalogue : une figure ouvre sa fiche, avec le retour « aux figures »');
  ctx.closeF();
  ok(!els.viewCatalog.classList.contains('hidden') && els.viewFiche.classList.contains('hidden') && els.viewResult.classList.contains('hidden'), 'catalogue : le retour ramène au catalogue, pas aux résultats');
  ctx.startCat();
  ok(!els.viewHome.classList.contains('hidden') && els.viewCatalog.classList.contains('hidden') && ctx.S.universe === '7', "catalogue : « Passer le test » ouvre les réglages de l'univers consulté");
  ok(ctx.S.answered.length === qBefore, 'catalogue : aucune réponse enregistrée pendant la consultation');
  ctx.openCat('12'); ctx.goLand();
  ok(els.viewCatalog.classList.contains('hidden') && !els.viewLanding.classList.contains('hidden'), 'catalogue : le bouton Accueil le ferme');
  ctx.openFK('Roi', '12');
  ok(els.ficheBack.textContent === 'Retour au résultat', 'fiche ouverte depuis un résultat : le bouton reste « Retour au résultat »');
  ctx.setU('12'); ctx.goHome();
}

// 4m. Historique : jour, date, heure et nom seulement s'il est saisi
{
  const d = new Date(2026, 10, 27, 14, 32).getTime();
  const lbl = ctx.dateFull(d);
  ok(/vendredi 27 novembre 2026/.test(lbl) && /14:32/.test(lbl), 'historique : jour, date complète et heure (« ' + lbl + ' »)');
  ok(ctx.typedName('Sophie') === 'Sophie' && ctx.typedName('  Marc ') === 'Marc' && ctx.typedName('Moi-même') === '' && ctx.typedName('moi-même') === '' && ctx.typedName('Profil') === '' && ctx.typedName('') === '', "historique : le nom n'est retenu que s'il est saisi (« Moi-même » et « Profil » ne comptent pas)");
  const k7 = Object.keys(ctx.M7);
  const mkE = (id, subject, universe, order) => ({ id, universe, mode: 'decl', modeLabel: 'Déclaratif pur', subject, total: 20, answered: 20, adj: Object.fromEntries(order.map((k, i) => [k, 200 - i * 10])), order, v: 'v0.17.1' });
  store['arch_history'] = JSON.stringify([
    mkE(d, 'Sophie', '7', k7),
    mkE(d - 86400000, 'Moi-même', '7', k7),
    mkE(d - 2 * 86400000, 'Moi-même', '12', ['Souverain', 'Innocent', 'Sage', 'Homme ordinaire', 'Magicien', 'Hors-la-loi', 'Explorateur', 'Créateur', 'Héros', 'Protecteur', 'Amoureux', 'Bouffon']),
  ]);
  ctx.renderH();
  const rows = els.historyList.children.map(r => r.children[0].children.map(c => c.textContent));
  ok(rows.length === 3 && els.historyCount.textContent === '3', "historique : trois résultats conservés et comptés, dont un de l'ancienne grille");
  ok(/vendredi 27 novembre 2026/.test(rows[0][0]) && /Pour Sophie/.test(rows[0][2]), 'historique : le nom saisi apparaît (« Pour Sophie ») avec le jour et la date');
  ok(/jeudi 26 novembre 2026/.test(rows[1][0]) && !/Pour /.test(rows[1][2]), 'historique : sans nom saisi, aucune mention de nom');
  ok(/Souverain — L'Innocent/.test(rows[2][1]) && /ancienne grille, lecture seule/.test(rows[2][2]), "historique : un résultat de l'ancienne grille garde ses anciens noms, en lecture seule");
  ctx.delH(d - 2 * 86400000);
  ok(ctx.histAll().length === 2, "historique : un résultat de l'ancienne grille peut être supprimé");
  delete store['arch_history'];
  ctx.renderH();
}

// 4n. Sécurité : politique de contenu et aucune ressource externe
{
  const csp = (html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  ok(/default-src 'self'/.test(csp) && /connect-src 'self'/.test(csp) && /object-src 'none'/.test(csp) && /form-action 'none'/.test(csp) && /base-uri 'self'/.test(csp), "sécurité : politique de contenu (rien d'externe, aucun envoi, pas d'objet, pas de formulaire)");
  const external = [...html.matchAll(/<(?:script|link|img|iframe|source)[^>]+(?:src|href)="(https?:[^"]+)"/g)].map(m => m[1]);
  ok(external.length === 0 && !/@import|url\(\s*['"]?https?:/.test(html), 'sécurité : aucune ressource externe chargée par la page (script, style, image, cadre)');
  ok(!/\beval\s*\(|new Function\s*\(|document\.write\s*\(/.test(script), "sécurité : ni eval, ni new Function, ni document.write dans le code de l'application");
}

// 4o. Questionnaire : aucune réponse en surbrillance sur écran tactile
{
  const css = html.slice(html.lastIndexOf('<style>'), html.lastIndexOf('</style>'));
  const rules = [...css.matchAll(/\.option-btn:(hover|active)[^{]*\{[^}]*\}/g)].map(m => m[0]);
  const lastTouch = css.slice(css.lastIndexOf('.option-btn:hover, .option-btn:active'));
  ok(/\.option-btn:hover, \.option-btn:active \{[^}]*background: none/.test(lastTouch), "questionnaire : au toucher, ni survol ni appui ne colorent une réponse");
  ok(/@media \(hover: hover\) and \(pointer: fine\) \{ \.option-btn:hover \{ background: var\(--accent-soft\); \} \}/.test(css), "questionnaire : le survol n'existe que pour une vraie souris");
  ok(rules.length >= 2, 'questionnaire : les règles de base existent toujours');
}

// 4p. Radar : les profils les plus proches sont voisins (circuit de longueur minimale sur les 6 critères)
{
  const { MASCULINS } = require('./profils-criteres.js');
  const { meilleurCircuit } = require('./ordre-radar.js');
  const ordre = Object.keys(ctx.M12).map(k => ctx.M12[k].full);
  const dd = (a, b) => MASCULINS[a].reduce((s, v, i) => s + Math.abs(v - MASCULINS[b][i]), 0);
  const longueur = ordre.reduce((s, a, i) => s + dd(a, ordre[(i + 1) % ordre.length]), 0);
  ok(ordre.every(n => MASCULINS[n]) && longueur === meilleurCircuit(MASCULINS).longueur, 'radar : l\'ordre des 12 figures est le circuit le plus court (longueur ' + longueur + ')');
  ok(Object.keys(ctx.M12).slice(0, 3).join() === 'Roi,Guerrier,Héros' && Object.keys(ctx.M12).slice(-3).join() === 'Amant,Soignant,Père', 'radar : Roi, Guerrier, Héros se suivent ; Amant, Soignant, Père terminent le tour');
}

// 4q. Radar féminin : les profils les plus proches sont voisins (circuit de longueur minimale)
{
  const { FEMININS } = require('./profils-criteres.js');
  const { meilleurCircuit } = require('./ordre-radar.js');
  const ordre = Object.keys(ctx.M7).map(k => ctx.M7[k].full);
  const dd = (a, b) => FEMININS[a].reduce((s, v, i) => s + Math.abs(v - FEMININS[b][i]), 0);
  const longueur = ordre.reduce((s, a, i) => s + dd(a, ordre[(i + 1) % ordre.length]), 0);
  ok(ordre.every(n => FEMININS[n]) && longueur === meilleurCircuit(FEMININS).longueur, "radar : l'ordre des 7 figures féminines est le circuit le plus court (longueur " + longueur + ')');
  ok(Object.keys(ctx.M7).join() === ["La Reine", "La Sage", "La Mystique", "La Chasseresse", "L'Amante", "La Curieuse", "La Mère"].join(), 'radar : ordre La Reine, La Sage, La Mystique, La Chasseresse, L\'Amante, La Curieuse, La Mère');
}

// 4r. « La Jeune fille » est devenue « La Curieuse » : les anciens résultats sont convertis
{
  const k7 = Object.keys(ctx.M7);
  const anciens = k7.map(k => k === 'La Curieuse' ? 'La Jeune fille' : k);
  store['arch_history'] = JSON.stringify([{ id: 31337, universe: '7', mode: 'decl', modeLabel: 'Déclaratif pur', subject: 'T', total: 10, answered: 10, adj: Object.fromEntries(anciens.map((k, i) => [k, 200 - i * 10])), order: anciens, v: 'v0.17.5' }]);
  const e = ctx.hist()[0];
  ok(e && e.order.includes('La Curieuse') && !e.order.includes('La Jeune fille') && Object.keys(e.adj).every(k => ctx.M7[k]), 'historique : « La Jeune fille » est convertie en « La Curieuse » à la lecture');
  ok(!('La Jeune fille' in ctx.M7) && ctx.M7['La Curieuse'] && !/Jeune fille/.test(html.replace('"La Jeune fille":"La Curieuse"', '')), 'monde 7 : plus aucune trace de « Jeune fille » dans l\'application, hors table de conversion');
  delete store['arch_history'];
}

// 4s. Matrice 12 x 12 des profils de base (tools/matrice-profils.js)
{
  const { ORDRE, FAMILLES, famille, profilDeBase, matrice } = require('./matrice-profils.js');
  const m = matrice();
  const cellules = [];
  m.forEach((row, i) => row.forEach((c, j) => { if (i !== j) cellules.push(c); }));
  const compte = Object.fromEntries(FAMILLES.map(f => [f, cellules.filter(c => c === f).length]));
  ok(JSON.stringify(ORDRE) === JSON.stringify(Object.keys(ctx.M12)), "matrice : les 12 figures sont dans l'ordre du radar de l'application");
  ok(m.length === 12 && m.every((r, i) => r.length === 12 && r[i] === null) && cellules.length === 132 && cellules.every(c => FAMILLES.includes(c)), 'matrice : 12 x 12, diagonale vide, 132 paires valides, chacune associée à un profil de base');
  ok(FAMILLES.every(f => compte[f] === 33), 'matrice : répartition parfaitement équilibrée (33 paires par profil de base)');
  ok(ORDRE.every(a => ORDRE.every(b => a === b || famille(a) !== famille(b) || profilDeBase(a, b) === famille(a))), 'matrice : deux figures de la même famille donnent toujours cette famille');
}

// 4t. Profil de base (alpha, bêta, sigma, gamma) dans l'appréciation du profil masculin
{
  const { ORDRE, matrice } = require('./matrice-profils.js');
  const m = matrice();
  let diff = 0;
  ORDRE.forEach((a, i) => ORDRE.forEach((b, j) => { if (ctx.baseProfile(a, b) !== m[i][j]) diff++; }));
  ok(diff === 0, "profil de base : l'application et la matrice documentée donnent la même réponse pour les 144 cases");
  const t = ctx.baseText('12', ['Héros', 'Sage', ...ORDRE.filter(k => k !== 'Héros' && k !== 'Sage')], 'clear');
  ok(t && t.profile === 'sigma' && /correspond à un profil sigma/.test(t.combo) && /relève plutôt de la famille alpha/.test(t.combo) && /fait pencher ton profil vers sigma/.test(t.combo), 'profil de base : Héros puis Sage = sigma, avec explication du basculement depuis la famille alpha');
  const t2 = ctx.baseText('12', ['Guerrier', 'Sage', ...ORDRE.filter(k => k !== 'Guerrier' && k !== 'Sage')], 'clear');
  ok(t2 && t2.profile === 'alpha' && !/relève plutôt/.test(t2.combo), "profil de base : Guerrier puis Sage = alpha, sans phrase de basculement");
  const t3 = ctx.baseText('12', ['Créateur', 'Roi', ...ORDRE.filter(k => k !== 'Créateur' && k !== 'Roi')], 'flat');
  ok(t3 && /indicatif/.test(t3.combo), 'profil de base : un profil peu contrasté est présenté comme indicatif');
  ok(['alpha', 'bêta', 'sigma', 'gamma'].every(p => ctx.baseText('12', ORDRE.filter(k => k !== 'x'), 'clear') !== undefined) && /Typologie populaire, informelle et non validée/.test(t.caution) && /varient beaucoup/.test(ctx.baseText('12', ['Créateur', 'Magicien', ...ORDRE.filter(k => k !== 'Créateur' && k !== 'Magicien')], 'clear').desc), 'profil de base : mise en garde « typologie informelle » ; le gamma signale que ses définitions varient');
  ok(ctx.baseText('7', Object.keys(ctx.M7), 'clear') === null, 'profil de base : aucun profil de base pour le monde féminin');
  // Affichage dans les résultats
  ctx.setU('12'); ctx.setMode('decl'); ctx.setLen(10); ctx.start(); finishAll();
  ok(!els.baseCard.classList.contains('hidden') && /^Profil (alpha|bêta|sigma|gamma)$/.test(els.baseName.textContent) && els.baseDesc.textContent.length > 40, 'profil de base : la carte est affichée à la fin d\'un test masculin, avec description');
  ctx.setU('7'); ctx.setMode('decl'); ctx.setLen(10); ctx.start(); finishAll();
  ok(els.baseCard.classList.contains('hidden'), 'profil de base : la carte est masquée à la fin d\'un test féminin');
  ctx.setU('12'); ctx.setMode('decl'); ctx.setLen(10); ctx.start(); finishAll();
  const rr = ctx.S.lastResult, rep = ctx.rep(rr);
  ok(/Profil de base : (alpha|bêta|sigma|gamma) \(typologie populaire, indicatif\)/.test(rep.lecture), 'rapport PDF : la lecture du profil mentionne le profil de base (monde masculin)');
  ctx.goHome();
}

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

repPromise.then(cv => { ok(cv.width === 1654 && cv.height === 2339, 'rapport : canvas A4 (1654 x 2339) dessiné sans erreur'); })
  .catch(e => ok(false, 'rapport : ' + e.message))
  .then(() => { console.log(fail ? `\n${fail} ÉCHEC(S)` : '\nTous les tests passent'); process.exit(fail ? 1 : 0); });
