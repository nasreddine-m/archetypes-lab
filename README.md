# Archétypes Lab

Petite application web (iPhone / Chrome) : questionnaire d'archétypes (12 Archétypes ou 7 Déesses), modes déclaratif et observation, radar, comparaison Duo.

Outil de réflexion personnelle, pas un diagnostic psychologique.

- Application en ligne : https://nasreddine-m.github.io/archetypes-lab/
- Lancer en local : ouvrir `index.html` dans Chrome.
- Mesurer l'équilibre des questions : `node tools/balance.js`
- Contrôler le style des questions : `node tools/style-check.js` (charte : `docs/STYLE.md`)
- Fiabilité selon le nombre de questions : `node tools/session-length.js`
- Test de bout en bout (100 contrôles) : `node tools/smoke.js`
- Régénérer les icônes : `powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1`
- Installer : iPhone → Safari → Partager → « Sur l'écran d'accueil » ; Chrome → icône « Installer » dans la barre d'adresse
- Historique, décisions et feuille de route : voir [JOURNAL.md](JOURNAL.md)
