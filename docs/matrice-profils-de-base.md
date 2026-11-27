# Matrice 12 × 12 : profil de base associé aux deux figures d'un résultat masculin

L'application donne, après chaque test masculin, deux figures : la plus haute (1re) et la suivante (2e). Cela fait 12 × 12 = 144 cases, dont 12 sont impossibles (deux fois la même figure), soit **132 paires valides**. Chaque paire est associée à l'un des quatre profils de base : **alpha, bêta, sigma, gamma**.

> **Avertissement.** Cette typologie est informelle : une source la qualifie de pseudo-scientifique, une autre dit qu'elle est contredite par la recherche en personnalité, et les définitions du gamma se contredisent. Le rattachement des figures aux quatre familles est une **interprétation** (arbitrage A55), pas une règle établie. Depuis la v0.18.0, elle est affichée dans les résultats masculins (carte « Profil alpha / bêta / sigma / gamma »), avec une mention d'avertissement (arbitrage A58).

## Les quatre familles (ordre du cercle du radar)
| Profil de base | Figures |
|---|---|
| alpha | Roi, Guerrier, Héros |
| sigma | Rebelle, Explorateur, Sage |
| gamma | Magicien, Créateur, Bouffon |
| bêta | Amant, Soignant, Père |

## Règle (reproductible : `node tools/matrice-profils.js`)
1. Les 12 figures sont disposées en cercle dans l'ordre du radar (le circuit le plus court sur les 6 critères). Chaque famille occupe un quart du cercle.
2. Pour une paire (1re, 2e), on calcule le **centre de gravité** de leurs deux positions sur le cercle, avec les poids **2 et 1** (comme le scoring : 2 points pour la cible principale, 1 pour la secondaire).
3. Le profil de base est la famille du secteur où tombe ce centre de gravité. Sur une frontière exacte, la famille de la 1re figure l'emporte.

Conséquences : deux figures de la même famille donnent toujours cette famille ; les figures du milieu de chaque famille (Guerrier, Explorateur, Créateur, Soignant) donnent toujours leur famille ; les figures de bord (Roi, Héros, Rebelle, Sage, Magicien, Bouffon, Amant, Père) peuvent basculer vers la famille voisine quand la 2e figure vient de l'autre côté. La répartition est parfaitement équilibrée : **33 paires par profil de base**. 32 paires sur 132 ont un profil de base différent de la famille de la 1re figure.

## Matrice
Lignes : 1re figure. Colonnes : 2e figure. **A** alpha · **S** sigma · **G** gamma · **B** bêta.

| 1re \ 2e | Roi | Gue | Hér | Reb | Exp | Sag | Mag | Cré | Bou | Ama | Soi | Pèr |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Roi** | – | A | A | A | A | A | A | B | B | B | B | A |
| **Guerrier** | A | – | A | A | A | A | A | A | A | A | A | A |
| **Héros** | A | A | – | A | S | S | S | S | A | A | A | A |
| **Rebelle** | A | A | S | – | S | S | S | S | S | S | A | A |
| **Explorateur** | S | S | S | S | – | S | S | S | S | S | S | S |
| **Sage** | S | S | S | S | S | – | S | G | G | G | G | S |
| **Magicien** | G | S | S | S | S | G | – | G | G | G | G | G |
| **Créateur** | G | G | G | G | G | G | G | – | G | G | G | G |
| **Bouffon** | B | B | G | G | G | G | G | G | – | G | B | B |
| **Amant** | B | B | B | B | G | G | G | G | B | – | B | B |
| **Soignant** | B | B | B | B | B | B | B | B | B | B | – | B |
| **Père** | B | A | A | A | A | B | B | B | B | B | B | – |

## Limites
- Les cases dépendent de deux choix interprétatifs : le rattachement des figures aux familles et les poids 2 / 1. Changer l'un ou l'autre change la matrice.
- Aucune validation empirique : personne n'a vérifié que ce profil de base correspond à ce que la personne ressent ou à un comportement observé.
- Seules les deux premières figures comptent ; les dix autres scores n'entrent pas dans cette matrice.

---

# Monde féminin : 7 × 7 (v0.19.0)

49 cases, dont 7 impossibles : **42 paires valides**. Même règle que pour les masculins (centre de gravité sur le cercle des figures, poids 2 et 1), avec des arcs de tailles différentes puisque 7 figures ne se partagent pas en 3 par famille.

| Profil de base | Figures | Pourquoi |
|---|---|---|
| alpha | La Reine, La Sage | autorité, stratégie, compétence |
| sigma | La Mystique, La Chasseresse | indépendance, vie intérieure, liberté |
| gamma | L'Amante, La Curieuse | créativité, empathie, ouverture |
| bêta | La Mère | soin, soutien, loyauté |

Lignes : 1re figure. Colonnes : 2e figure. **A** alpha · **S** sigma · **G** gamma · **B** bêta.

| 1re \ 2e | Reine | Sage | Mystique | Chasseresse | Amante | Curieuse | Mère |
|---|---|---|---|---|---|---|---|
| **La Reine** | – | A | A | A | A | B | A |
| **La Sage** | A | – | A | S | A | A | A |
| **La Mystique** | A | S | – | S | S | S | S |
| **La Chasseresse** | S | S | S | – | S | G | S |
| **L'Amante** | G | G | S | G | – | G | G |
| **La Curieuse** | B | G | G | G | G | – | G |
| **La Mère** | B | A | B | B | G | B | – |

Répartition : 12 alpha, 12 sigma, 12 gamma, 6 bêta. 8 paires sur 42 diffèrent de la famille de la 1re figure. Reproductible avec 
ode tools/matrice-profils.js.

## Recherche (2026-11-28)
Les quatre profils existent au féminin, adaptés des versions masculines : alpha (affirmée, orientée objectifs), bêta (attentionnée, loyale, relationnelle), sigma (indépendante, autonome, mystérieuse), gamma (introspective, créative, émotionnellement mûre). Pages consultées : Marriage.com (6 Female Personality Types), MomJunction (beta female), Medium (25 traits of a sigma female), Calm Sage (gamma female personality). Elles reconnaissent que ce ne sont pas des catégories scientifiques, que les descriptions varient, et aucune ne cite de recherche publiée sur les types féminins.

## Limites
- Découpage choisi parmi trois essais pour sa répartition ; classer La Sage alpha est discutable ; le bêta, avec une seule figure, est le plus rare (6 paires sur 42).
- Mêmes limites que pour les masculins : interprétation, pas de validation, seules les deux premières figures comptent.