# Journal de bord — Archétypes Lab

Objectif final : une application qui tourne sur **iOS (Safari / écran d'accueil)** et **Chrome** (desktop et Android).

## Résumé de l'évolution (à tenir à jour)

| Version | Date | Statut | En une ligne |
|---|---|---|---|
| v0.1.0 | 2026-11-23 | Base | Import de l'application d'origine (fichier unique), dépôt Git, outil de mesure d'équilibre |

**État actuel :** application web statique à fichier unique (`index.html`), 2 univers (12 Archétypes, 7 Déesses), 6 modes de tirage, radar canvas, comparaison Duo. Non installable (pas de manifest ni de service worker). Biais de scoring mesuré, non encore corrigé.

**Prochaine étape :** v0.2.0 — corrections de scoring (égalités, chrono, équilibre des options).

---

## Journal des versions et modifications

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

---

## Constats de mesure (baseline v0.1.0)

Source : `docs/balance-baseline.txt` (`node tools/balance.js`).

**12 Archétypes** — fort déséquilibre. Poids (2×primaire + secondaire) : Sage 81 → Innocent 22, rapport max/min = 3,68. Un répondant répondant au hasard obtient Sage en tête 26,7 % du temps (idéal : 8,3 %) et Innocent 0,1 %. Égalité en tête dans 23 % des cas.
**7 Déesses** — déséquilibre modéré (rapport 1,61) : Athéna 36 % vs Perséphone 5 % pour un répondant aléatoire. Héra et Perséphone sont surtout des choix secondaires.
**Pools** — Miroir Social (monde 12) : exactement 10 questions, donc aucun tirage aléatoire. Q33 (monde 12) : deux options ont le même archétype primaire.

---

## Backlog priorisé

1. **Scoring (v0.2.0)** : tie-break explicite ; chrono expiré = pas de point ; normalisation par fréquence d'apparition (corrige le biais sans réécrire les 100 questions) ; corriger Q33.
2. **Banque** : rééquilibrer les options (plus de choix primaires Innocent, Amoureux, Bouffon, Homme ordinaire, Héra, Perséphone) ; ≥ 15 questions éligibles par mode ; neutraliser le genre du monde 7 ou l'assumer.
3. **Résultats** : descriptions détaillées, ex æquo affichés, avertissement « outil de réflexion », nuance du diagnostic Duo.
4. **PWA (v0.3.0)** : manifest, service worker, icônes, test d'installation iOS et Chrome.
5. **UX** : retour arrière, confirmation d'abandon, historique local, partage/export, labels radar non coupés, retrait de `user-scalable=no`.
