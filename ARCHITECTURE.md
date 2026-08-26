# Architecture

Comment le code est organisé — pour "comment lancer le projet", voir [`README.md`](README.md).

## Arborescence de `src/`

```
src/
├── app.js            # assemblage de l'app Express (seul fichier direct sous src/)
├── config/           # wiring infra/env — lit process.env, aucune valeur en dur
├── errors/           # classes d'erreur métier, transverses aux features
├── features/         # une ressource = un dossier, toutes ses couches collocées
│   ├── beers/        # seule ressource complète, routes montées dans app.js
│   ├── addresses/    # les six autres : *.schemas.js seul, pas encore exposées
│   ├── breweries/
│   ├── categories/
│   ├── ingredients/
│   ├── outlets/
│   └── photos/
└── http/             # tout ce qui touche au cycle req/res
    ├── apiResponse.js   # forme des réponses (enveloppe)
    ├── httpStatus.js    # codes HTTP nommés
    ├── errors/          # classes d'erreur de protocole
    └── middlewares/     # middlewares Express réutilisés par plusieurs features
```

Une feature n'a pas à naître complète. Six d'entre elles n'ont qu'un
`*.schemas.js` réduit au bloc Model : leurs briques de champ existent parce
qu'une autre ressource les référence (`BreweryFields.Id` dans un DTO de bière),
pas parce qu'un endpoint les attend. Seul `beers` est monté dans `app.js`.

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
├── beers.service.js      # logique métier : existence, traduction des erreurs pg
├── beers.repository.js   # accès DB (requêtes SQL via `pg`)
└── beers.schemas.js      # schémas zod : model, DTOs, réponses
```

Flow d'une requête : `routes → controller → service → repository → pool pg`.

Le service est la frontière où le vocabulaire de Postgres devient celui du
domaine : une violation de contrainte `pg` y est traduite en `ConflictError` ou
`InvalidReferenceError`, une ligne absente en `ResourceNotFoundError`. C'est ce
qui permet au contrôleur d'ignorer `pg` et à l'`errorHandler` de ne connaître
que des classes d'erreur. Un service n'est un passthrough que tant qu'aucune de
ces règles ne s'applique — c'est le cas de `findAll`, pas des autres.

## `*.schemas.js` — un seul fichier, plusieurs responsabilités marquées

Chaque schéma zod de ressource est structuré en blocs commentés :

- **Model** (`BeerFields`) — forme et bornes d'un champ, sans comportement.
  Clés en PascalCase, jamais spreadées telles quelles dans un DTO.
- **DTOs entrée** (`NewBeer`, `UpdateBeer`) — contrat d'un endpoint,
  l'optionalité y est déclarée, pas dans le model.
- **Params** (`BeerIdParam`) — un segment d'URL, donc une coercition : la brique
  de champ attend un nombre, l'URL n'apporte qu'une string.
- **DTOs sortie** (`Beer`, `BeerDetails`) — la ressource nue, réutilisable dans
  plusieurs enveloppes. Deux formes cohabitent : `Beer` porte les seules
  colonnes de la table, `BeerDetails` y agrège brasserie, composition, points de
  vente et statistiques d'avis — la forme rendue par `findOne`.
- **Réponses** (`BeerResponse`, `BeerDetailsResponse`, `BeerListResponse`) —
  DTO de sortie + enveloppe HTTP, ce que le contrôleur sérialise réellement.

## Nomenclature

Trois registres, une frontière nette :

| Registre     | Où                                       | Exemple                                      |
| ------------ | ---------------------------------------- | -------------------------------------------- |
| `PascalCase` | briques de champ du model                | `BeerFields.AlcoholContent`                  |
| `snake_case` | colonnes Postgres **et** clés de payload | `alcohol_content`, `is_allergen`             |
| `camelCase`  | code applicatif                          | `findAll`, `sendItem`, `isServerErrorStatus` |

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

## Erreurs

Une seule forme, `{ error }`, produite par le seul `errorHandler` — monté en
dernier dans `app.js`, c'est le `catch` de l'application. Aucune couche ne
répond une erreur elle-même : elle lève, l'`errorHandler` traduit.

### Deux familles, deux dossiers

Une classe d'erreur vit selon ce qu'elle décrit, pas selon qui la lève :

| Dossier         | Ce qu'elle décrit                                    | Classes                                                           |
| --------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `#errors/`      | une règle du **domaine**, indépendante du transport  | `ResourceNotFoundError`, `ConflictError`, `InvalidReferenceError` |
| `#http/errors/` | une règle du **protocole**, sans existence hors HTTP | `ValidationError`, `RouteNotFoundError`                           |

Un doublon de bière est un conflit métier : il resterait un conflit derrière une
CLI ou une file de messages, donc `#errors/`. Un corps qui ne respecte pas son
schéma n'existe que parce qu'il y a une requête, donc `#http/`. La frontière est
rappelée en commentaire dans chaque classe.

### Statut HTTP

`errorHandler` porte l'unique table classe → statut. Une classe absente de cette
table est un imprévu, donc un 500 :

| Classe                                        | Statut |
| --------------------------------------------- | ------ |
| `ResourceNotFoundError`, `RouteNotFoundError` | 404    |
| `ValidationError`                             | 400    |
| `InvalidReferenceError`                       | 422    |
| `ConflictError`                               | 409    |
| _(non répertoriée)_                           | 500    |

Le partage 400 / 422 tient à ce qui est en cause. Un corps malformé, c'est la
syntaxe du contrat : 400. Un corps valide dont une référence ne résout pas —
`brewery_id` pointant une brasserie inexistante — n'est réfutable qu'en
interrogeant la base : 422. Le client corrige la forme dans un cas, la donnée
dans l'autre.

Un 5xx ne sort jamais son message : il porte le SQL, l'hôte, les chemins. Il est
journalisé et remplacé par `"Internal server error"`. Les autres exposent le
message de l'erreur, et `details` s'il y en a — un tableau de
`{ path, message }`, `path` en notation pointée, vide quand l'erreur porte sur le
corps entier. `details` est lu sur l'erreur, jamais déduit du statut : aucune
classe n'est nommée dans ce chemin.

## Documentation OpenAPI

La spec est servie sur `/docs`. Elle a deux sources, et la frontière tient à la
question « est-ce que deux endpoints peuvent partager ça ? » :

- **`src/config/openapi.js`** — ce qui est **partagé**. Les schémas viennent des
  schémas zod eux-mêmes (`z.toJSONSchema`), pour que les contraintes n'existent
  qu'à un seul endroit ; les réponses d'erreur aussi. Un schéma OpenAPI porte le
  nom de sa source zod (`BeerIdParam` → `schemas.BeerIdParam`).
- **JSDoc `@openapi` des routeurs** — ce qui est **documentaire** : chemins,
  méthodes, `tags`, `description`, `operationId`, codes de statut, et jusqu'aux
  `components.parameters`. `swagger-jsdoc` les lit et fusionne les blocs d'un
  même chemin. Le bloc est posé _dans_ le chaînage, juste avant la méthode qu'il
  décrit.

Les `example` sont posés sur le champ partagé, à sa source — le `.meta()` d'une
brique de `*Fields`, pas dans le JSDoc de l'opération. Sur un Schema Object, c'est
`example` au singulier : déprécié en 3.1, mais Swagger UI l'affiche en ligne au
lieu de `#0 = …`. Le pluriel `examples` reste correct au niveau Media Type, donc
sur les corps de requête.

## Imports : relatif vs alias

Convention appliquée à tout `src/` :

- **Même dossier (même feature)** → import relatif (`./beers.controller.js`).
- **Dossier différent** (autre feature, `config/`, `errors/`, `http/`)
  → alias déclaré dans le champ `imports` de `package.json` :
  `#features/*`, `#config/*`, `#http/*`, `#errors/*`.

Un alias pointe une racine, pas chaque sous-dossier : les middlewares vivant
sous `src/http/middlewares/`, ils s'importent via `#http/middlewares/…` — il n'y
a pas d'alias `#middlewares/*`.

Alias natifs Node (spec ESM, préfixe `#` imposé), pas de bundler ni de
`tsconfig.paths` — zéro dépendance, résolu directement par `node`.

## `requests/*.http`

Fichiers scratch REST Client (extension VSCode) — requêtes manuelles contre
un serveur vivant, un fichier par ressource. Aucune assertion, jamais importé
par le code : outillage de dev, pas une suite de tests automatisée.
