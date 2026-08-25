# Zythologue — API

API REST (Node.js / Express) pour un catalogue de bières artisanales, bâtie sur la base de données modélisée en Merise la semaine précédente.

> 🗃️ **Modélisation & base de données** (MCD / MLD / MPD, schéma SQL, Docker) : voir [`db/README.md`](db/README.md).
> 🏗️ **Architecture du code** (structure de `src/`, conventions) : voir [`ARCHITECTURE.md`](ARCHITECTURE.md).
> 🤝 **Contribuer** (commits, nommage, vérifications) : voir [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Focus de la semaine

Mise en place des **endpoints API** exposant les données du modèle en JSON, sur la base PostgreSQL existante.

## Lancer

```bash
cp .env.example .env    # paramètres locaux (ignorés par Git)
docker compose watch    # PostgreSQL + API, rechargement à chaud
```

API sur `http://localhost:3000`, Swagger sur `/docs`.

`docker compose watch` tourne au premier plan (Ctrl+C pour arrêter). `src/` et `server.js` sont montés en bind mount : le fichier de l'hôte est directement lu par le conteneur, sans étape de copie. Un `pnpm-lock.yaml` modifié reconstruit l'image.

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

## Rechargement à chaud : pourquoi nodemon

Sous Docker Desktop Windows, les événements inotify ne traversent pas le montage
(limitation de l'implémentation CIFS dans le noyau Linux). Conséquence mesurée sur ce
projet : `node --watch` ne redémarre **jamais** sur un fichier modifié depuis l'hôte, et
il n'expose aucune option de polling (`--watch-path` change *ce qui* est surveillé, pas
*comment*).

Le script `dev` utilise donc nodemon avec `--legacy-watch`, qui active le polling de
chokidar. C'est le polling qui est nécessaire, pas nodemon en soi : la seule API node
qui polle est `fs.watchFile`, jamais accessible via le flag `--watch`.

> ⚠️ L'approche précédente (`compose watch` en `action: sync`, sans bind mount) est un
> piège : le sync remplace le fichier par un nouvel inode, donc le watch inotify de node
> reste accroché à l'inode orphelin et ne voit plus rien
> ([docker/compose#11090](https://github.com/docker/compose/issues/11090)). Pire, les
> fichiers synchronisés vivent dans la couche writable du conteneur : tout `recreate` les
> écrase et fait resurgir le code figé dans l'image
> ([docker/compose#11102](https://github.com/docker/compose/issues/11102)). Le bind mount
> supprime les deux problèmes en faisant de l'hôte la source de vérité.
