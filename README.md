# Zythologue — API

API REST (Node.js / Express) pour un catalogue de bières artisanales, bâtie sur la base de données modélisée en Merise la semaine précédente.

> 🗃️ **Modélisation & base de données** (MCD / MLD / MPD, schéma SQL, Docker) : voir [`db/README.md`](db/README.md).

## Focus de la semaine

Mise en place des **endpoints API** exposant les données du modèle en JSON, sur la base PostgreSQL existante.

## Lancer

```bash
cp .env.example .env    # paramètres locaux (ignorés par Git)
pnpm install
docker compose up -d    # démarre PostgreSQL
pnpm dev                # lance l'API en watch
```

API sur `http://localhost:3000`.
