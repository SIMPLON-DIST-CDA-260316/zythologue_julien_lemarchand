# Zythologue — Base de données pour amateurs de bières artisanales

Exercice pédagogique autour de **Merise** : modéliser une base de données en parcourant les trois niveaux **MCD** (conceptuel), **MLD** (logique) et **MPD** (physique).

> Énoncé d'origine : [brief du projet](docs/références/brief.md).

## Démarche

Projet mené sans déléguer le fond à l'IA : elle a servi d'accompagnatrice — débloquer, outiller, mettre en forme, épauler la rédaction — mais la modélisation et le contenu restent les miens. Dans ce cadre, j'ai privilégié des outils reposant sur une **source de vérité** unique, manipulable par un humain comme par une IA. D'où le choix de **[Mocodo](https://github.com/laowantong/mocodo)** : un seul fichier — [`modeles/zytho.mcd`](modeles/zytho.mcd) — décrit le modèle et génère les trois niveaux (MCD, MLD, MPD). Un [script de génération](scripts) régénère toutes les sorties en une commande, pratique pour répercuter chaque ajustement.

L'exercice a aussi montré les **limites de l'outil** :

- **Contraintes partielles** : les sorties SQL ne portent que les clés primaires et étrangères ; `CHECK`, valeurs par défaut et clés secondaires (`UNIQUE`) sont ajoutés à la main.
- **MPD non diagrammé** : pas de sortie SVG pour le MPD, seulement du SQL et du DBML. Le modèle physique est donc finalisé à la main et aligné sur la syntaxe et les types propres au SGBD ciblé — ici PostgreSQL.
- **Langues mêlées non natives** : Mocodo ne gère pas d'emblée un MCD en français, un MLD en anglais et un MPD directement compatible Postgres. Le fichier `.mcd` a demandé des configurations complémentaires, plus ou moins lourdes, pour surcharger les libellés français à la génération.

Outil avant tout pédagogique pour apprendre Merise, pas pensé pour la production.

## Livrables

### Documentation

- [Analyse](docs/analyse.md)
- [Règles de gestion](docs/regles-gestion.md)
- [Dictionnaire de données](docs/dictionnaire-donnees.md)
- [MCD (Modèle Conceptuel)](docs/mcd.md)
- [MLD (Modèle Logique)](docs/mld.md)
- [MPD (Modèle Physique)](docs/mpd.md)

> Source unique du modèle : [`modeles/zytho.mcd`](modeles/zytho.mcd) (typée, sert les 3 niveaux).

### Base de données (PostgreSQL)

Le SQL livré est repris de la base générée par Mocodo puis fini à la main (contraintes que Mocodo ne porte pas : `CHECK`, `DEFAULT`, `UNIQUE` secondaire, `ON DELETE`).

- [01 — Schéma](sql/01_create_schema.sql)
- [02 — Jeu de données](sql/02_seed.sql)
- [03 — Requêtes](sql/03_queries.sql)

## Générer les diagrammes (Mocodo)

> Prérequis : `pip install mocodo`.
> **Source unique** : `modeles/zytho.mcd` → **sorties** dans `docs/generated/`.

```bash
pnpm gen:mcd          # PowerShell (Windows)
pnpm gen:mcd:bash     # Bash (Linux / macOS / WSL / Git Bash)
```

> Le placement des entités est manuel : sur le hub `PHOTO` (non-planaire), il donne un meilleur rendu que le ré-agencement automatique de Mocodo.

Sorties produites depuis la source typée :

| Niveau | Fichier généré |
|--|--|
| **MCD** conceptuel (SVG) | `zytho.svg` |
| **MLD** relationnel (SVG + texte) | `zytho_mld.svg` · `zytho_mld.md` |
| **MPD** physique (tables typées) | `zytho_ddl.dbml` · `zytho_ddl.sql` |

> **MPD visuel** : mocodo ne dessine pas de tables typées en SVG. Coller `zytho_ddl.dbml` dans [dbdiagram.io](https://dbdiagram.io) pour le rendu (PK/FK/types).

## Lancer le projet

PostgreSQL est fourni via Docker (image PostgreSQL 18, volume persistant).

```bash
cp .env.example .env      # paramètres locaux (ignorés par Git)
docker compose up -d      # démarre PostgreSQL en arrière-plan
docker ps                 # vérifier que le conteneur tourne
```

Arrêter / redémarrer / réinitialiser :

```bash
docker compose stop       # arrête sans perdre les données
docker compose start      # redémarre
docker compose down -v    # supprime conteneur + données
```

## Connexion DBeaver

Valeurs par défaut (modifiables dans `.env`) :

| Paramètre | Valeur |
|--|--|
| Host | `localhost` |
| Port | `5432` (`POSTGRES_PORT`) |
| Database | `zythologue` (`POSTGRES_DB`) |
| Username | `zythologue` (`POSTGRES_USER`) |
| Password | `zythologue` (`POSTGRES_PASSWORD`) |

## Exécuter les scripts SQL

À jouer **dans l'ordre**, une fois connecté à la base (DBeaver ou `psql`) :

| Ordre | Fichier | Rôle |
| -- | -- | -- |
| 1 | [`sql/01_create_schema.sql`](sql/01_create_schema.sql) | types, tables, contraintes, triggers |
| 2 | [`sql/02_seed.sql`](sql/02_seed.sql) | jeu de données de test |
| 3 | [`sql/03_queries.sql`](sql/03_queries.sql) | requêtes demandées |

> `01_create_schema.sql` commence par un `DROP` des tables : il est **rejouable** sans erreur.

