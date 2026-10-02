# Plan de tests — API Zythologue

Ce document liste les cas testés pour chaque fonctionnalité de l'API, le résultat
attendu et la requête Bruno qui le couvre. Il évolue avec les fonctionnalités ;
les résultats d'exécution vont dans [`comptes-rendus/`](comptes-rendus/), un
fichier daté par campagne de tests.

## 1. Périmètre

| Couvert | Hors périmètre (pour l'instant) |
| --- | --- |
| Routes HTTP de l'API (`apps/api`) : compte, authentification, utilisateurs, bières, photos | Tests unitaires des services et repositories |
| Cas nominaux, validation des entrées, contrôle d'accès (401 / 403), conflits (409 / 422) | Interface client (`apps/client`) |
| | Tests end-to-end navigateur, fuzzing, tests de charge |

## 2. Environnement de test

- **Outil** : [Bruno](https://www.usebruno.com/), collection versionnée dans
  `apps/api/bruno/`, CLI `@usebruno/cli` en devDependency de l'API.
- **Environnement** : `apps/api/bruno/environments/Local.bru` — URL de l'API
  (`{{baseUrl}}`) et compte de test (`{{testEmail}}`, `{{testPassword}}`).
- **Serveur** : stack Docker du dépôt (`docker compose up --watch`), base
  PostgreSQL initialisée par `db/sql/`.
- **Lancement** : `pnpm test:bruno` depuis la racine, serveur démarré.

## 3. Stratégie

- **Un dossier par fonctionnalité**, une requête par cas, numérotée dans
  l'ordre d'exécution.
- **Préfixes** : `nominal` (cas attendu), `edge` (cas d'erreur), `setup`
  (prépare les données : bière jetable, utilisateurs A et B), `restore`
  (rétablit l'état partagé).
- **Session** : le cookie `access_token` est partagé sur tout un run. Un dossier
  qui se déconnecte ou vide le cookie (`jar.clear()`) se termine par un
  `restore` qui reconnecte le compte de test.
- **Vérification** : 32 requêtes sur 82 ont des assertions automatiques
  (`assert`) ; les autres documentent le résultat attendu dans leur bloc
  `docs` et sont vérifiées à la lecture du statut renvoyé, dans le compte rendu
  de la campagne.

## 4. Cas de test par fonctionnalité

Colonne **Vérif.** : `auto` = assertion Bruno, `docs` = attendu documenté.

### 4.1 Inscription — `POST /users` (`account/signup/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Email généré, mot de passe valide | 201 | `02-nominal-email-genere` | docs |
| Email fixe (déjà présent après le 1er run) | 201 puis 409 | `01-nominal-email-fixe` | docs |
| Email déjà pris | 409 | `03-edge-email-deja-pris` | auto |
| Email invalide | 400 | `04-edge-email-invalide` | auto |
| Mot de passe trop faible | 400 | `05-edge-password-faible` | auto |
| Champ inconnu | 400 | `06-edge-champ-inconnu` | auto |

### 4.2 Connexion — `POST /auth/login` (`account/login/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Identifiants valides | 200 + cookie posé | `01-nominal` | auto |
| Email manquant | 400 | `02-edge-email-manquant` | docs |
| Mot de passe manquant | 400 | `03-edge-password-manquant` | docs |
| Mot de passe incorrect | 401 | `04-edge-mot-de-passe-incorrect` | auto |
| Email inconnu | 401 | `05-edge-email-inconnu` | auto |

### 4.3 Déconnexion — `POST /auth/logout` (`account/logout/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Déconnexion | 204 | `02-nominal` | auto |
| `GET /users/me` après déconnexion | 401 | `03-edge-me-apres-logout` | auto |

### 4.4 Utilisateur connecté — `GET /users/me` (`users/me/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Session valide | 200 + utilisateur | `02-nominal` | auto |
| Sans session | 401 | `03-edge-sans-session` | auto |

### 4.5 Modification du compte — `PATCH /users/:id` (`users/update/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Token invalide | 401 | `02-edge-token-invalide` | auto |
| A modifie son prénom | 200 | `04-nominal-patch-self-prenom` | auto |
| A change son mot de passe | 200 | `05-nominal-patch-self-password` | auto |
| B tente de modifier A | 403 | `07-edge-patch-autre-user` | auto |
| Id non numérique | 400 | `08-edge-id-non-numerique` | auto |
| Corps vide | 400 | `09-edge-corps-vide` | auto |
| Champ non modifiable (`role`) | 400 | `10-edge-champ-inconnu` | auto |

### 4.6 Accès protégé aux bières (`beers/unauthenticated/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| `GET /beers` sans session | 401 | `00-edge-sans-session` | auto |

### 4.7 Bières — lecture (`beers/list/`, `beers/get-one/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Liste sans query / page / page et size | 200 | `list/01` à `03` | docs |
| Page à 0, page non numérique, size négatif | 400 | `list/04` à `06` | docs |
| Bière existante | 200 | `get-one/01-nominal` | docs |
| Id inexistant | 404 | `get-one/02-edge-id-inexistant` | docs |
| Id à 0, négatif, non numérique | 400 | `get-one/03` à `05` | docs |

### 4.8 Bières — écriture (`beers/create/`, `beers/update/`, `beers/delete/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Création, tous les champs / champs obligatoires | 201 | `create/01`, `02` | docs |
| Création sans body, `brewery_id` manquant ou en string, champ inconnu | 400 | `create/03` à `06` | docs |
| Création, nom déjà pris | 409 | `create/07-edge-nom-deja-pris` | docs |
| Création, `brewery_id` inexistant | 422 | `create/08-edge-brewery-id-inexistant` | docs |
| Renommage / `null` efface la colonne | 200 | `update/01`, `02` | docs |
| Modification, corps vide, champ inconnu, id non numérique | 400 | `update/03`, `04`, `06` | docs |
| Modification, id inexistant | 404 | `update/05-edge-id-inexistant` | docs |
| Modification, nom déjà pris | 409 | `update/07-edge-nom-deja-pris` | docs |
| Modification, `brewery_id` inexistant | 422 | `update/08-edge-brewery-id-inexistant` | docs |
| Suppression d'une bière existante | 204 | `delete/01-nominal-suppression` | docs |
| Suppression, id inexistant | 404 | `delete/02-edge-id-inexistant` | docs |
| Suppression, id non numérique | 400 | `delete/03-edge-id-non-numerique` | docs |

### 4.9 Photos de bière (`beers/create-photo/`)

| Cas | Attendu | Requête | Vérif. |
| --- | --- | --- | --- |
| Upload avec / sans caption | 201 | `02`, `03` | docs |
| Sans fichier, caption trop longue ou vide, champ inconnu | 400 | `04`, `06`, `07`, `08` | docs |
| Type de fichier hors liste blanche | 415 | `05-edge-mimetype-hors-whitelist` | docs |
| Bière inexistante | 404 | `09-edge-biere-inexistante` | docs |
| Id de bière non numérique | 400 | `10-edge-id-non-numerique` | docs |
| Lecture d'une photo existante | 200 | `12-nominal-verif-avant-suppression` | docs |
| Suppression d'une photo existante | 204 | `13-nominal-suppression` | docs |
| Lecture / suppression d'une photo inexistante | 404 | `14`, `16` | auto |
| Lecture / suppression, `photoId` non numérique | 400 | `15`, `17` | auto |

## 5. Couverture sécurité

| Risque | Cas qui le couvre |
| --- | --- |
| Accès sans authentification | 4.3 (après logout), 4.4, 4.6 |
| Token falsifié ou invalide | 4.5 `02-edge-token-invalide` |
| Modification du compte d'un autre utilisateur | 4.5 `07-edge-patch-autre-user` |
| Élévation de privilège par le body | 4.5 `10-edge-champ-inconnu` (`role` refusé) |
| Énumération des comptes au login | 4.2 : même 401 pour email inconnu et mot de passe incorrect |
| Entrées malformées | Tous les cas `edge` en 400 |
| Upload de fichier dangereux | 4.9 `05-edge-mimetype-hors-whitelist` (415) |

## 6. Limites et évolutions prévues

- Ajouter des assertions `res.status` aux 50 requêtes qui n'en ont pas, pour que
  le run échoue de lui-même en cas de régression.
- Tests unitaires des services et repositories (`auth.service`, `users.service`,
  `users.repository`).
- Tests de l'interface client et parcours end-to-end (inscription → connexion →
  dashboard → déconnexion).
- Exécution automatique de la collection en intégration continue.
