# Zythologue

Catalogue de bières artisanales : une API REST (Node.js / Express) sur la base de données modélisée en Merise, et un dashboard d'administration (React).

> 🗃️ **Modélisation & base de données** (MCD / MLD / MPD, schéma SQL) : voir [`db/README.md`](db/README.md).\
> 🏗️ **Architecture de l'API** (structure de `src/`, conventions) : voir [`ARCHITECTURE.md`](apps/api/ARCHITECTURE.md).\
> 🔐 **Authentification & autorisation** (inscription, connexion, déconnexion, JWT, middlewares) : voir [`AUTH.md`](apps/api/AUTH.md).\
> 🖥️ **Client** (stack, routes, arborescence FSD) : voir [`apps/client/README.md`](apps/client/README.md).\
> 🤝 **Contribuer** (flux Git, commits, nommage, vérifications) : voir [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Fonctionnalités

- **Bières** — CRUD sur la base PostgreSQL, et photos (upload, lecture, suppression).
- **Comptes utilisateur·ice** — inscription, connexion et déconnexion (JWT en cookie httpOnly), profil de l'utilisateur·ice connecté·e (`GET /users/me`), modification de son propre compte. Détails : [`AUTH.md`](apps/api/AUTH.md).
- **Dashboard** — pages d'inscription et de connexion, tableau de bord, déconnexion depuis le menu utilisateur.

## Lancer

```bash
cp .env.example .env          # paramètres locaux (ignorés par Git)
docker compose up --watch     # PostgreSQL, API, client, Adminer
```

| Service | URL                          |
| ------- | ---------------------------- |
| Client  | <http://localhost:5173>      |
| API     | <http://localhost:3000>      |
| Swagger | <http://localhost:3000/docs> |
| Adminer | <http://localhost:8080>      |

`docker compose up --watch` tourne au premier plan (Ctrl+C pour arrêter). Le mode watch copie (`sync`) le code de `apps/api` et `apps/client` dans les conteneurs à chaque modification, où nodemon et Vite rechargent à chaud. Un `pnpm-lock.yaml` ou un `package.json` modifié reconstruit l'image. Sans `--watch`, rien n'est synchronisé.

API hors conteneur (débogueur attaché) :

```bash
pnpm install
docker compose up -d postgres
pnpm dev
```

## Base de données

Le premier démarrage applique les scripts de `db/sql/`. Ensuite :

```bash
pnpm db:reset           # schéma + jeu de données
pnpm db:psql            # console psql
```

### Comptes de test

Le jeu de données crée ces comptes, tous avec le mot de passe de dev `Zytho123!` (jamais en production) :

| Email | Rôle |
|---|---|
| `admin@zytho.test` | admin |
| `brasseur1@zytho.test`, `brasseur2@zytho.test` | brewer |
| `marie@zytho.test`, `lucas@zytho.test`, `nadia@zytho.test`, `thomas@zytho.test`, `eva@zytho.test` | customer |

## Tests

Les requêtes [Bruno](https://www.usebruno.com) de `apps/api/bruno/` testent l'API (statuts, corps, cookies) contre le serveur local :

```bash
pnpm test:bruno
```

Les requêtes utilisent leur propre compte, `bruno@zytho.test` (même mot de passe), défini dans `apps/api/bruno/environments/Local.bru` : la collection le crée elle-même, il n'est pas dans le jeu de données.
