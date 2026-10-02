# Architecture

Comment le code est organisé — pour "comment lancer le projet", voir [`README.md`](../../README.md).

Monorepo pnpm : l'API vit dans `apps/api/` (package `api`). Les chemins
ci-dessous sont relatifs à `apps/api/`.

## Arborescence de `src/`

```
src/
├── app.js            # assemblage de l'app Express (seul fichier direct sous src/)
├── config/           # wiring infra/env — lit process.env, aucune valeur en dur
├── errors/           # classes d'erreur métier, transverses aux features
├── features/         # une ressource = un dossier, toutes ses couches collocées
│   ├── beers/        # ressources exposées, routes montées dans app.js
│   ├── users/
│   ├── auth/         # connexion/déconnexion : pas de table, + auth.lib.js (hash, JWT)
│   ├── photos/       # *.schemas.js + repository, appelé par le service de beers
│   ├── upload/       # middleware multer + service fichiers, utilisé par beers
│   ├── addresses/    # *.schemas.js seul, pas encore exposées
│   ├── breweries/
│   ├── categories/
│   ├── ingredients/
│   └── outlets/
├── shared/           # schémas zod communs à plusieurs ressources (Id, dates)
└── http/             # tout ce qui touche au cycle req/res
    ├── apiResponse.js   # forme des réponses (enveloppe)
    ├── httpStatus.js    # codes HTTP nommés
    ├── errors/          # classes d'erreur de protocole
    └── middlewares/     # middlewares Express réutilisés par plusieurs features
```

Une feature n'a pas à naître complète. Cinq d'entre elles n'ont qu'un
`*.schemas.js` réduit au bloc Model : leurs briques de champ existent parce
qu'une autre ressource les référence (`BreweryFields.Id` dans un DTO de bière),
pas parce qu'un endpoint les attend. `app.js` monte `/beers`, `/users` et
`/auth`.

`src/` ne contient que du code chargé au build/runtime de l'app. Rien qui vit
en dehors de ce contrat (collection Bruno de dev, docs, config Docker...) n'y
a sa place — voir `bruno/`, `docs/`, `Dockerfile`, racine du repo.

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
- Succès collection : `{ data, meta: { total, page, size } }`
- Les fabriques (`ApiResponse`, `ApiListResponse`) alimentent la spec OpenAPI ;
  les contrôleurs appellent `res.sendItem`/`res.sendCollection` (attachés par
  `attachResponseHelpers`), jamais de `res.json({...})` à la main — les deux
  chemins doivent rester alignés sur la même forme.
- `pick(schema, row)` ne garde d'une ligne que les clés déclarées par un schéma
  de sortie : `GET /users/me` renvoie `pick(SafeUser, req.user)`, sans
  `hashed_password`.

## Erreurs

Une seule forme, `{ error }`, produite par le seul `errorHandler` — monté en
dernier dans `app.js`, c'est le `catch` de l'application. Aucune couche ne
répond une erreur elle-même : elle lève, l'`errorHandler` traduit.

### Deux familles, deux dossiers

Une classe d'erreur vit selon ce qu'elle décrit, pas selon qui la lève :

| Dossier         | Ce qu'elle décrit                                    | Classes                                                           |
| --------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `#errors/`      | une règle du **domaine**, indépendante du transport  | `ResourceNotFoundError`, `ConflictError`, `InvalidReferenceError`, `InvalidCredentialsError`, `UnauthorizedError`, `ForbiddenError`, `UnsupportedMediaTypeError` |
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
| `InvalidCredentialsError`, `UnauthorizedError` | 401 |
| `ForbiddenError`                              | 403    |
| `ConflictError`                               | 409    |
| `UnsupportedMediaTypeError`                   | 415    |
| `InvalidReferenceError`                       | 422    |
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
- **Dossier différent** (autre feature, `shared/`, `config/`, `errors/`, `http/`)
  → alias déclaré dans le champ `imports` de `package.json` :
  `#features/*`, `#shared/*`, `#config/*`, `#http/*`, `#errors/*`.

Un alias pointe une racine, pas chaque sous-dossier : les middlewares vivant
sous `src/http/middlewares/`, ils s'importent via `#http/middlewares/…` — il n'y
a pas d'alias `#middlewares/*`.

Alias natifs Node (spec ESM, préfixe `#` imposé), pas de bundler ni de
`tsconfig.paths` — zéro dépendance, résolu directement par `node`.

## `bruno/`

Collection [Bruno](https://www.usebruno.com/) — tests d'API contre un serveur
vivant, jamais importés par le code. Un dossier par endpoint
(`beers/create/`, `users/me/`…, l'authentification sous `account/`), un
fichier `.bru` par scénario, numéroté dans l'ordre d'exécution : étapes de
préparation (`01-setup-login`), cas `nominal` et `edge`, remise en état
(`04-restore-session`). Chaque requête porte ses assertions (statut, corps,
cookies).

- `pnpm test:bruno` (`bru run . --env Local -r`) joue toute la collection ;
  elle reste utilisable à la main dans l'application Bruno.
- `environments/Local.bru` définit l'URL de l'API et le compte de test
  (`{{testEmail}}`, `{{testPassword}}`), utilisés par toutes les requêtes.
- Le cookie de session est partagé entre les requêtes d'un même run : un test
  qui se déconnecte doit rétablir la session pour les suivants.
- `fixtures/` contient les fichiers envoyés par les tests d'upload.
