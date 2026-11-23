# Journal de bord — Archétypes Lab

Objectif final : une application qui tourne sur **iOS (Safari / écran d'accueil)** et **Chrome** (desktop et Android).

## Résumé de l'évolution (à tenir à jour)

| Version | Date | Statut | En une ligne |
|---|---|---|---|
| v0.1.0 | 2026-11-23 | Base | Import de l'application d'origine (fichier unique), dépôt Git, outil de mesure d'équilibre |
| v0.2.0 | 2026-11-23 | Scoring | Indice ajusté par l'exposition de chaque archétype, chrono expiré sans point, départage aléatoire, correction Q33 (monde 7) |
| v0.3.0 | 2026-11-23 | PWA | Installable (manifeste, icônes, écran d'accueil iOS, bouton Installer Chrome), hors-ligne via service worker, version affichée |
| v0.4.0 | 2026-11-23 | Banque (publiée sur `main` pour test par l'auteur, relecture en cours) | 100 questions par univers (50 → 100), options rééquilibrées : rapport max/min des poids 3,68 → 1,24 (monde 12) et 1,61 → 1,12 (monde 7) |
| v0.5.0 | 2026-11-23 | Synthèse | Paragraphe de synthèse du profil sous le radar (portrait en 3 paragraphes : moteur, nuance, relations, ombre, piste, archétypes les moins mobilisés) |
| v0.6.0 | 2026-11-23 | Style | Style unifié sur la voix des questions d'origine (charte `docs/STYLE.md`) : vouvoiement partout, plus de « Je… », options de ≈ 10 mots ; contrôle automatique |

**État actuel :** PWA statique (`index.html` + `manifest.json` + `sw.js` + `icons/`), 2 univers de 100 questions (12 Archétypes, 7 Déesses), 6 modes de tirage, radar canvas, synthèse du profil, comparaison Duo. Le biais de scoring et de banque est faible (v0.4.0 : rapport max/min des poids 1,24 et 1,12). Tests réels (2026-11-23) : iPhone (Safari) OK — installation, ouverture, hors-ligne en mode avion ; Windows OK après une erreur DNS passagère (`DNS_PROBE_FINISHED_NXDOMAIN`, résolue en relançant, aucun défaut dans l'app). Installation depuis Chrome (icône « Installer ») et hors-ligne sur Windows non encore confirmés.

**Prochaines étapes :** (1) permettre de choisir la longueur de la session, 20 questions par défaut (backlog 9, justifié par `docs/session-length-v0.5.0.txt`) ; (2) bibliothèque de 6 options dont 4 tirées : **reportée** par l'auteur, on reste à 4 options pour le moment (backlog 8, décision A17).

**Procédure de release :** modifier `APP_VERSION` (index.html) et `CACHE_VERSION` (sw.js) avec la même valeur, lancer `node tools/smoke.js`, commit, push. Sans changement de version, les téléphones gardent l'ancienne version en cache.

---

## Journal des versions et modifications

### v0.6.0 — 2026-11-23 — Unification du style
- **Suggestion de l'auteur** : « unifier le style des questions : le style des nouvelles questions est bien identifiable ». Décision : on aligne les 100 questions ajoutées sur la voix des 100 questions d'origine (A18). Charte écrite dans `docs/STYLE.md`.
- **100 questions réécrites (ids 51-100, deux univers)** : textes seulement. Pour chaque option, l'ordre et les archétypes principal/secondaire sont inchangés ; les poids de la banque sont identiques avant et après (`tools/pools.js`, comparaison exacte).
- **Questions d'origine Q5 à Q10 du monde 12 : passées du tutoiement au vouvoiement** (seuls les pronoms ont changé, 11 remplacements). C'est la seule modification de questions d'origine de cette version.
- `tools/style-check.js` : contrôle de la charte (tutoiement, première personne, longueur, écarts de longueur entre options). Détection du tutoiement fiabilisée pour les lettres accentuées (une première version prenait « tête » ou « fête » pour « te »). Intégré à `tools/smoke.js`, avec validation de la structure des deux banques.
- `tools/apply-restyle.js` + `docs/drafts/restyle.js` : outil et données de la réécriture ; `docs/revue-questions.md` régénéré.

| Mesure | Avant | Après |
|---|---|---|
| Monde 12 : mots par option (origine 10,0) | 12,7 | **10,5** |
| Monde 7 : mots par option (origine 10,2) | 13,1 | **11,3** |
| Options en « Je… » (origine 0 %) | 13 % / 16 % | **0 %** |
| Énoncés tutoyés | 14 % (monde 12) | **0 %** |
| Contrôle automatique de la charte | 143 points à revoir | **0** |

**Limite :** le style est mesuré sur des critères formels (longueur, personne, forme). L'impression de voix commune reste un jugement : à valider par l'auteur en testant.

### Étude de la longueur de session (2026-11-23, `tools/session-length.js`, résultats dans `docs/session-length-v0.5.0.txt`)
Question de l'auteur : quel est le nombre idéal de questions ? Simulation avec le vrai code de scoring : un répondant a un profil « vrai » (deux archétypes) et choisit l'option correspondante avec une probabilité p (0,5 = signal faible, 0,7 = signal fort), sinon au hasard. 3 000 répondants par cellule.

| Questions | Monde 12 : n° 1 retrouvé (p=0,5 / 0,7) | Monde 12 : vrai profil dans le top 2 | Monde 12 : test-retest du n° 1 | Monde 7 : n° 1 retrouvé (p=0,5 / 0,7) |
|---|---|---|---|---|
| 10 (actuel) | 38 % / 52 % | 58 % / 74 % | 23 % / 35 % | 65 % / 78 % |
| 15 | 46 % / 61 % | 67 % / 84 % | 31 % / 49 % | 75 % / 84 % |
| 20 | 53 % / 67 % | 76 % / 90 % | 37 % / 56 % | 79 % / 88 % |
| 30 | 62 % / 73 % | 85 % / 96 % | 51 % / 67 % | 85 % / 91 % |
| 50 | 71 % / 79 % | 95 % / 99 % | 61 % / 74 % | 90 % / 94 % |

**Lecture :** (1) à 10 questions, avec 12 archétypes, l'archétype n° 1 n'est retrouvé que dans environ 4 cas sur 10 à 5 cas sur 10 ; l'ensemble « n° 1 + n° 2 » est nettement plus fiable. (2) Les gains ralentissent après 30 questions (≈ +5 points pour 20 questions de plus). (3) Le monde 7 (7 archétypes) est plus facile : 15 à 20 questions suffisent. **Recommandation : 20 questions par défaut (≈ 4 à 5 minutes), 10 comme « aperçu » et 30 pour « approfondi » dans le monde 12.** Limites : modèle de répondant cohérent et idéalisé (les vraies personnes sont plus bruitées), fatigue non modélisée.

### v0.5.0 — 2026-11-23 — Synthèse du profil
- **Suggestion de l'auteur** : « donner après la représentation en radar un paragraphe de synthèse sur le profil ».
- Nouvelle carte « Synthèse du profil » juste sous le radar : 3 paragraphes. (1) Dominante : moteur de l'archétype n° 1 et nuance apportée par le n° 2 (ou « profil peu contrasté » si l'indice du n° 1 est inférieur à 130). (2) Relations, zone d'ombre possible, piste pour progresser. (3) Archétypes les moins mobilisés, avec rappel que ce n'est pas un diagnostic.
- Textes dans une table `SYNTH` (4 champs par archétype : `trait`, `nuance`, `relation`, `piste`, soit 19 entrées), formulations neutres (« on vous perçoit comme quelqu'un de... »). La fonction `buildSynthesis` compose le portrait ; les accords des noms (« du Sage », « de l'Innocent », « d'Aphrodite ») sont gérés.
- La combinaison est **compositionnelle** : la synthèse dépend surtout de l'archétype n° 1 et du n° 2. Les 132 paires du monde 12 ne sont pas rédigées une par une.
- `tools/smoke.js` teste : les 19 entrées complètes, 348 synthèses (toutes les paires, profil marqué et plat) sans « undefined », sans erreur d'accord, le cas « profil plat » et les deux accords types.
- Un bug trouvé par ces tests avant publication : « de L'Innocent et de Le Sage » (accord des noms), corrigé.

**Limite :** le texte est générique par archétype ; il ne tient pas compte des réponses précises ni de l'écart entre mode déclaratif et observation (le diagnostic Duo reste dans son encadré).

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
| A17 | 2026-11-23 | **Rester à 4 options par question** pour le moment (idée de l'auteur : bibliothèque de 6 options dont 4 tirées) | Décision de l'auteur. Elle reste ouverte : le code de scoring la supporterait (l'exposition se calcule sur les options affichées), mais cela demande 400 rédactions et augmente un peu la variabilité entre sessions | Passer à 6 options maintenant |
| A18 | 2026-11-23 | Unifier le style en **alignant les nouvelles questions sur les questions d'origine** | Les questions d'origine sont la voix de l'auteur ; c'est lui qui a repéré les nouvelles comme étrangères. Mesure : 0 % de « Je » à l'origine contre 13-16 % dans les nouvelles ; options plus longues de 27 % | Aligner les anciennes sur les nouvelles : change du contenu validé |
| A19 | 2026-11-23 | Recommander **20 questions par défaut** (aperçu 10, approfondi 30) | Simulation de fiabilité (`docs/session-length-v0.5.0.txt`) : à 10 questions le n° 1 du monde 12 n'est retrouvé que 38-52 % du temps ; rendements décroissants après 30 | Rester à 10 : résultat trop instable ; 50 : lassitude pour un gain d'environ 5 points |
| A9 | 2026-11-23 | Ne pas rééquilibrer la banque dans la v0.2.0 | Rééquilibrer demande de réécrire des dizaines d'options et de les relire une à une : c'est un chantier de contenu à part (backlog 2) | Tout corriger d'un coup : version trop large, régression difficile à isoler |

---

## Constats de mesure (baseline v0.1.0)

Source : `docs/balance-baseline.txt` (`node tools/balance.js`).

**12 Archétypes** — fort déséquilibre. Poids (2×primaire + secondaire) : Sage 81 → Innocent 22, rapport max/min = 3,68. Un répondant répondant au hasard obtient Sage en tête 26,7 % du temps (idéal : 8,3 %) et Innocent 0,1 %. Égalité en tête dans 23 % des cas. Ces chiffres incluent l'effet du départage par ordre de déclaration (corrigé en v0.2.0).
**7 Déesses** — déséquilibre modéré (rapport 1,61) : Athéna 36 % vs Perséphone 5 % pour un répondant aléatoire. Héra et Perséphone sont surtout des choix secondaires.
**Pools** — Miroir Social (monde 12) : exactement 10 questions, donc aucun tirage aléatoire. Q33 (monde 7, et non monde 12 comme noté initialement) : deux options avaient le même archétype primaire (corrigé en v0.2.0).

---

## Backlog priorisé

7. ~~**Unifier le style des questions**~~ (fait en v0.6.0, voir A18 et `docs/STYLE.md`) — (suggestion de l'auteur : « le style des nouvelles questions est bien identifiable »). Écarts mesurés entre les questions d'origine (id ≤ 50) et les nouvelles (id > 50) : options plus longues (monde 12 : 10,0 → 12,7 mots ; monde 7 : 10,2 → 13,1), **aucune** option d'origine à la première personne (« Je... ») contre 13 % et 16 % des nouvelles, plus d'options entre guillemets dans le monde 7 (2 % → 6 %), et 14 % des énoncés d'origine du monde 12 tutoient alors que tout le reste vouvoie. Charte proposée : options de 8 à 12 mots, sans « Je » (infinitif ou groupe nominal en Déclaratif, « Il/Elle + présent » en Observation), formes parallèles au sein d'une question, vouvoiement partout, registre sobre des questions d'origine. Direction proposée : aligner les nouvelles questions sur les anciennes (voix d'origine de l'auteur).
9. **Longueur de session réglable** : 10 (aperçu) / 20 (par défaut) / 30 (approfondi). Le « 10 » est codé en dur à plusieurs endroits de `index.html` (compteur, barre de progression, fin de session) et dans `drawQuestions`. À rendre variable ; vérifier la taille des pools (mode Miroir : 22 et 21 questions, donc 30 impossible dans ce mode sans réutiliser des questions) ; texte de synthèse déjà paramétré par le nombre de réponses.
8. **(Reporté par l'auteur : on reste à 4 options pour le moment — A17.)** **Bibliothèque de 6 options par question, 4 tirées au hasard** (suggestion de l'auteur). À prévoir : 2 options supplémentaires pour chacune des 200 questions (400 rédactions) avec 6 archétypes principaux distincts ; `computeExposure` calculée sur les 4 options **réellement affichées** (déjà compatible si on lui passe la version tirée) ; tirage sans doublon ; outils de mesure (`balance.js`, `pools.js`, `merge-bank.js`) à adapter pour 6 options. Avantages : moins de mémorisation entre sessions, moins d'effet de position et de biais d'option. Inconvénient : un peu plus de variabilité entre deux sessions d'une même personne (chaque option a 2 chances sur 3 d'apparaître).

1. ~~**Scoring (v0.2.0)**~~ : fait.
2. ~~**Banque**~~ : fait en v0.4.0 (reste à relire et publier). Pistes restantes : rééquilibrer le pool Dilemmes du monde 12 ; neutraliser le genre du monde 7. Initialement : rééquilibrer les options (plus de choix primaires Innocent, Amoureux, Bouffon, Homme ordinaire, Héra, Perséphone) ; ≥ 15 questions éligibles par mode (Miroir Social du monde 12 : 10 seulement) ; neutraliser le genre du monde 7 ou l'assumer. Objectif chiffré : rapport max/min des poids < 1,3 et part en tête d'un répondant au hasard entre 6 % et 11 % dans le monde 12.
3. **Résultats** : descriptions détaillées, avertissement « outil de réflexion », nuance du diagnostic Duo (deux tirages de 10 questions différentes ne prouvent pas un « décalage »).
4. ~~**PWA (v0.3.0)**~~ : fait (testé sur iPhone et Windows).
5. **UX** : retour arrière, confirmation d'abandon, historique local, partage/export, labels radar non coupés (« Homme ordinaire », « Hors-la-loi »), retrait de `user-scalable=no`, couleurs du radar selon le thème.
6. **Tests** : étendre `tools/smoke.js` (rendu réel dans un navigateur, test iOS Safari).
