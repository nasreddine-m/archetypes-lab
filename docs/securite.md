# Sécurité et modification de l'application (v0.17.2)

## Qui peut modifier l'application en ligne
Seul le propriétaire du dépôt GitHub (`nasreddine-m`, administrateur) a un droit d'écriture. Les testeurs peuvent consulter et copier le code (le dépôt est public, une application web est envoyée au navigateur), mais pas modifier la version publiée. Ce qu'un testeur modifie dans son navigateur (outils de développement, historique) ne touche que son appareil.

## Mesures en place (2026-11-27)
- **Branche `main` protégée** : suppression et écrasement forcé de l'historique interdits. Le propriétaire peut toujours pousser normalement (administrateurs non soumis aux règles).
- **Wiki, projets et signalements désactivés** sur le dépôt `archetypes-lab`, pour limiter le contenu laissé par des tiers.
- **Politique de sécurité dans la page** (balise `Content-Security-Policy`) : aucune ressource externe, aucun envoi hors du site (`default-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `form-action 'none'`). Testée dans Chrome servi en HTTP : le rapport PDF, les tampons, le catalogue, le service worker fonctionnent ; un envoi vers un site externe et un script externe sont bloqués. Limite : `frame-ancestors` ne peut pas être posé par une balise meta (protection contre l'affichage de l'app dans une page tierce non assurée) ; `'unsafe-inline'` reste nécessaire car l'application utilise des scripts et des gestionnaires en ligne.
- **Adresse « noreply » GitHub** (`nasreddine-m@users.noreply.github.com`) pour les futurs commits de ce dépôt.

## Ce qui reste à la charge du propriétaire
- **Double authentification** sur le compte GitHub (réglages du compte) : sans elle, un compte piraté annule toutes les protections.
- **Option GitHub « Block command line pushes that expose my email »** (réglages du compte, e-mail) : empêche d'exposer l'adresse personnelle par erreur.
- Les **32 commits antérieurs** portent l'adresse e-mail personnelle et sont publics. La retirer demanderait de réécrire l'historique (`git filter-repo` puis push forcé, ce que la protection de `main` interdit désormais) : décision à prendre explicitement.

## Ce qui est impossible
- Empêcher de lire ou de copier le code d'une application web : il est envoyé à chaque visiteur.
- Rendre le dépôt privé tout en gardant l'hébergement gratuit GitHub Pages : en général réservé aux comptes payants (à vérifier selon l'offre).
