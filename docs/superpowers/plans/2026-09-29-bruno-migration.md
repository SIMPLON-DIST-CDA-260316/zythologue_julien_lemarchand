# Migration Bruno — plan d'exécution

Spec : `docs/superpowers/specs/2026-09-29-bruno-migration-design.md` (règles de
conversion, arborescence cible, contenu détaillé — non répétées ici).

Exécution : inline, en session, pas de subagents. Vérification par
`npx @usebruno/cli run` (v4.2.0 dispo via npx) contre l'API déjà up
(`docker compose ps` : `zythologue-api` running sur :3000).

Chaque tâche = un commit. Diff + message montrés avant chaque commit, accord
explicite attendu avant de lancer `git commit` (règle du repo).

- [x] **Tâche 1** — `bruno/bruno.json`, `bruno/environments/Local.bru`
- [x] **Tâche 2** — `bruno/account/signup/` (2 fichiers), suppr.
      `requests/account/signup.http`. Password de fixture corrigé
      (`1234567` → `1234567!`), dérive préexistante face à la validation
      durcie par `c069648`.
- [x] **Tâche 3** — `bruno/beers/list/` (6) + `bruno/beers/get-one/` (5),
      suppr. `requests/beers/{list,get-one}.http`
- [x] **Tâche 4** — `bruno/beers/create/` (8), suppr.
      `requests/beers/create.http`. Scénario "sans body" : `body:json {}`
      vide fait planter le parseur `.bru` du CLI (avale le bloc suivant) —
      remplacé par `body: none` + header `Content-Type` explicite.
- [x] **Tâche 5** — `bruno/beers/update/` (9, dont 1 setup), suppr.
      `requests/beers/update.http`
- [x] **Tâche 6** — `bruno/beers/delete/` (4, dont 1 setup), suppr.
      `requests/beers/delete.http`
- [x] **Tâche 7** — `bruno/beers/create-photo/` (14, dont 3 setup), suppr.
      `requests/beers/create-photo.http`. `body: multipartForm` (camelCase,
      pas `multipart-form`) dans `post{}` ; chemins `@file()` relatifs à la
      racine de la collection (`bruno/`), pas au fichier `.bru` ; ajout de
      `bruno/fixtures/notes.txt` pour le scénario 415.
- [x] **Tâche 8** — suppr. `requests/` (déjà vide après tâche 7), maj
      `CONTRIBUTING.md:49-50` et `ARCHITECTURE.md` (mentions `.http` → `bruno/`)

Vérification par tâche : `npx @usebruno/cli run <dossier> --env Local -r`
depuis `bruno/`, comparer les status codes obtenus aux annotations `docs` de
chaque fichier (déjà les codes attendus documentés dans les `.http`
d'origine).
