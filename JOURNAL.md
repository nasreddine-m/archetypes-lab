# Journal de bord — Archétypes Lab

Objectif final : une application qui tourne sur **iOS (Safari / écran d'accueil)** et **Chrome** (desktop et Android).

## Résumé de l'évolution (à tenir à jour)

| Version | Date | Statut | En une ligne |
|---|---|---|---|
| v0.1.0 | 2026-11-23 | Base | Import de l'application d'origine (fichier unique), dépôt Git, outil de mesure d'équilibre |
| v0.2.0 | 2026-11-23 | Scoring | Indice ajusté par l'exposition de chaque archétype, chrono expiré sans point, départage aléatoire, correction Q33 (monde 7) |
| v0.3.0 | 2026-11-23 | PWA | Installable (manifeste, icônes, écran d'accueil iOS, bouton Installer Chrome), hors-ligne via service worker, version affichée |
| v0.4.0 | 2026-11-23 | Banque (publiée sur `main` pour test par l'auteur, relecture en cours) | 100 questions par univers (50 → 100), options rééquilibrées : rapport max/min des poids 3,68 → 1,24 (monde 12) et 1,61 → 1,12 (monde 7) |

**État actuel :** PWA statique (`index.html` + `manifest.json` + `sw.js` + `icons/`), 2 univers (12 Archétypes, 7 Déesses), 6 modes de tirage, radar canvas, comparaison Duo. Le biais de scoring est fortement réduit (en tête pour un répondant au hasard : 0,3–24 % → 6–13 % dans le monde 12) mais pas supprimé : le déséquilibre est dans la banque de questions elle-même. Tests réels (2026-11-23) : iPhone (Safari) OK — installation, ouverture, hors-ligne en mode avion ; Windows OK après une erreur DNS passagère (`DNS_PROBE_FINISHED_NXDOMAIN`, résolue en relançant, aucun défaut dans l'app). Installation depuis Chrome (icône « Installer ») et hors-ligne sur Windows non encore confirmés.

**Prochaine étape :** rééquilibrage de la banque de questions (backlog 2), seule vraie solution au biais résiduel, puis résultats enrichis (backlog 3).

**Procédure de release :** modifier `APP_VERSION` (index.html) et `CACHE_VERSION` (sw.js) avec la même valeur, lancer `node tools/smoke.js`, commit, push. Sans changement de version, les téléphones gardent l'ancienne version en cache.

---

## Journal des versions et modifications

### v0.4.0 — 2026-11-23 — Banque de 100 questions par univers (publiée pour test, relecture en cours)
- **+100 questions** : ids 51–100 dans chaque univers (25 Déclaratif + 25 Observation par univers). Les 50 questions d'origine sont inchangées. Brouillons dans `docs/drafts/`, relecture dans `docs/revue-questions-v0.4.0.md`.
- **Conception par plan d'équilibre** : pour chaque sous-ensemble de tirage (Déclaratif, Observation), les archétypes principaux et secondaires ont été planifiés avant la rédaction, de façon à compenser le déficit de chacun (ex. Innocent : principal dans 24 des 50 nouvelles questions du monde 12, contre 2 sur 50 avant). Plan des quadruplets du monde 7 calculé par script.
- **Reclassement honnête des types** : seules les vraies situations de stress ou de choix forcé portent le type `dilemme` ; les formulations « Que préserve-t-il coûte que coûte ? » remplacent les « renoncer à… » pour éviter la logique inversée (A15, ci-dessous).
- **Nouveaux outils** : `tools/merge-bank.js` (fusion d'un brouillon dans une copie d'`index.html` + validation : 4 options, principaux distincts, archétypes connus, ids uniques, pas de doublon d'énoncé), `tools/pools.js` (poids par sous-ensemble), `tools/make-review.js` (document de relecture). `tools/balance.js` simule aussi chaque mode de tirage.
- Version `v0.4.0` dans `index.html` et `sw.js`. `tools/smoke.js` : tous les tests passent.

| Mesure (répondant au hasard, scoring ajusté) | Avant (v0.3.0) | v0.4.0 | Cible |
|---|---|---|---|
| Monde 12 : rapport max/min des poids de la banque | 3,68 | **1,24** | < 1,3 |
| Monde 12 : part de l'archétype en tête (mode intégral) | 5,8–13,1 % | **6,1–10,7 %** | 6–11 % (idéal 8,3 %) |
| Monde 12 : égalité en tête | 9,6 % | 9,1 % | — |
| Monde 7 : rapport max/min des poids | 1,61 | **1,12** | — |
| Monde 7 : part en tête (mode intégral) | 11,9–15,9 % | **12,3–16,8 %** | idéal 14,3 % |
| Pools : Miroir Social monde 12 | 10 questions | **22** | ≥ 15 |
| Pools : Dilemmes (monde 12 / monde 7) | 15 / 15 | **27 / 28** | ≥ 15 |

**Limites connues :** (1) le pool *Dilemmes* du monde 12 reste déséquilibré (rapport 2,56 ; Héros 41 vs Créateur 17) car ses 15 questions d'origine sont très orientées ; en mode Dilemmes, la part en tête va de 4,9 % (Innocent) à 13,6 % (Amoureux). (2) Les nouvelles questions du monde 7 sont rédigées au féminin, comme les questions d'origine : le genre n'est pas neutralisé. (3) Des quadruplets très « doux » (Innocent, Amoureux, Bouffon, Homme ordinaire réunis) sont fréquents dans le monde 12, par construction : ils servent à compenser le déficit mais discriminent moins les archétypes « durs ». (4) Le contenu psychologique (représentativité de chaque option) n'a pas été validé hors de cette relecture.

### v0.3.0 — 2026-11-23 — PWA
- `manifest.json` : nom, mode `standalone`, portrait, couleurs `#0f172a`, 3 icônes (192, 512, 512 maskable).
- `sw.js` : service worker. Page : réseau d'abord (mises à jour récupérées en ligne), cache en secours hors-ligne. Icônes et manifeste : cache d'abord. Les anciens caches sont supprimés à l'activation.
- `icons/` : icône radar à 12 branches (fond `#0f172a`, profil `#d4a373`), générée par `tools/make-icons.ps1` ; variante maskable avec zone de sécurité ; `apple-touch-icon` 180 px pour l'écran d'accueil iOS.
- `index.html` : liens manifeste, icône Apple, `theme-color`, enregistrement du service worker (uniquement en http/https), version affichée en pied de page avec la mention « outil de réflexion personnelle, pas un diagnostic psychologique » (A4).
- `tools/smoke.js` vérifie maintenant : champs du manifeste, existence et dimensions réelles des icônes, cohérence `APP_VERSION` = `CACHE_VERSION`, existence de tous les fichiers du cache.
- Aucun changement de scoring ni de questions.

**Installer :** iPhone → ouvrir l'URL dans **Safari** → Partager → « Sur l'écran d'accueil ». Chrome (ordinateur, Android) → icône « Installer » dans la barre d'adresse.

### v0.2.0 — 2026-11-23 — Scoring
- **Indice ajusté** : le score brut de chaque archétype est divisé par son « exposition » (points qu'un répondant au hasard obtiendrait en moyenne sur les questions réellement répondues). Indice 100 = niveau du hasard. Les fonctions `computeExposure`, `adjustScores`, `rankKeys` sont dans `index.html` et testées par `tools/balance.js`.
- **Chrono expiré** : la question est passée sans point (avant : une option au hasard était enregistrée). Le nombre de questions non comptées est affiché dans les résultats. Si les 10 expirent, retour à l'accueil avec un message.
- **Égalités** : départage par indice, puis score brut, puis ordre aléatoire propre à la session (avant : l'ordre de déclaration favorisait Magicien et Sage). Une égalité entre les deux premiers est signalée dans les résultats.
- **Résultats** : le classement affiche l'indice (plus « pts ») avec une légende ; l'échelle du radar est fixée à un minimum de 200. Le duo mémorise l'ordre des archétypes du passage 1.
- **Q33 du monde 7** : deux options avaient Artémis en primaire ; « reconnaissance officielle » passe en Hestia (primaire) / Artémis (secondaire).
- `tools/balance.js` simule désormais le scoring brut et le scoring ajusté avec le code réel de l'application. Résultat : `docs/balance-v0.2.0.txt`.
- Vérifié par un test de bout en bout avec faux DOM (parcours complet des 2 mondes, chrono expiré partiel et total, duo). Test versionné : `node tools/smoke.js`.

| Répondant au hasard, archétype en tête | Brut (départage aléatoire) | Ajusté v0.2.0 | Idéal |
|---|---|---|---|
| Monde 12, plus fréquent / plus rare | Sage 23,8 % / Innocent 0,3 % | Bouffon 12,9 % / Souverain 5,6 % | 8,3 % |
| Monde 12, égalité en tête | 22,4 % | 9,4 % | — |
| Monde 7, plus fréquent / plus rare | Athéna 31,2 % / Héra 5,6 % | Perséphone 13,6 % / ≈ 12 % | 14,3 % |
| Monde 7, égalité en tête | 20,0 % | 3,6 % | — |

**Limite connue :** diviser par l'exposition amplifie le bruit sur les archétypes rares (Innocent n'est primaire que 2 fois sur 50 questions). Dans le monde 12, Bouffon, Amoureux et Innocent sont légèrement sur-représentés (11–13 %) et Sage, Magicien, Souverain sous-représentés (≈ 6 %). Le correctif de fond est de rééquilibrer la banque.

### v0.1.0 — 2026-11-23 — Base
- Import de `index.html` d'origine (copie intacte conservée dans `docs/index.v0.original.html`).
- Création du dépôt de travail `Archetypes-Lab` et du dépôt GitHub public `nasreddine-m/archetypes-lab`.
- Publication via GitHub Pages : https://nasreddine-m.github.io/archetypes-lab/ (branche `main`, racine).
- Ajout de `tools/balance.js` : mesure de l'équilibre des archétypes dans les banques de questions + simulation de 20 000 répondants aléatoires. Résultat de référence : `docs/balance-baseline.txt`.
- Aucune modification fonctionnelle de l'application.

---

## Arbitrages et décisions

| # | Date | Décision | Raison | Alternative écartée |
|---|---|---|---|---|
| A1 | 2026-11-23 | Cible multiplateforme = **PWA** (manifest + service worker + icônes), hébergée sur GitHub Pages | Un seul code pour iOS et Chrome, installable, hors-ligne, gratuit, pas de Mac requis | App native (Capacitor/Xcode) : exige un Mac et un compte Apple Developer (99 $/an). À reconsidérer seulement si l'App Store devient un objectif |
| A2 | 2026-11-23 | Rester sans framework ni build (HTML/CSS/JS vanilla) pour l'instant | Simplicité, déploiement direct sur Pages, code déjà fonctionnel | Réécriture React/Vue : coût élevé, aucun gain immédiat |
| A3 | 2026-11-23 | Dépôt GitHub **public** | GitHub Pages gratuit exige un dépôt public. Le code ne contient aucune donnée personnelle (résultats stockés localement dans le navigateur) | Dépôt privé : Pages indisponible sur compte gratuit |
| A4 | 2026-11-23 | Positionnement : outil de réflexion, pas diagnostic psychologique | Archétypes de Pearson/Jung et déesses de Bolen = cadres narratifs non validés psychométriquement ; risque d'effet Barnum | Garder « profil psychologique » : survend la portée |
| A5 | 2026-11-23 | Correction du biais par **ratio score brut / exposition** (indice, 100 = hasard) | Simulation de 30 000 répondants aléatoires, monde 12 : part en tête de 5,4 % à 13,3 % (idéal 8,3 %), contre 1,8 % à 14,6 % pour l'écart au hasard et 0,2 % à 23,1 % pour le brut. Monde 7 : 11,9–15,9 % contre 9,4–17,8 % et 5,6–30,5 % | Écart au hasard (brut − exposition) : moins équilibré, scores négatifs à afficher sur le radar. Score brut : biais Sage/Souverain |
| A6 | 2026-11-23 | Exposition calculée sur les questions **réellement répondues**, pas sur les 10 tirées | Une question expirée ne doit ni donner de points ni compter dans la référence du hasard | Exposition sur la banque entière : ne tient pas compte du tirage de la session |
| A7 | 2026-11-23 | Chrono expiré = question passée **sans point** | Une réponse aléatoire pollue le profil sans que l'utilisateur le sache | Garder la réponse aléatoire (comportement v0.1.0) |
| A8 | 2026-11-23 | Départage des égalités par ordre **aléatoire propre à la session** | Un ordre fixe favorisait systématiquement les premiers archétypes déclarés. Rejouer la même session peut donner un ordre différent, mais l'égalité est signalée à l'utilisateur | Ordre fixe alphabétique ou de déclaration : biais permanent |
| A10 | 2026-11-23 | Service worker : **réseau d'abord** pour la page, cache d'abord pour le reste | Une mise à jour poussée sur GitHub est visible dès l'ouverture suivante en ligne, sans vider le cache ; le hors-ligne reste garanti | Cache d'abord partout : plus rapide mais l'utilisateur garderait l'ancienne version jusqu'à une seconde ouverture |
| A11 | 2026-11-23 | Icônes générées par script (`tools/make-icons.ps1`, System.Drawing) plutôt que dessinées à la main | Reproductible, modifiable (couleurs, motif), aucune dépendance à installer sous Windows | Éditeur graphique : non versionnable |
| A12 | 2026-11-23 | Chemins relatifs (`./`) partout dans le manifeste et le service worker | L'app est servie dans un sous-dossier (`/archetypes-lab/`) sur GitHub Pages ; des chemins absolus (`/`) casseraient l'installation | Chemins absolus : fonctionnent en local mais pas sur Pages |
| A13 | 2026-11-23 | Banque portée à **100 questions par univers** (demande de l'utilisateur), avec **plan d'équilibre avant rédaction** : comptes cibles d'archétypes principaux/secondaires par sous-ensemble de tirage, puis écriture des questions pour les remplir | Équilibrer après coup en retouchant des options existantes : plus long, et risque de dégrader des questions déjà validées | Ajouter 50 questions sans plan : le biais aurait été simplement dilué |
| A14 | 2026-11-23 | Les 50 questions d'origine restent **inchangées** ; seul le complément est équilibré | Traçabilité, pas de régression sur du contenu existant, comparaison avant/après propre | Réécrire les anciennes options pour corriger le biais |
| A15 | 2026-11-23 | Nouveaux arbitrages formulés « Que préserve-t-il coûte que coûte ? » (choix positif) au lieu de « Renoncer à… » | Avec « renoncer », l'archétype noté était celui qui tient le moins à la chose abandonnée : logique inversée, source d'erreur de lecture pour l'utilisateur | Garder la logique inversée des questions d'origine |
| A16 | 2026-11-23 | Version v0.4.0 d'abord sur la branche `v0.4-banque`, puis publiée sur `main` quand l'auteur a demandé à la tester sur lui-même (retour arrière : `git revert` du merge) | Contenu psychologique : seul l'auteur de l'app peut juger si une option représente bien l'archétype. GitHub Pages ne sert que `main` | Publier directement et corriger ensuite |
| A9 | 2026-11-23 | Ne pas rééquilibrer la banque dans la v0.2.0 | Rééquilibrer demande de réécrire des dizaines d'options et de les relire une à une : c'est un chantier de contenu à part (backlog 2) | Tout corriger d'un coup : version trop large, régression difficile à isoler |

---

## Constats de mesure (baseline v0.1.0)

Source : `docs/balance-baseline.txt` (`node tools/balance.js`).

**12 Archétypes** — fort déséquilibre. Poids (2×primaire + secondaire) : Sage 81 → Innocent 22, rapport max/min = 3,68. Un répondant répondant au hasard obtient Sage en tête 26,7 % du temps (idéal : 8,3 %) et Innocent 0,1 %. Égalité en tête dans 23 % des cas. Ces chiffres incluent l'effet du départage par ordre de déclaration (corrigé en v0.2.0).
**7 Déesses** — déséquilibre modéré (rapport 1,61) : Athéna 36 % vs Perséphone 5 % pour un répondant aléatoire. Héra et Perséphone sont surtout des choix secondaires.
**Pools** — Miroir Social (monde 12) : exactement 10 questions, donc aucun tirage aléatoire. Q33 (monde 7, et non monde 12 comme noté initialement) : deux options avaient le même archétype primaire (corrigé en v0.2.0).

---

## Backlog priorisé

1. ~~**Scoring (v0.2.0)**~~ : fait.
2. ~~**Banque**~~ : fait en v0.4.0 (reste à relire et publier). Pistes restantes : rééquilibrer le pool Dilemmes du monde 12 ; neutraliser le genre du monde 7. Initialement : rééquilibrer les options (plus de choix primaires Innocent, Amoureux, Bouffon, Homme ordinaire, Héra, Perséphone) ; ≥ 15 questions éligibles par mode (Miroir Social du monde 12 : 10 seulement) ; neutraliser le genre du monde 7 ou l'assumer. Objectif chiffré : rapport max/min des poids < 1,3 et part en tête d'un répondant au hasard entre 6 % et 11 % dans le monde 12.
3. **Résultats** : descriptions détaillées, avertissement « outil de réflexion », nuance du diagnostic Duo (deux tirages de 10 questions différentes ne prouvent pas un « décalage »).
4. ~~**PWA (v0.3.0)**~~ : fait (testé sur iPhone et Windows).
5. **UX** : retour arrière, confirmation d'abandon, historique local, partage/export, labels radar non coupés (« Homme ordinaire », « Hors-la-loi »), retrait de `user-scalable=no`, couleurs du radar selon le thème.
6. **Tests** : étendre `tools/smoke.js` (rendu réel dans un navigateur, test iOS Safari).
