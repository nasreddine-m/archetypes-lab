# Profils définis par critères (v0.16.0)

Six critères, choisis parce qu'ils recouvrent les thèmes de la banque de questions (rapport à l'autorité, gestion des conflits, besoin d'aventure, esthétique, courage et risque, décision dans l'incertain) :
**Empathie** (soin, lien), **Autorité** (structurer, décider), **Indépendance** (autonomie), **Sagesse** (recul, discernement), **Créativité** (inventer, transformer), **Audace** (courage, action, défi des règles).

Les pourcentages sont des **estimations rédactionnelles**, normalisées à 100 % par profil. Ils servent à définir et à séparer les profils, pas à mesurer une personne. Les données et le contrôle de séparation sont dans `tools/profils-criteres.js` (`node tools/profils-criteres.js`).

## 12 masculins (Emp. / Aut. / Indép. / Sag. / Créa. / Aud.)
Roi 10/40/10/20/5/15 · Père 30/25/5/25/5/10 · Guerrier 10/30/5/15/5/35 · Magicien 10/10/15/30/30/5 · Amant 35/5/10/10/25/15 · Sage 10/10/20/50/5/5 · Explorateur 5/5/45/15/10/20 · Créateur 5/10/20/10/45/10 · Héros 10/15/20/5/10/40 · Rebelle 5/0/35/10/15/35 · Bouffon 20/0/20/10/30/20 · Soignant 55/10/0/20/5/10

## 7 féminins
La Sage 10/15/20/40/5/10 · La Chasseresse 5/10/40/10/5/30 · La Mystique 15/0/30/35/15/5 · La Reine 10/45/10/15/5/15 · La Mère 55/15/0/15/10/5 · La Jeune fille 35/0/10/20/25/10 · L'Amante 25/5/10/5/35/20

## Paires les plus proches (écart sur 200)
Masculins : Roi / Guerrier 40, Amant / Bouffon 40, Explorateur / Rebelle 40, Roi / Père 50, Père / Soignant 50. Féminins : La Sage / La Mystique 50, La Jeune fille / L'Amante 50.

## Limites
Aucune validation empirique : personne n'a vérifié que ces profils se distinguent dans les réponses réelles. Le test à faire est de comparer, sur de vraies sessions, le profil obtenu à celui que la personne reconnaît.

## Ordre du radar (v0.17.4)
Les 12 figures sont placées sur le radar dans l'ordre du circuit le plus court sur les 6 critères (tools/ordre-radar.js) : Roi, Guerrier, Héros, Rebelle, Explorateur, Sage, Magicien, Créateur, Bouffon, Amant, Soignant, Père. Les profils les plus proches sont voisins. Ce regroupement ressemble à la typologie informelle alpha / sigma / gamma / bêta, mais elle n'est pas utilisée ni affichée : elle est contestée et son rattachement serait une interprétation.

Ordre du radar féminin (v0.17.5) : La Reine, La Sage, La Mystique, La Chasseresse, L'Amante, La Jeune fille, La Mère (circuit le plus court, longueur 530).
