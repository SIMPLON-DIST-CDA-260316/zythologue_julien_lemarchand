# Le 400 de validation passe par errorHandler

Date : 2026-08-26
Branche de départ : `main`, HEAD `0eaa9f0`

## Problème

Neuf commits (`5617005` → `79bbc10`) ont établi une règle : `errorHandler` est le
seul émetteur de réponse en erreur. Les couches en amont lèvent et font
`next(error)`.

`src/http/middlewares/validateRequest.js` n'a pas suivi. Sa fonction `reject`
répond directement :

```js
const reject = (res, error) => res.status(400).json({ errors: error.issues });
```

Quatre conséquences, chacune contredisant un invariant écrit ailleurs dans le
code :

| Invariant déclaré | Fichier | Ce que fait `reject` |
| --- | --- | --- |
| « seul propriétaire de leur forme, succès et échec » | `apiResponse.js:2` | invente une troisième forme, `{ errors: [...] }` |
| `ApiError` « émis par `errorHandler`, seul producteur » | `apiResponse.js:27` | produit un corps d'erreur sans lui |
| « seul point où le domaine reçoit un code HTTP » | `errorHandler.js:5` | écrit `400` en littéral, hors `httpStatus.js` |
| « le format de la réponse 400 est défini ici » | `validateRequest.js:6` | l'aveu, écrit avant les neuf commits |

Deux problèmes de structure s'y ajoutent :

- **Dépendance inversée.** `src/config/openapi.js:21` importe un schéma de
  *réponse* depuis `#http/middlewares/`. La config lit dans un middleware.
- **Fuite de zod dans le contrat public.** `reject` renvoie `error.issues` brut,
  et le schéma exporté fige `z.ZodIssueCode` dans une enum publiée. Une montée
  de version zod qui renomme un code casse le contrat. Le `looseObject` du
  schéma actuel avoue le problème : la forme publiée n'est pas décrite.

## Objectif

Un seul émetteur de réponse en erreur, une seule forme de corps, aucun code de
statut hors `httpStatus.js`, et la nomenclature zod hors du contrat public.

## Décisions

Prises par l'utilisateur, non rediscutées ici.

1. **Forme du 400** : `{ error, details: [{ path, message }] }`. `path` en
   notation pointée, `message` celui de zod. Pas de `code` zod exposé.
2. **Emplacement de la classe** : `src/http/errors/`. Elle naît de `req.body`,
   `req.params`, `req.query` — trois notions qui n'existent pas hors HTTP. Même
   raisonnement que `9ae7f79` pour `RouteNotFoundError`.
3. **Transport des détails** : `errorHandler` teste `error.details`. Pas de
   `toBody()` sur les classes d'erreur, pas de configuration dans la Map.

### Décisions issues de l'instruction du chantier

4. **`path` est toujours présent, vide quand aucun champ n'est fautif.** Une
   première version omettait la clé. Abandonné : `path.join(".")` sans branche
   est plus court, `path` reste non optionnel dans le schéma, un champ ne peut
   pas porter un nom vide donc `""` ne crée aucune ambiguïté, et côté client
   `if (d.path)` fonctionne naturellement. La règle se documente dans la spec
   publiée, via `.describe()`.
5. **Le constructeur prend les `issues`, pas le `ZodError`.** La classe ne
   connaît pas zod.
6. **La réponse 400 est mutualisée** en `components/responses/BadRequest`. Le
   commit `79bbc10` avait gardé les 400 inline au motif que leur `description`
   variait utilement d'une opération à l'autre. Cet argument tombe :
   `details[].path` nomme désormais le champ fautif, la nuance descriptive
   n'était qu'un palliatif à un corps opaque. On perd un indice de doc
   (« l'ID fourni n'est pas un entier positif »), on supprime quatre blocs
   dupliqués.

### Ce qui a été envisagé puis écarté

- **Un paramètre `pathPrefix` au constructeur**, pour que `validateParam`
  injecte le nom du paramètre et produise `path: "id"`. Écarté après
  vérification en exécution : il y a **trois** situations où le `path` d'une
  issue est vide, et un préfixe n'en couvre qu'une, tout en donnant l'illusion
  de traiter la règle. Voir « Cas limites ».
- **`details` optionnel ajouté à `ApiError`.** Écarté : `ApiError` est le
  contrat des 404 et 500, qui n'émettront jamais ce champ.
- **Le schéma zod placé à côté de la classe, dans `#http/errors/`.** Écarté :
  `a997e47` a fait d'`apiResponse.js` le propriétaire unique de la forme des
  réponses, succès comme échec.
- **`toBody()` sur chaque classe d'erreur.** Écarté : ferait redescendre la
  mise en forme du corps HTTP dans le domaine.
- **La Map portant un objet de configuration** au lieu d'un statut. Écarté :
  alourdit trois entrées pour un seul cas qui en a besoin.

## Nommage

La collision est réelle : `ValidationError` désigne aujourd'hui un schéma zod
exporté, importé par `config/openapi.js` et référencé quatre fois par `$ref`
dans `beers.routes.js`.

| Symbole | Emplacement | Rôle |
| --- | --- | --- |
| `ValidationError` (classe) | `src/http/errors/ValidationError.js` | levée par `validateRequest`, mappée sur 400 |
| `ApiValidationError` (schéma zod) | `src/http/apiResponse.js` | forme du corps 400, alimente `components.schemas` |
| `BadRequest` (Response Object) | `config/openapi.js` | référencé par les quatre opérations |

La classe garde `ValidationError` : la décision 2 fixe son dossier, et
`ApiValidationError` comme nom de classe serait un contresens. Le schéma prend
`ApiValidationError` — il rejoint la famille `ApiResponse` / `ApiListResponse` /
`ApiError` et hérite littéralement du dernier. Le Response Object suit la règle
déjà posée par `NotFound` et `InternalServerError` : la reason phrase du code,
donc `BadRequest`.

## Flux cible

```
validateBody / validateParam
  safeParse échoue
  → next(new ValidationError(error.issues))
      errorHandler
        HTTP_STATUS_BY_ERROR.get(ValidationError) → 400
        → { error: "Validation failed", details: [...] }
```

Plus aucun `res` dans `validateRequest.js`. Le middleware redevient ce que son
nom dit : il valide et écrase, il ne répond pas.

## Code

### `src/http/errors/ValidationError.js` — nouveau

```js
/**
 * Une entrée ne respecte pas son schéma. Erreur de protocole, pas de métier :
 * elle vit dans `#http/`, comme `RouteNotFoundError`.
 *
 * Prend les issues et non le `ZodError` : la classe n'a besoin que de
 * `{ path, message }`. Message fixe, contrairement à ses voisines : nommer les
 * champs fautifs dupliquerait `details`.
 */
export class ValidationError extends Error {
  constructor(issues) {
    super("Validation failed");
    this.name = "ValidationError";
    this.details = issues.map(({ path, message }) => ({
      path: path.join("."),
      message,
    }));
  }
}
```

Cohérence avec les deux classes existantes : `extends Error`, constructeur
prenant des valeurs nues, `this.name` en dur égal au nom de classe, message en
anglais comme `Cannot GET /x` et `Beer with id 3 not found`. Seul écart, assumé
et commenté : le message est fixe au lieu d'être construit depuis l'argument.

### `src/http/apiResponse.js` — ajout

```js
/** Échec de validation : `ApiError`, plus le détail par champ. */
export const ApiValidationError = ApiError.extend({
  details: z.array(
    z.strictObject({
      path: z
        .string()
        .describe(
          "chemin pointé du champ fautif — vide quand l'échec porte sur la valeur validée elle-même : paramètre scalaire, clé inconnue, règle inter-champs",
        ),
      message: z.string(),
    }),
  ),
});
```

`.extend()` sur un `strictObject` conserve le refus des clés inconnues :
`z.toJSONSchema` sort bien `additionalProperties: false`. Le `.describe()` fait
porter la documentation par la spec publiée que le client lit, et non par un
commentaire de code — c'est déjà la convention du dépôt, cf. `beers.schemas.js`.

### `src/http/middlewares/errorHandler.js`

Une entrée dans la table, un spread conditionnel, l'en-tête corrigé.

```js
import { ValidationError } from "#http/errors/ValidationError.js";

/** Seul point où une classe d'erreur reçoit un code HTTP. Absente = imprévu = 500. */
const HTTP_STATUS_BY_ERROR = new Map()
  .set(ResourceNotFoundError, HTTP_STATUS.NOT_FOUND)
  .set(RouteNotFoundError, HTTP_STATUS.NOT_FOUND)
  .set(ValidationError, HTTP_STATUS.BAD_REQUEST);

// …

  // `details` est porté par l'erreur, pas déduit du statut : une future 422
  // métier pourra en fournir sans toucher ici.
  return res.status(status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
  });
```

### `src/http/middlewares/validateRequest.js`

Trois disparitions : le schéma zod `ValidationError` avec son `@typedef` (parti
dans `apiResponse.js`), le helper `reject`, et l'import runtime de zod — les
JSDoc passent déjà par `import("zod").ZodType`.

```js
import { ValidationError } from "#http/errors/ValidationError.js";

// dans validateParam et dans validateIn :
if (!success) return next(new ValidationError(error.issues));
```

`reject` mutualisait la forme de la réponse. Cette forme n'est plus ici ; il ne
reste qu'une ligne identique dans les deux validateurs. La factoriser derrière
un nom n'économise rien et masque le `next` explicite, qui est précisément le
point du chantier. Seul écart assumé à « zéro duplication ».

### `src/config/openapi.js`

- L'import `ValidationError` depuis `#http/middlewares/` disparaît, fusionné
  dans l'import existant : `import { ApiError, ApiValidationError } from "#http/apiResponse.js"`.
  La dépendance inversée est corrigée : `config/` n'importe plus rien de
  `#http/middlewares/`.
- `components.schemas` : `ValidationError` → `ApiValidationError`.
- `components.responses` gagne, en premier :

```js
BadRequest: jsonResponse(
  "Une entrée ne respecte pas son schéma. `details` nomme les champs fautifs.",
  "ApiValidationError",
),
```

### `src/features/beers/beers.routes.js`

Les quatre blocs `400` inline deviennent :

```yaml
 *       400:
 *         $ref: '#/components/responses/BadRequest'
```

Rien d'autre ne change. Le `$ref` du 200 de PATCH reste faux exprès, voir
« Hors périmètre ».

### Documentation devenue fausse

`ARCHITECTURE.md:61-63`, à remplacer — le texte actuel cite `notFound.js`,
supprimé par `035d3c5` :

```markdown
Erreurs : une seule forme, `{ error }`, produite par le seul `errorHandler`.
Un 400 de validation y ajoute `details`, un tableau de `{ path, message }` —
`path` en notation pointée, vide quand l'échec porte sur la valeur validée
elle-même.
```

`requests/beers.http:13-15`, à remplacer :

```
# Toute erreur rend `{ error }`, une string. Un 400 y ajoute `details`, un
# tableau de `{ path, message }` : `path` nomme le champ fautif en notation
# pointée, et reste vide quand l'échec porte sur la valeur elle-même.
```

Plus les trois annotations `→ 400, invalid_type sur …` des lignes 23, 27 et 37 :
le code zod n'est plus exposé, elles deviennent `→ 400, details sur name et
brewery_id` et équivalents.

## Cas limites

Vérifiés en exécutant zod depuis le dépôt, sur les schémas réels. Le `path`
d'une issue est vide dans **trois** situations :

| Cas | Entrée | `code` zod | `path` |
| --- | --- | --- | --- |
| Paramètre scalaire | `IdParam.safeParse("abc")` | `invalid_type` | `[]` |
| `refine` racine | `UpdateBeer.safeParse({})` | `custom` | `[]` |
| Clé inconnue | `NewBeer.safeParse({ nope: 1 })` | `unrecognized_keys` | `[]` |

`IdParam` est `z.coerce.number().pipe(BeerFields.Id)` : il parse une valeur
scalaire, il n'y a aucun chemin à rapporter. Le `refine` de `UpdateBeer` porte
sur le corps entier, aucun champ n'est individuellement fautif. Et
`unrecognized_keys` sur un `strictObject` met la clé fautive dans le *message* —
or **tous** les DTO d'entrée du projet sont des `strictObject`, ce cas est donc
courant. C'est lui qui condamne l'idée d'un préfixe de chemin.

Réponses attendues :

`GET /beers/abc` → 400

```json
{
  "error": "Validation failed",
  "details": [
    { "path": "", "message": "Invalid input: expected number, received NaN" }
  ]
}
```

`PATCH /beers/1` avec le corps `{}` → 400

```json
{
  "error": "Validation failed",
  "details": [
    { "path": "", "message": "Au moins un champ doit être fourni" }
  ]
}
```

`POST /beers` avec `{"nope": 1}` → 400, trois entrées dont deux avec chemin :

```json
{
  "error": "Validation failed",
  "details": [
    { "path": "name", "message": "Invalid input: expected string, received undefined" },
    { "path": "brewery_id", "message": "Invalid input: expected number, received undefined" },
    { "path": "", "message": "Unrecognized key: \"nope\"" }
  ]
}
```

## Commits

Cinq commits, chacun démarre et sert `/docs`. Les deux premiers sont inertes —
le dépôt a déjà ce pattern.

1. **`feat(http): introduit ValidationError`** — `src/http/errors/ValidationError.js`
   seul. Corps du message : pourquoi `#http/` et non `#errors/`, pourquoi la
   classe met elle-même les issues en forme, pourquoi un message fixe. Rien ne
   la lève encore.
2. **`feat(http): décrit le corps d'une erreur de validation`** —
   `ApiValidationError` dans `apiResponse.js`, dérivé d'`ApiError` par
   `.extend()` pour que le champ `error` n'existe qu'une fois. Personne ne
   l'importe encore.
3. **`docs(openapi): mutualise la réponse 400 et aligne son schéma`** —
   `config/openapi.js` et `beers.routes.js`. Corps : la réserve de `79bbc10`
   tombe, et la dépendance inversée est corrigée. Le schéma zod `ValidationError`
   devient orphelin mais reste en place ; personne ne l'importe, rien ne casse.
4. **`refactor(http): fait lever le 400 de validation`** — `validateRequest.js`
   et `errorHandler.js`. **Seul commit qui change une réponse de l'API** ; le 3
   ne change que la spec servie sur `/docs`.
5. **`docs: aligne la description du contrat d'erreur`** — `ARCHITECTURE.md` et
   `requests/beers.http`.

Le 3 précède le 4 pour que la suppression du schéma orphelin arrive après son
remplacement dans la spec : jamais d'import cassé à aucun commit.

Ne pas embarquer d'autres fichiers modifiés dans le working tree.

## Vérification

Aucun test dans le dépôt, la vérification est manuelle. `package.json` n'étant
pas bind-mounté, un changement de la table `imports` exigerait
`docker compose up -d --build api` — ce chantier n'en change aucune.

```powershell
# 1. la spec se construit et référence les bons composants
node --input-type=module -e "const s=(await import('./src/config/openapi.js')).default; console.log(Object.keys(s.components.schemas), Object.keys(s.components.responses), JSON.stringify(s.paths['/beers/{id}'].get.responses['400']))"

# 2. l'app démarre
docker compose up -d api

# 3. les chemins d'erreur
curl.exe -s http://localhost:3000/beers/abc
curl.exe -s -X PATCH http://localhost:3000/beers/1 -H "Content-Type: application/json" -d "{}"
curl.exe -s -X POST http://localhost:3000/beers -H "Content-Type: application/json" -d "{}"
curl.exe -s http://localhost:3000/beers/999999
curl.exe -s http://localhost:3000/nope

# 4. les codes, inchangés par ce chantier
foreach ($u in @("/beers/1","/beers/9999","/beers","/nope","/beers/abc","/docs/")) {
  $c = curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3000$u"; "GET $u -> $c"
}
```

Attendus : (1) `ApiValidationError` présent, `ValidationError` absent, `$ref`
vers `BadRequest` ; (3) les corps de la section « Cas limites », et les deux 404
inchangés en `{ error }` **sans** clé `details` ; (4) `200`, `404`, `200`, `404`,
`400`, `200`.

## Risques de régression

1. **Contrat client cassé** — le 400 passe de `{ errors: [...] }` à
   `{ error, details: [...] }` et les `code` zod disparaissent. Rupture
   assumée ; le seul consommateur du dépôt est `requests/beers.http`, aligné au
   commit 5.
2. **`next()` depuis un param callback** — seul chemin d'acheminement pas encore
   éprouvé dans ce dépôt. Express 5 le relaie vers le middleware d'erreurs. À
   tester en premier (`GET /beers/abc`) : un échec se manifesterait en 404 de
   routage ou en timeout, pas en 400.
3. **Le spread conditionnel** — la non-régression qui compte est que les 404 ne
   gagnent pas de clé `details`.
4. **`error.constructor` en clé de Map** — égalité exacte, pas `instanceof` :
   une sous-classe future de `ValidationError` retomberait en 500. Comportement
   déjà en place pour les deux autres erreurs, pas une nouveauté.
5. **`.extend()` sur `strictObject`** — vérifié aujourd'hui ; c'est ce qui
   casserait silencieusement la spec à une montée de version zod.

## Hors périmètre

Repéré pendant l'instruction, délibérément laissé de côté. Chacun mérite son
propre commit.

- **Corps JSON malformé** — `express.json()` lève un `SyntaxError` absent de
  `HTTP_STATUS_BY_ERROR` : l'API rend **500** là où elle devrait rendre 400.
  Trou préexistant, tentant à combler ici, mais c'est un autre sujet — traduire
  l'erreur d'un middleware tiers — et cela élargirait la table.
- **`beers.routes.js`, 200 de PATCH** — annonce `Beer` alors que `updateOne`
  appelle `sendOne`, donc le corps réel est `{ data }` : c'est `BeerResponse`.
  La spec ment sur un 200, pas sur un 400.
- **`beers.controller.js`** — `deleteOne: TestHandler` renvoie 200 `text/plain`
  au lieu du 204 documenté ; deux commentaires morts au milieu des arguments de
  `sendOne` dans `updateOne` ; `HTTP_STATUS.OK` passé explicitement alors que
  c'est le défaut de `sendOne`.
- **Paramètre `id` de la spec** — `type: integer, minimum: 1` écrit à la main
  alors que `IdParam` porte déjà la contrainte, ce qui contredit l'en-tête de
  `openapi.js`.
- **`httpStatus.js`** — `isErrorStatus` exporté et jamais utilisé.
- **`requests/beers.http`** — un `j` parasite ligne 30 dans le corps d'une
  requête, et `PUT /beers/:id` ligne 60 alors que la route est en PATCH.
