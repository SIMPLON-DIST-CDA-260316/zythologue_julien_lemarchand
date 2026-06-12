# Zythologue - Base de données pour amateurs de bières artisanales

![Visuel du brief Zythologue](../../img/bier.png)

---

# Contexte du projet

Vous allez concevoir une application web ou mobile destinée aux amateurs de bières artisanales.

L'application devra permettre de découvrir des bières, de consulter leur origine, leurs caractéristiques et leurs ingrédients, mais aussi de partager des avis et de conserver des préférences.

Avant de développer l'application, vous devez concevoir une base de données relationnelle cohérente. Ce travail doit vous aider à transformer un besoin métier en modèle de données, puis en scripts SQL exécutables avec PostgreSQL.

---

# Objectifs pédagogiques

À travers ce projet, vous devrez apprendre à :

- analyser un besoin métier
- modéliser les données avec MERISE
- concevoir une base PostgreSQL
- écrire des scripts SQL
- alimenter une base avec des données de test
- utiliser une configuration Docker fournie
- documenter vos choix de modélisation

---

# Partie 1 - Analyse et MERISE

## Travail demandé

Vous devez produire les éléments suivants :

- un dictionnaire de données
- des règles de gestion
- un MCD
- un MLD
- un MPD

---

## Dictionnaire de données

Le dictionnaire devra décrire les données importantes du projet.

Pour chaque donnée, précisez :

- son nom
- sa description
- son caractère obligatoire ou facultatif
- une éventuelle règle métier

---

## Règles de gestion

Les règles doivent être rédigées sous forme de phrases métier.

Un support d'aide est disponible dans [`docs/aide-regles-gestion.md`](docs/aide-regles-gestion.md).

Exemples de formulation :

```text
Un utilisateur peut ...

Une bière doit ...

Une brasserie peut ...

Un avis concerne ...
```

---

## MCD

Le MCD devra représenter :

- les entités
- les attributs
- les associations
- les cardinalités

---

## MLD

Le MLD devra préparer le passage au modèle relationnel :

- les tables
- les clés primaires
- les clés étrangères
- les tables de liaison

---

## MPD

Le MPD devra préparer l'implémentation PostgreSQL :

- les types de données
- les contraintes
- les règles d'intégrité
- le comportement des suppressions, si nécessaire

---

# Partie 2 - Périmètre fonctionnel

L'application devra permettre de gérer des informations autour :

- des utilisateurs
- des bières
- des catégories ou styles
- des brasseries
- des avis
- des favoris
- des photos
- des ingrédients

Les propriétés proposées ci-dessous sont volontairement incomplètes. Vous devez compléter et justifier votre modèle.

---

## Utilisateurs

Exemples de données possibles :

- prénom
- email
- mot de passe

---

## Bières

Exemples de données possibles :

- nom
- description
- taux d'alcool
- prix

---

## Catégories / Styles

Exemples de données possibles :

- nom
- description

---

## Brasseries

Exemples de données possibles :

- nom
- pays
- ville

---

## Avis

Les utilisateurs peuvent laisser une note et un commentaire sur une bière.

---

## Favoris

Les utilisateurs peuvent enregistrer des bières dans leurs favoris.

---

## Photos

Une bière peut être illustrée par une ou plusieurs photos.

---

## Ingrédients

Les bières peuvent être composées de plusieurs ingrédients.

---

# Partie 3 - SQL

À partir de votre MPD, vous devrez créer les scripts SQL suivants :

```text
sql/
├── 01_create_schema.sql
├── 02_seed.sql
└── 03_queries.sql
```

---

## 01_create_schema.sql

Ce fichier devra contenir les instructions de création des tables.

Il devra intégrer :

- les clés primaires
- les clés étrangères
- les contraintes NOT NULL
- les contraintes UNIQUE
- les contraintes CHECK, si nécessaire
- les règles de suppression cohérentes, si besoin

---

## 02_seed.sql

Ce fichier devra insérer des données de test.

Les données doivent être suffisantes pour tester toutes les requêtes demandées.

---

## 03_queries.sql

Ce fichier devra contenir les requêtes suivantes :

1. Lister les bières par taux d'alcool croissant
2. Afficher le nombre de bières par catégorie ou style
3. Trouver toutes les bières d'une brasserie donnée
4. Lister les utilisateurs et le nombre de bières ajoutées à leurs favoris
5. Ajouter une nouvelle bière à la base de données
6. Afficher les bières avec leur brasserie, triées par pays
7. Lister les bières avec leurs ingrédients
8. Afficher les brasseries produisant plus de cinq bières
9. Lister les bières qui ne figurent dans aucun favori
10. Trouver les bières favorites communes entre deux utilisateurs
11. Afficher les brasseries dont les bières ont une moyenne de notes supérieure à une valeur donnée
12. Mettre à jour les informations d'une brasserie
13. Supprimer les photos d'une bière donnée

---

# Partie 4 - Docker

Docker est utilisé uniquement pour fournir un environnement PostgreSQL identique à tous les participants.

L'objectif du projet n'est pas d'apprendre Docker en profondeur. Vous devez simplement être capables de lancer la base, de vous y connecter avec DBeaver et d'exécuter vos scripts SQL.

Une configuration `docker-compose.yml` est fournie à la racine du dépôt. Elle lance PostgreSQL 18 avec un volume persistant adapté aux images officielles PostgreSQL 18.

Les valeurs de connexion sont centralisées dans un fichier `.env`.

Un fichier `.env.example` est fourni comme modèle :

```bash
cp .env.example .env
```

Le fichier `.env` est volontairement ignoré par Git afin de garder les paramètres locaux propres à chaque machine.

---

## Lancer PostgreSQL

Depuis la racine du projet, lancez :

```bash
docker compose up -d
```

Vérifier que le conteneur fonctionne :

```bash
docker ps
```

Arrêter le conteneur :

```bash
docker compose stop
```

Redémarrer le conteneur :

```bash
docker compose start
```

Supprimer l'environnement et les données :

```bash
docker compose down -v
```

---

## Connexion DBeaver

Utilisez les informations suivantes pour vous connecter à PostgreSQL :

```text
Host      : localhost
Port      : valeur de POSTGRES_PORT
Database  : valeur de POSTGRES_DB
Username  : valeur de POSTGRES_USER
Password  : valeur de POSTGRES_PASSWORD
```

Avec le fichier `.env` fourni, les valeurs par défaut sont :

```text
Host      : localhost
Port      : 5432
Database  : zythologue
Username  : zythologue
Password  : zythologue
```

Si le port `5432` est déjà utilisé sur votre machine, modifiez `POSTGRES_PORT` dans le fichier `.env`.

Exemple :

```env
POSTGRES_PORT=5433
```

Dans ce cas, utilisez le port `5433` dans DBeaver.

Si vous aviez déjà lancé une ancienne version de PostgreSQL avec ce projet, supprimez l'ancien environnement avant de relancer :

```bash
docker compose down -v
docker compose up -d
```

---

# Partie 5 - Bonus

Les éléments suivants sont optionnels.

---

## Bonus 1 - Traçabilité

Ajouter sur les tables pertinentes :

```text
created_at
updated_at
```

---

## Bonus 2 - Trigger de log

Créer une table de journalisation permettant de conserver une trace lors de l'ajout d'une bière.

Exemple :

```text
beer_log
```

---

## Bonus 3 - Procédure stockée

Créer une procédure permettant à un utilisateur de noter une bière.

Si l'utilisateur a déjà noté cette bière, la note est mise à jour. Sinon, une nouvelle note est ajoutée.

---

# Contraintes techniques

- SGBD obligatoire : PostgreSQL
- NoSQL non autorisé
- Connexion à la base via DBeaver
- Utilisation de la configuration Docker fournie
- Scripts SQL exécutables sans erreur

---

# Livrables attendus

Le travail devra être rendu dans un dépôt GitHub.

Structure attendue :

```text
zythologue/
├── README.md
├── docs/
│   ├── analyse.md
│   ├── regles-gestion.md
│   ├── dictionnaire-donnees.md
│   ├── mcd.png
│   ├── mld.png
│   └── mpd.png
├── sql/
│   ├── 01_create_schema.sql
│   ├── 02_seed.sql
│   └── 03_queries.sql
└── docker-compose.yml
```

---

# README.md attendu

Le README remis par les apprenants devra contenir :

- une présentation rapide du projet
- les instructions de lancement Docker
- les informations de connexion DBeaver
- l'ordre d'exécution des scripts SQL
- les principales hypothèses de modélisation

---

# Modalités d'évaluation

Correction entre pairs et tests des scripts SQL.

Les scripts seront exécutés dans l'ordre suivant :

```text
01_create_schema.sql
02_seed.sql
03_queries.sql
```

---

# Critères d'évaluation

## MERISE

- pertinence des entités
- qualité des règles de gestion
- cohérence du MCD
- cohérence du MLD
- qualité du MPD

---

## SQL

- scripts exécutables sans erreur
- contraintes correctement utilisées
- relations correctement modélisées
- données de test cohérentes
- requêtes SQL fonctionnelles

---

## Documentation

- dépôt lisible
- README clair
- organisation des fichiers respectée

---

# Ressources

- DBeaver : https://dbeaver.io
- PostgreSQL : https://www.postgresql.org
- SQL : https://sql.sh

---

# Conseil

Ne commencez pas par écrire du SQL.

Commencez par comprendre le besoin, identifier les objets métier, rédiger les règles de gestion, puis construire le modèle.

Une bonne base de données commence par une bonne modélisation.
