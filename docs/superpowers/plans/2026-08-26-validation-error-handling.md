---
plan: validation-error-handling
status: draft
spec: docs/superpowers/specs/2026-08-26-validation-error-handling-design.md
branch: main
worktree: false
tasks_total: 5
tasks_done: 0
current_task: —
last_commit: —
last_updated: 2026-08-26
---

# Le 400 de validation passe par errorHandler — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** faire de `errorHandler` le seul émetteur de réponse en erreur, en supprimant la troisième forme de corps produite par `validateRequest`.

**Architecture:** `validateRequest` lève une `ValidationError` porteuse de `details` et fait `next(error)`. `errorHandler` associe la classe au 400 via sa table, et recopie `details` s'il existe. La forme du corps est décrite par `ApiValidationError` dans `apiResponse.js`, propriétaire unique des formes de réponse, et publiée dans la spec OpenAPI via une réponse mutualisée `BadRequest`.

**Tech Stack:** Node 24, Express 5.2.1, zod 4, swagger-jsdoc, PostgreSQL 18, Docker Compose, pnpm.

## Working agreement (OBLIGATOIRE)

Tout agent qui exécute ce plan maintient le plan aligné sur la réalité :

- ne cocher une étape que si elle est **réellement terminée** et vérifiée (green gate only) ; jamais de coche sur une étape partielle ;
- consigner toute divergence dans le **Drift Log** en bas de ce fichier, format `date · tâche/étape · ce que disait le plan · ce qui a été fait · pourquoi` ;
- mettre à jour la frontmatter à chaque frontière de tâche : `tasks_done`, `current_task`, `last_commit`, `last_updated` ;
- ne jamais supprimer une étape terminée ni une entrée de drift.

**Les corrections durables n'atteignent l'exécutant que par le bloc de tâche.** Un sous-agent ne reçoit que son propre bloc `### Task N`, jamais l'en-tête ni le Drift Log. Quand un drift produit une correction durable (chemin, commande, signature, décision), **amender le bloc de tâche concerné sur place** — et journaliser cet amendement dans le Drift Log.

## Global Constraints

- **Aucune suite de tests dans le dépôt** : pas de script `test`, pas de framework. Ce plan **n'en introduit pas** — la première suite est prévue sur le chantier des codes PostgreSQL, pas ici. Chaque tâche se vérifie par une commande exacte à sortie attendue, exécutée depuis la racine du dépôt.
- **Commentaires courts** : un commentaire justifie un choix non évident, il ne paraphrase jamais le code. Resserrer plutôt qu'étoffer.
- **Commits atomiques** : cinq commits, dans l'ordre donné. Chacun laisse l'app démarrable et `/docs` servi. Pas de big bang.
- **Messages de commit** : Conventional Commits, sujet en français, verbe à l'indicatif présent 3e personne (`introduit`, `décrit`, `mutualise`, `fait lever`, `aligne`), ≤ 50 caractères, sans point final. Corps expliquant le *pourquoi*. Terminer par `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **Aucun code de statut en littéral** hors `src/http/httpStatus.js`. Utiliser `HTTP_STATUS.*`.
- **Aucun `code` zod exposé** dans une réponse ou dans la spec publiée.
- **Stratégie git** : cinq commits sur `main`, ni worktree ni PR. C'est un dépôt de formation personnel, mono-contributeur, dont les onze commits vivent sur `main` ; ouvrir une PR sur soi-même n'apporterait rien. (Écart assumé à la convention worktree + draft PR.)
- **Ne pas embarquer** dans ces commits d'autres fichiers déjà modifiés dans le working tree.
- **`package.json` n'est pas bind-mounté** dans le conteneur : `compose.yaml` ne monte que `./src` et `./server.js`. Aucune tâche de ce plan ne touche la table `imports`, donc `docker compose up -d api` suffit, sans `--build`.
- **Routes montées sans préfixe** : `/beers`, pas `/api/beers`.
- **PowerShell** : `curl.exe -s -o $null` ne fonctionne pas, `$null` s'expanse en chaîne vide et avale l'argument suivant. Utiliser `-o NUL`.

---

## File Structure

| Fichier | Sort | Responsabilité |
| --- | --- | --- |
| `src/http/errors/ValidationError.js` | créé | classe d'erreur ; met les issues zod en forme `{ path, message }` |
| `src/http/apiResponse.js` | modifié | ajoute `ApiValidationError`, schéma du corps 400 |
| `src/config/openapi.js` | modifié | publie `ApiValidationError` et la réponse `BadRequest` |
| `src/features/beers/beers.routes.js` | modifié | les quatre 400 pointent sur `BadRequest` |
| `src/http/middlewares/validateRequest.js` | modifié | lève au lieu de répondre |
| `src/http/middlewares/errorHandler.js` | modifié | mappe `ValidationError` sur 400, publie `details` |
| `ARCHITECTURE.md` | modifié | décrit une seule forme d'erreur |
| `requests/beers.http` | modifié | annotations alignées sur la nouvelle forme |

---

### Task 1: la classe ValidationError

**Files:**
- Create: `src/http/errors/ValidationError.js`

**Interfaces:**
- Consumes: rien.
- Produces: `export class ValidationError extends Error`. Constructeur
  `new ValidationError(issues)` où `issues` est un `Array<{ path: Array<string|number>, message: string }>` — c'est-à-dire `zodError.issues`. Instance : `name === "ValidationError"`, `message === "Validation failed"`, `details` de type `Array<{ path: string, message: string }>`. Les tâches 3 et 4 en dépendent.

- [ ] **Step 1: créer le fichier**

Créer `src/http/errors/ValidationError.js` avec exactement ce contenu :

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

Trois points à ne pas « améliorer » :
- `path.join(".")` sans branche. Un `path` vide rend `""`, et c'est voulu : cela signifie « l'échec porte sur la valeur validée elle-même ». Ne pas omettre la clé, ne pas rendre `null`.
- pas de paramètre supplémentaire (préfixe de chemin, nom de champ). Il y a trois situations où le `path` d'une issue est vide, un préfixe n'en couvrirait qu'une.
- le message reste `"Validation failed"`, en anglais comme `Cannot GET /x` et `Beer with id 3 not found`.

- [ ] **Step 2: vérifier la mise en forme des issues**

Depuis la racine du dépôt :

```bash
node --input-type=module -e 'const { ValidationError } = await import("#http/errors/ValidationError.js"); const e = new ValidationError([{ path: ["ingredients", 0, "id"], message: "m1" }, { path: [], message: "m2" }]); console.log(e.name, "|", e.message, "|", e instanceof Error, "|", JSON.stringify(e.details));'
```

Sortie attendue, exactement :

```
ValidationError | Validation failed | true | [{"path":"ingredients.0.id","message":"m1"},{"path":"","message":"m2"}]
```

Si `path` sort en `""` pour le premier cas, le `join` porte sur le mauvais objet. Si `e instanceof Error` est `false`, le `super()` manque.

- [ ] **Step 3: commit**

```bash
git add src/http/errors/ValidationError.js
git commit -F - <<'EOF'
feat(http): introduit ValidationError

Une entrée refusée par un schéma est une erreur de protocole : la classe
vit dans #http/errors/ aux côtés de RouteNotFoundError, pas dans #errors/.
Elle naît de req.body, req.params, req.query — trois notions qui n'ont
pas de sens hors HTTP.

Elle aplatit les issues zod en { path, message } dès le constructeur : un
seul endroit connaît la notation pointée. Le code zod reste interne, le
contrat public n'a pas à suivre la nomenclature d'une lib.

Message fixe là où ses voisines construisent le leur depuis leurs
arguments : lister les champs fautifs dupliquerait details.

Rien ne la lève encore.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: le schéma du corps 400

**Files:**
- Modify: `src/http/apiResponse.js` (ajout après `ApiError`, ligne 28)

**Interfaces:**
- Consumes: `ApiError` déjà exporté par ce fichier.
- Produces: `export const ApiValidationError` — schéma zod. Les tâches 3 (spec OpenAPI) et 4 en dépendent. Forme : `{ error: string, details: Array<{ path: string, message: string }> }`, clés inconnues refusées.

- [ ] **Step 1: ajouter le schéma**

Dans `src/http/apiResponse.js`, insérer juste après la ligne
`export const ApiError = z.strictObject({ error: z.string() });` :

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

Ne rien changer d'autre dans le fichier. En particulier, **ne pas** ajouter un
`details` optionnel à `ApiError` : `ApiError` est le contrat des 404 et 500, qui
n'émettent jamais ce champ.

Le `.describe()` est le seul endroit où la règle du `path` vide est documentée,
et c'est délibéré : elle atterrit dans la spec publiée que le client lit, pas
dans un commentaire que seul le mainteneur voit. C'est déjà la convention du
dépôt, cf. `beers.schemas.js`.

- [ ] **Step 2: vérifier le JSON Schema généré**

```bash
node --input-type=module -e 'const { ApiValidationError } = await import("#http/apiResponse.js"); const z = await import("zod"); const { $schema, ...s } = z.toJSONSchema(ApiValidationError); console.log(JSON.stringify(s));'
```

Sortie attendue, exactement :

```
{"type":"object","properties":{"error":{"type":"string"},"details":{"type":"array","items":{"type":"object","properties":{"path":{"description":"chemin pointé du champ fautif — vide quand l'échec porte sur la valeur validée elle-même : paramètre scalaire, clé inconnue, règle inter-champs","type":"string"},"message":{"type":"string"}},"required":["path","message"],"additionalProperties":false}}},"required":["error","details"],"additionalProperties":false}
```

Trois choses à contrôler dans cette sortie, quel que soit l'ordre des clés :
`"additionalProperties":false` présent **deux** fois (`.extend()` sur un
`strictObject` conserve le refus des clés inconnues), `"required":["error","details"]`
sur l'objet racine, et la `description` du `path` bien présente.

- [ ] **Step 3: vérifier qu'ApiError n'a pas bougé**

```bash
node --input-type=module -e 'const { ApiError } = await import("#http/apiResponse.js"); const z = await import("zod"); console.log(JSON.stringify(z.toJSONSchema(ApiError).properties));'
```

Sortie attendue :

```
{"error":{"type":"string"}}
```

Pas de clé `details`. `.extend()` ne mute pas le schéma de départ ; cette étape
le prouve plutôt que de le supposer.

- [ ] **Step 4: commit**

```bash
git add src/http/apiResponse.js
git commit -F - <<'EOF'
feat(http): décrit le corps d'une erreur de validation

ApiValidationError étend ApiError plutôt que d'y ajouter un details
optionnel : ApiError est le contrat des 404 et 500, qui annonceraient
sinon un champ qu'ils n'émettent jamais. L'extension garde le champ
error décrit à un seul endroit.

La règle du path vide est portée par .describe(), donc par la spec
publiée que le client lit, et non par un commentaire de code.

Le schéma vit ici et non à côté de la classe : apiResponse est le seul
propriétaire de la forme des réponses, succès comme échec.

Personne ne l'importe encore.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: la réponse 400 mutualisée dans la spec

**Files:**
- Modify: `src/config/openapi.js` (import ligne 20-21, `components.schemas`, `components.responses`)
- Modify: `src/features/beers/beers.routes.js` (quatre blocs `400`)

**Interfaces:**
- Consumes: `ApiValidationError` de la tâche 2.
- Produces: `#/components/responses/BadRequest` et `#/components/schemas/ApiValidationError` dans la spec. Le schéma `#/components/schemas/ValidationError` **disparaît**.

- [ ] **Step 1: corriger l'import dans openapi.js**

Dans `src/config/openapi.js`, remplacer les deux lignes :

```js
import { ApiError } from "#http/apiResponse.js";
import { ValidationError } from "#http/middlewares/validateRequest.js";
```

par une seule :

```js
import { ApiError, ApiValidationError } from "#http/apiResponse.js";
```

C'est la correction d'une dépendance inversée : un module de configuration
importait un schéma de réponse depuis un middleware.

- [ ] **Step 2: renommer l'entrée de components.schemas**

Toujours dans `src/config/openapi.js`, remplacer :

```js
        ValidationError: toSchemaObject(ValidationError),
```

par :

```js
        ApiValidationError: toSchemaObject(ApiValidationError),
```

- [ ] **Step 3: ajouter la réponse BadRequest**

Dans `components.responses`, insérer `BadRequest` **avant** `NotFound`, pour que
les trois entrées suivent l'ordre croissant des codes :

```js
        BadRequest: jsonResponse(
          "Une entrée ne respecte pas son schéma. `details` nomme les champs fautifs.",
          "ApiValidationError",
        ),
```

- [ ] **Step 4: faire pointer les quatre 400 sur la réponse mutualisée**

Dans `src/features/beers/beers.routes.js`, quatre blocs `400` inline deviennent
un `$ref`. Ils se trouvent sous `post /beers`, puis `get`, `patch` et `delete`
de `/beers/{id}`.

Remplacer chacun de ces blocs — les descriptions diffèrent, la structure non :

```yaml
 *       400:
 *         description: Le corps de la requête ne respecte pas le schéma
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
```

par :

```yaml
 *       400:
 *         $ref: '#/components/responses/BadRequest'
```

Les quatre descriptions supprimées sont « Le corps de la requête ne respecte pas
le schéma » (POST), « L'ID fourni n'est pas un entier positif » (GET et DELETE)
et « L'ID fourni n'est pas un entier positif, ou le corps ne respecte pas le
schéma » (PATCH, sur deux lignes avec un `>` de bloc YAML). Cette nuance
descriptive était un palliatif à un corps opaque ; `details[].path` nomme
désormais le champ fautif à l'exécution.

Ne toucher à rien d'autre : ni les 200, ni les 404, ni les 500, ni les `summary`,
ni le `description` du PATCH, ni le bloc `parameters`.

- [ ] **Step 5: vérifier la spec générée**

```bash
node --input-type=module -e 'const s = (await import("./src/config/openapi.js")).default; console.log("schemas:", Object.keys(s.components.schemas).join(",")); console.log("responses:", Object.keys(s.components.responses).join(",")); for (const [p, ops] of Object.entries(s.paths)) for (const [m, op] of Object.entries(ops)) if (op.responses?.["400"]) console.log(m.toUpperCase(), p, JSON.stringify(op.responses["400"]));'
```

Sortie attendue :

```
schemas: NewBeer,Beer,BeerResponse,BeerListResponse,BeerDetailsResponse,UpdateBeer,ApiError,ApiValidationError
responses: BadRequest,NotFound,InternalServerError
POST /beers {"$ref":"#/components/responses/BadRequest"}
GET /beers/{id} {"$ref":"#/components/responses/BadRequest"}
PATCH /beers/{id} {"$ref":"#/components/responses/BadRequest"}
DELETE /beers/{id} {"$ref":"#/components/responses/BadRequest"}
```

`ValidationError` doit être **absent** de la liste des schemas, et les quatre
opérations doivent afficher le `$ref`, pas un objet `description`/`content`.

- [ ] **Step 6: vérifier qu'aucun $ref ne pend dans le vide**

```bash
node --input-type=module -e 'const s = (await import("./src/config/openapi.js")).default; const refs = [...new Set(JSON.stringify(s).match(/#\/components\/[a-z]+\/[A-Za-z]+/g))]; const missing = refs.filter((r) => { const [, , kind, name] = r.split("/"); return !s.components[kind]?.[name]; }); console.log(missing.length === 0 ? "tous les $ref resolvent" : "CASSE: " + missing.join(","));'
```

Sortie attendue :

```
tous les $ref resolvent
```

- [ ] **Step 7: commit**

Le schéma zod `ValidationError` est maintenant orphelin dans
`validateRequest.js` — plus personne ne l'importe. Il reste en place jusqu'à la
tâche 4 : le supprimer ici casserait rien, mais mélangerait deux sujets.

```bash
git add src/config/openapi.js src/features/beers/beers.routes.js
git commit -F - <<'EOF'
docs(openapi): mutualise la réponse 400 et aligne son schéma

Les quatre blocs 400 inline pointent sur components/responses/BadRequest,
comme le 404 et le 500 depuis 79bbc10. La réserve de ce commit — les
descriptions varient utilement d'une opération à l'autre — tombe :
details[].path nomme le champ fautif à l'exécution, la nuance
descriptive n'était qu'un palliatif à un corps opaque.

Corrige au passage une dépendance inversée : la config importait un
schéma de réponse depuis #http/middlewares/. Elle ne consomme plus que
du vocabulaire de réponse et des schémas de ressource.

Le schéma zod ValidationError devient orphelin ; il part avec le
middleware au commit suivant.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: validateRequest lève, errorHandler répond

Seul commit qui change une réponse de l'API.

**Files:**
- Modify: `src/http/middlewares/validateRequest.js` (en-tête, suppression du schéma et de `reject`, deux `next`)
- Modify: `src/http/middlewares/errorHandler.js` (import, table, corps de la réponse, deux commentaires)

**Interfaces:**
- Consumes: `ValidationError` (tâche 1), `HTTP_STATUS.BAD_REQUEST` de `#http/httpStatus.js`.
- Produces: le contrat de réponse 400 `{ error, details }`, décrit par `ApiValidationError`. L'export `ValidationError` (schéma zod) de `validateRequest.js` **disparaît** ; le module n'exporte plus que `validateParam` et `validateBody`.

- [ ] **Step 1: réécrire validateRequest.js**

Remplacer **tout** le contenu de `src/http/middlewares/validateRequest.js` par :

```js
/**
 * Validation des entrées HTTP avec zod.
 *
 * Chaque validateur remplace la valeur brute par la valeur parsée, si bien que
 * le contrôleur ne reçoit que des champs déclarés. Un échec lève une
 * `ValidationError` : la réponse appartient à `errorHandler`, pas ici.
 *
 * @module http/middlewares/validateRequest
 */
import { ValidationError } from "#http/errors/ValidationError.js";

/**
 * Valide un paramètre de route et écrase `req.params[nom]` par la valeur parsée.
 *
 * À monter via `router.param(nom, ...)`, pas via `use` : l'arité est celle des
 * param callbacks Express, qui fournissent la valeur brute et le nom du
 * paramètre en 4e et 5e arguments.
 *
 * @param {import("zod").ZodType} schema
 * @returns {import("express").RequestParamHandler}
 * @example
 * router.param("id", validateParam(IdParam));
 */
export const validateParam =
  (schema) => (req, res, next, rawValue, paramName) => {
    const { success, error, data } = schema.safeParse(rawValue);
    if (!success) return next(new ValidationError(error.issues));
    req.params[paramName] = data;
    next();
  };

/**
 * Fabrique un middleware qui valide une clé de `req` et l'écrase par la valeur
 * parsée. Toutes les sources de même arité passent par ici : `body`, `query`.
 *
 * @param {"body" | "query"} source
 * @returns {(schema: import("zod").ZodType) => import("express").RequestHandler}
 */
const validateIn = (source) => (schema) => (req, res, next) => {
  const { success, error, data } = schema.safeParse(req[source]);
  if (!success) return next(new ValidationError(error.issues));
  req[source] = data;
  next();
};

/**
 * Valide le corps de la requête et écrase `req.body` par la valeur parsée.
 *
 * @param {import("zod").ZodType} schema
 * @returns {import("express").RequestHandler}
 * @example
 * router.post("/", validateBody(NewBeer), controller.createOne);
 */
export const validateBody = validateIn("body");
```

Quatre disparitions, toutes voulues :
- le schéma zod `ValidationError` et son `@typedef ValidationErrorBody` — partis dans `apiResponse.js` sous le nom `ApiValidationError` à la tâche 2 ;
- le helper `reject` — il ne portait que le statut et la forme, qui ne sont plus ici. La ligne `next(new ValidationError(error.issues))` est identique dans les deux validateurs : ne pas la refactoriser derrière un nom, cela masquerait le `next` explicite qui est le point du chantier ;
- l'import runtime `import * as z from "zod"` — les JSDoc passent par `import("zod").ZodType` ;
- la phrase « Le format de la réponse 400 est défini ici une seule fois » de l'en-tête, devenue fausse.

Le `@module` passe de `middlewares/validateRequest` à `http/middlewares/validateRequest` : il était périmé depuis le déplacement du commit `035d3c5`, et l'en-tête est réécrit de toute façon.

- [ ] **Step 2: réécrire errorHandler.js**

Remplacer **tout** le contenu de `src/http/middlewares/errorHandler.js` par :

```js
import { ResourceNotFoundError } from "#errors/ResourceNotFoundError.js";
import { RouteNotFoundError } from "#http/errors/RouteNotFoundError.js";
import { ValidationError } from "#http/errors/ValidationError.js";
import { HTTP_STATUS, isServerErrorStatus } from "#http/httpStatus.js";

/** Seul point où une classe d'erreur reçoit un code HTTP. Absente = imprévu = 500. */
const HTTP_STATUS_BY_ERROR = new Map()
  .set(ResourceNotFoundError, HTTP_STATUS.NOT_FOUND)
  .set(RouteNotFoundError, HTTP_STATUS.NOT_FOUND)
  .set(ValidationError, HTTP_STATUS.BAD_REQUEST);

/**
 * Terminal, à monter en dernier dans l'app.
 */
export default (error, req, res, next) => {
  const status =
    HTTP_STATUS_BY_ERROR.get(error.constructor) ??
    HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Un message de 5xx porte le SQL, l'hôte, les chemins : logs seulement.
  if (isServerErrorStatus(status)) {
    console.error(error);
    return res.status(status).json({ error: "Internal server error" });
  }

  // `details` est porté par l'erreur, pas déduit du statut : une future 422
  // métier pourra en fournir sans toucher ici.
  return res.status(status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
  });
};
```

Trois changements par rapport à l'existant :
- l'entrée `ValidationError → BAD_REQUEST` dans la table ;
- le spread conditionnel de `details` sur la branche 4xx. La branche 5xx n'y touche pas : le message d'une 500 ne sort jamais, ses détails non plus ;
- « Seul point où **le domaine** reçoit un code HTTP » devient « Seul point où **une classe d'erreur** reçoit un code HTTP ». La formulation était déjà approximative — `RouteNotFoundError` n'est pas du domaine — et l'ajout de `ValidationError` la rend franchement fausse. Le backtick parasite de `l'app\`` disparaît au passage, le fichier est touché.

- [ ] **Step 3: vérifier que le module n'exporte plus le schéma**

```bash
node --input-type=module -e 'const m = await import("#http/middlewares/validateRequest.js"); console.log(Object.keys(m).sort().join(","));'
```

Sortie attendue :

```
validateBody,validateParam
```

- [ ] **Step 4: redémarrer l'API**

```bash
docker compose up -d api
```

Pas de `--build` : aucune tâche de ce plan ne touche la table `imports` de
`package.json`, et `./src` est bind-mounté.

- [ ] **Step 5: vérifier les trois cas où le path est vide**

```bash
curl.exe -s http://localhost:3000/beers/abc
curl.exe -s -X PATCH http://localhost:3000/beers/1 -H "Content-Type: application/json" -d "{}"
curl.exe -s -X POST http://localhost:3000/beers -H "Content-Type: application/json" -d "{\"name\":\"K\",\"brewery_id\":1,\"zz\":1}"
```

Sorties attendues, dans l'ordre :

```json
{"error":"Validation failed","details":[{"path":"","message":"Invalid input: expected number, received NaN"}]}
```
```json
{"error":"Validation failed","details":[{"path":"","message":"Au moins un champ doit être fourni"}]}
```
```json
{"error":"Validation failed","details":[{"path":"","message":"Unrecognized key: \"zz\""}]}
```

Ces trois `path` vides sont les trois situations recensées : paramètre scalaire
(`IdParam` parse une valeur, pas un objet), `refine` racine de `UpdateBeer`, et
clé inconnue sur un `strictObject` — la clé fautive est alors dans le message.

Le premier cas est le seul chemin d'acheminement pas encore éprouvé dans ce
dépôt : un `next(error)` depuis un param callback Express. S'il échoue, il
échouera en 404 de routage ou en timeout, pas en 400.

- [ ] **Step 6: vérifier qu'un path non vide sort bien**

```bash
curl.exe -s -X POST http://localhost:3000/beers -H "Content-Type: application/json" -d "{}"
```

Sortie attendue :

```json
{"error":"Validation failed","details":[{"path":"name","message":"Invalid input: expected string, received undefined"},{"path":"brewery_id","message":"Invalid input: expected number, received undefined"}]}
```

- [ ] **Step 7: vérifier que les 404 n'ont pas gagné de clé details**

```bash
curl.exe -s http://localhost:3000/beers/999999
curl.exe -s http://localhost:3000/nope
```

Sorties attendues :

```json
{"error":"Beer with id 999999 not found"}
```
```json
{"error":"Cannot GET /nope"}
```

Aucune clé `details`, même vide. C'est la non-régression qui compte sur le
spread conditionnel.

- [ ] **Step 8: vérifier les codes de statut de bout en bout**

En PowerShell :

```powershell
foreach ($u in @("/beers/1","/beers/9999","/beers","/nope","/beers/abc","/docs/")) {
  $c = curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3000$u"; "GET $u -> $c"
}
```

Sortie attendue :

```
GET /beers/1 -> 200
GET /beers/9999 -> 404
GET /beers -> 200
GET /nope -> 404
GET /beers/abc -> 400
GET /docs/ -> 200
```

- [ ] **Step 9: commit**

```bash
git add src/http/middlewares/validateRequest.js src/http/middlewares/errorHandler.js
git commit -F - <<'EOF'
refactor(http): fait lever le 400 de validation

Dernier producteur de corps d'erreur hors errorHandler. Il répondait
{ errors: [...] } avec les issues zod brutes : une troisième forme de
corps, un 400 en littéral hors httpStatus, et la nomenclature de zod
dans le contrat public.

reject disparaît — il ne portait que le statut et la forme, qui ne sont
plus ici. La ligne next(new ValidationError(error.issues)) est identique
aux deux appelants : la factoriser masquerait le next explicite, qui est
le point du changement.

errorHandler recopie details quand l'erreur en porte, sans le déduire du
statut : une future 422 métier pourra en fournir sans toucher ici. Son
en-tête parlait du domaine alors que la table contient des erreurs de
protocole.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 5: la documentation dit la vérité

**Files:**
- Modify: `ARCHITECTURE.md:61-63`
- Modify: `requests/beers.http:13-15` et les annotations des lignes 23, 27, 37

**Interfaces:**
- Consumes: le contrat de réponse figé à la tâche 4.
- Produces: rien de consommable par du code.

- [ ] **Step 1: corriger ARCHITECTURE.md**

Remplacer les lignes 61-63 :

```markdown
Erreurs : deux formes distinctes, `{ errors }` (tableau d'issues zod) sur 400,
`{ error }` (string) ailleurs — gérées par les middlewares `notFound.js` et
`validateRequest.js`.
```

par :

```markdown
Erreurs : une seule forme, `{ error }`, produite par le seul `errorHandler`.
Un 400 de validation y ajoute `details`, un tableau de `{ path, message }` —
`path` en notation pointée, vide quand l'échec porte sur la valeur validée
elle-même.
```

Ce passage était faux deux fois : `notFound.js` n'existe plus depuis le commit
`035d3c5`, et la double forme disparaît avec la tâche 4.

- [ ] **Step 2: corriger l'en-tête de requests/beers.http**

Remplacer les lignes 13-15 :

```
# Toute réponse 2xx est enveloppée : charge utile sous `data`, plus `meta`
# pour les collections. Les erreurs ont deux formes distinctes : `{ errors }`
# sur un 400, le tableau des issues zod, et `{ error }` ailleurs, une string.
```

par :

```
# Toute réponse 2xx est enveloppée : charge utile sous `data`, plus `meta`
# pour les collections. Toute erreur rend `{ error }`, une string. Un 400 y
# ajoute `details`, un tableau de `{ path, message }` : `path` nomme le champ
# fautif en notation pointée, et reste vide quand l'échec porte sur la valeur
# elle-même.
```

- [ ] **Step 3: corriger les trois annotations qui citent un code zod**

Le code zod n'apparaît plus dans les réponses. Remplacer :

| Ligne | Actuel | Nouveau |
| --- | --- | --- |
| 23 | `### CREATE — sans body → 400, invalid_type sur name et brewery_id` | `### CREATE — sans body → 400, details sur name et brewery_id` |
| 27 | `### CREATE — brewery_id manquant → 400, invalid_type sur brewery_id` | `### CREATE — brewery_id manquant → 400, details sur brewery_id` |
| 37 | `### CREATE — brewery_id en string → 400, invalid_type sur brewery_id` | `### CREATE — brewery_id en string → 400, details sur brewery_id` |

Ne pas toucher au reste de ce fichier. Deux défauts préexistants y restent
délibérément — un `j` parasite ligne 30 dans le corps d'une requête, et un
`PUT /beers/{{id}}` ligne 60 alors que la route est en PATCH. Ils n'ont rien à
voir avec ce chantier.

- [ ] **Step 4: vérifier qu'aucune mention obsolète ne subsiste**

`-F` est indispensable : sans lui, `git grep` interprète les accolades comme un
quantificateur d'intervalle.

```bash
git grep -n -F -e 'errors }' -e 'issues zod' -e 'notFound.js' -e 'invalid_type' -- ARCHITECTURE.md requests/ src/ || echo "aucune mention obsolete"
```

Sortie attendue :

```
aucune mention obsolete
```

- [ ] **Step 5: commit**

```bash
git add ARCHITECTURE.md requests/beers.http
git commit -F - <<'EOF'
docs: aligne la description du contrat d'erreur

ARCHITECTURE annonçait deux formes d'erreur et citait notFound.js,
supprimé depuis 035d3c5. Le recueil de requêtes annonçait un tableau
d'issues zod sur les 400 et nommait des codes zod qui ne sortent plus.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Hors périmètre

Repéré pendant l'instruction du chantier, à **ne pas** traiter ici. Chacun
mérite son propre commit, sur un sujet distinct.

- **Corps JSON malformé** — `express.json()` lève un `SyntaxError` absent de
  `HTTP_STATUS_BY_ERROR` : l'API rend 500 là où elle devrait rendre 400. Trou
  préexistant, très tentant à combler dans la tâche 4, mais c'est un autre
  sujet — traduire l'erreur d'un middleware tiers — et cela élargirait la table.
- **`beers.routes.js`, 200 de PATCH** — annonce `Beer` alors que `updateOne`
  appelle `sendOne`, donc le corps réel est `{ data }` : c'est `BeerResponse`.
  La spec ment sur un 200, pas sur un 400.
- **`beers.controller.js`** — `deleteOne: TestHandler` renvoie 200 `text/plain`
  au lieu du 204 documenté ; deux commentaires morts au milieu des arguments de
  `sendOne` dans `updateOne` ; `HTTP_STATUS.OK` passé explicitement alors que
  c'est le défaut de `sendOne`.
- **Paramètre `id` de la spec** — `type: integer, minimum: 1` écrit à la main
  alors que `IdParam` porte déjà la contrainte.
- **`httpStatus.js`** — `isErrorStatus` exporté et jamais utilisé.
- **Codes d'erreur PostgreSQL** — `23503` et `23505` non traduits, un
  `POST /beers` avec un `brewery_id` inexistant rend 500 au lieu de 422. C'est
  le chantier suivant, et le bon candidat pour introduire la première suite de
  tests du dépôt.

## Drift Log

Format : `date · tâche/étape · ce que disait le plan · ce qui a été fait · pourquoi`.

_(vide — aucune divergence enregistrée)_
