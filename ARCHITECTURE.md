# Architecture

Comment le code est organisé — pour "comment lancer le projet", voir [`README.md`](README.md).

## Arborescence de `src/`

```
src/
├── app.js            # assemblage de l'app Express (seul fichier direct sous src/)
├── config/           # wiring infra/env — lit process.env, aucune valeur en dur
├── features/         # une ressource = un dossier, toutes ses couches collocées
│   ├── beers/
│   └── breweries/
├── http/             # utilitaires transverses liés au cycle req/res (enveloppe de réponse)
└── middlewares/       # middlewares Express (req, res, next) réutilisés par plusieurs features
```

`src/` ne contient que du code chargé au build/runtime de l'app. Rien qui vit
en dehors de ce contrat (fichiers `.http` de dev, docs, config Docker...) n'y
a sa place — voir `requests/`, `docs/`, racine du repo.

## Une feature = une ressource

Chaque dossier sous `features/` collocate les couches d'une même ressource
plutôt que de les séparer par couche technique :

```
features/beers/
├── beers.routes.js       # déclaration des routes Express
├── beers.controller.js   # req/res, appelle le service, formate la réponse
├── beers.service.js      # logique métier (actuellement un simple passthrough)
├── beers.repository.js   # accès DB (requêtes SQL via `pg`)
└── beers.schemas.js      # schémas zod : model, DTOs, réponses
```

Flow d'une requête : `routes → controller → service → repository → pool pg`.

## `*.schemas.js` — un seul fichier, plusieurs responsabilités marquées

Chaque schéma zod de ressource est structuré en blocs commentés :

- **Model** (`BeerFields`) — forme et bornes d'un champ, sans comportement.
  Clés en PascalCase, jamais spreadées telles quelles dans un DTO.
- **DTOs entrée** (`NewBeer`, `UpdateBeer`) — contrat d'un endpoint,
  l'optionalité y est déclarée, pas dans le model.
- **DTOs sortie** (`Beer`) — la ressource nue, réutilisable dans plusieurs
  enveloppes.
- **Réponses** (`BeerResponse`, `BeerListResponse`) — DTO de sortie + enveloppe
  HTTP, ce que le contrôleur sérialise réellement.

## Nomenclature

Trois registres, une frontière nette :

| Registre | Où | Exemple |
| --- | --- | --- |
| `PascalCase` | briques de champ du model | `BeerFields.AlcoholContent` |
| `snake_case` | colonnes Postgres **et** clés de payload | `alcohol_content`, `is_allergen` |
| `camelCase` | code applicatif | `findAll`, `sendItem`, `isServerErrorStatus` |

Aligner le payload sur les colonnes supprime toute couche de mapping : le
repository écrit `SELECT alcohol_content` sans alias, le contrôleur passe
`req.body` au service sans traduction. L'inverse coûterait un `AS
"alcoholContent"` — guillemets obligatoires, Postgres repliant tout identifiant
non quoté en minuscules — sur chaque colonne, dans les deux sens. Un mapping
tenu à la main sur chaque champ est un endroit où le code et la doc divergent en
silence : un `AS "ratingStats"` a déjà disparu d'une réécriture sans que rien ne
le signale.

Aucun standard ne tranche : ni RFC 8259, ni JSON Schema, ni OpenAPI ne se
prononcent sur la casse des noms de membres. Les guides de style recommandent
camelCase (Google, Microsoft), les API les plus utilisées font du snake_case
(Stripe, GitHub, Slack, OpenAI, Shopify). Le prix assumé du choix retenu : du
snake_case apparaît dans du JavaScript aux frontières — `req.body.alcohol_content`,
les lignes rendues par `pg` — jamais dans la logique.

## Enveloppe de réponse

`src/http/apiResponse.js` décrit la forme des réponses ; les producteurs réels
vivent ailleurs et doivent rester alignés sur ce qu'il décrit :

- Succès unique : `{ data }`
- Succès collection : `{ data, meta: { total } }`
- Les fabriques (`ApiResponse`, `ApiListResponse`) alimentent la spec OpenAPI ;
  les contrôleurs appellent `res.sendItem`/`res.sendCollection` (attachés par
  `attachResponseHelpers`), jamais de `res.json({...})` à la main — les deux
  chemins doivent rester alignés sur la même forme.

Erreurs : une seule forme, `{ error }`, produite par le seul `errorHandler`.
Un 400 de validation y ajoute `details`, un tableau de `{ path, message }` —
`path` en notation pointée, vide quand l'erreur porte sur le corps entier.

## Documentation OpenAPI

`src/config/openapi.js` génère la spec depuis les schémas zod eux-mêmes
(`z.toJSONSchema`), pour que les contraintes n'existent qu'à un seul endroit.
Servie sur `/docs`.

## Imports : relatif vs alias

Convention appliquée à tout `src/` :

- **Même dossier (même feature)** → import relatif (`./beers.controller.js`).
- **Dossier différent** (autre feature, `config/`, `middlewares/`, `http/`)
  → alias déclaré dans le champ `imports` de `package.json` :
  `#features/*`, `#config/*`, `#middlewares/*`, `#http/*`.

Alias natifs Node (spec ESM, préfixe `#` imposé), pas de bundler ni de
`tsconfig.paths` — zéro dépendance, résolu directement par `node`.

## `requests/*.http`

Fichiers scratch REST Client (extension VSCode) — requêtes manuelles contre
un serveur vivant, un fichier par ressource. Aucune assertion, jamais importé
par le code : outillage de dev, pas une suite de tests automatisée.
