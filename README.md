# Zythologue — API

API REST (Node.js / Express) pour un catalogue de bières artisanales, bâtie sur la base de données modélisée en Merise la semaine précédente.

> 🗃️ **Modélisation & base de données** (MCD / MLD / MPD, schéma SQL, Docker) : voir [`db/README.md`](db/README.md).

## Focus de la semaine

Mise en place des **endpoints API** exposant les données du modèle en JSON, sur la base PostgreSQL existante.

## Lancer

```bash
cp .env.example .env    # paramètres locaux (ignorés par Git)
docker compose watch    # PostgreSQL + API, rechargement à chaud
```

API sur `http://localhost:3000`, Swagger sur `/docs`.

`docker compose watch` tourne au premier plan (Ctrl+C pour arrêter) et synchronise `src/` et `server.js` dans le conteneur ; `pnpm-lock.yaml` modifié reconstruit l'image.

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

> ⚠️ Pas de bind mount sur le service `api` : sous Docker Desktop Windows, inotify n'est pas propagé au conteneur et le rechargement à chaud casse. C'est `compose watch` qui pousse les fichiers.
