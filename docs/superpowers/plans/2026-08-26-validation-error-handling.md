---
plan: validation-error-handling
status: done
spec: docs/superpowers/specs/2026-08-26-validation-error-handling-design.md
branch: main
worktree: false
tasks_total: 4
tasks_done: 4
current_task: — (terminé)
last_commit: e262d6f
last_updated: 2026-08-26
---

# Le 400 de validation passe par errorHandler — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** faire de `errorHandler` le seul émetteur de réponse en erreur, en supprimant la troisième forme de corps produite par `validateRequest`.

**Architecture:** `validateRequest` lève une `ValidationError` porteuse de `details` et fait `next(error)`. `errorHandler` associe la classe au 400 via sa table, et recopie `details` s'il existe. La forme du corps est décrite par `ApiValidationError` dans `apiResponse.js`, propriétaire unique des formes de réponse, et publiée dans la spec OpenAPI.

**Tech Stack:** Node 24, Express 5.2.1, zod 4, swagger-jsdoc, PostgreSQL 18, Docker Compose, pnpm.

## Working agreement (OBLIGATOIRE)

Tout agent qui exécute ce plan maintient le plan aligné sur la réalité :

- ne cocher une étape que si elle est **réellement terminée** et vérifiée (green gate only) ; jamais de coche sur une étape partielle ;
- consigner toute divergence dans le **Drift Log** en bas de ce fichier, format `date · tâche/étape · ce que disait le plan · ce qui a été fait · pourquoi` ;
- mettre à jour la frontmatter à chaque frontière de tâche : `tasks_done`, `current_task`, `last_commit`, `last_updated`.

Ce fichier est suivi par git et il évolue pendant l'exécution. **Chaque `git add` de tâche stage aussi ce plan**, pour que le suivi soit commité avec le travail qu'il décrit. C'est la seule exception à la contrainte « ne pas embarquer d'autres fichiers modifiés ».

**Les corrections durables n'atteignent l'exécutant que par le bloc de tâche.** Un sous-agent ne reçoit que son propre bloc `### Task N`, jamais l'en-tête ni le Drift Log. Quand un drift produit une correction durable (chemin, commande, signature, décision), **amender le bloc de tâche concerné sur place** — et journaliser cet amendement dans le Drift Log.

## Global Constraints

- **Shell : Git Bash pour tous les blocs ` ```bash `.** Les blocs de commit utilisent un heredoc (`git commit -F - <<'EOF'`) ; `<<` est un opérateur réservé en PowerShell, qui échoue sur `ParserError: Missing file specification after redirection operator`. Les blocs marqués ` ```powershell ` se lancent en PowerShell.
- **Corps JSON des `curl` en guillemets simples** — `-d '{"a":1}'`. La forme `-d "{\"a\":1}"` est mutilée par PowerShell, qui ne connaît pas `\"` comme échappement et coupe l'argument en deux. La forme à guillemets simples passe dans les deux shells.
- **Aucune suite de tests dans le dépôt** : pas de script `test`, pas de framework, pas de linter ni de formateur. Ce plan **n'en introduit pas** — la première suite est prévue sur le chantier des codes PostgreSQL. Chaque tâche se vérifie par une commande exacte à sortie attendue, exécutée depuis la racine du dépôt.
- **Commentaires courts** : un commentaire justifie un choix non évident, il ne paraphrase pas le code, et il ne spécule pas sur du code inexistant. Les deux classes d'erreur voisines ont respectivement 2 lignes de commentaire et zéro : s'aligner sur elles.
- **Commits atomiques** : quatre commits, dans l'ordre donné. Chacun laisse l'app démarrable et `/docs` servi. Pas de big bang.
- **Messages de commit** : Conventional Commits, sujet en français, verbe à l'indicatif présent 3e personne (`introduit`, `aligne`, `fait lever`), ≤ 50 caractères — les quatre sujets de ce plan y tiennent. Corps expliquant le *pourquoi*. Terminer par `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **Aucun code de statut en littéral** hors `src/http/httpStatus.js`. Utiliser `HTTP_STATUS.*`.
- **Aucun `code` zod exposé** dans une réponse ou dans la spec publiée.
- **Stratégie git** : quatre commits sur `main`, ni worktree ni PR. Dépôt de formation personnel, mono-contributeur, dont les 78 commits vivent sur `main` ; ouvrir une PR sur soi-même n'apporterait rien. (Écart assumé à la convention worktree + draft PR.)
- **`package.json` n'est pas bind-mounté** dans le conteneur : `compose.yaml` ne monte que `./src` et `./server.js`. Aucune tâche ne touche la table `imports`, donc pas de `--build`. Le rechargement est assuré par `nodemon --legacy-watch --watch src` dans le conteneur, pas par un redémarrage.
- **Routes montées sans préfixe** : `/beers`, pas `/api/beers`.
- **PowerShell** : `curl.exe -s -o $null` ne fonctionne pas, `$null` s'expanse en chaîne vide et avale l'argument suivant. Utiliser `-o NUL`.

### État du working tree au moment d'écrire ce plan

Trois fichiers modifiés et non commités, dont **aucun n'appartient à ce chantier** :

- `src/http/middlewares/validateRequest.js` — `reject` a été passé à `HTTP_STATUS.BAD_REQUEST`. La tâche 3 remplace tout le fichier, ce changement disparaîtra : c'est sans effet sur l'état final, mais le corps du commit 3 décrit `HEAD`, pas le working tree.
- `src/features/beers/beers.controller.js` et `src/features/beers/beers.service.js` — le contrôleur appelle `service.updateOne` alors que le service n'expose que `updateOneById`. **Un `PATCH /beers/1` avec un corps valide lève un `TypeError` et rend 500.** Aucune vérification de ce plan ne passe par ce chemin — les 400 de validation sont refusés avant d'atteindre le contrôleur. À traiter séparément, avant ou après, jamais dans les commits de ce plan.

---

## File Structure

| Fichier | Sort | Responsabilité |
| --- | --- | --- |
| `src/http/errors/ValidationError.js` | créé | classe d'erreur ; met les issues zod en forme `{ path, message }` |
| `src/http/apiResponse.js` | modifié | ajoute `ApiValidationError`, schéma du corps 400 |
| `src/config/openapi.js` | modifié | publie `ApiValidationError` à la place de `ValidationError` |
| `src/features/beers/beers.routes.js` | modifié | les quatre 400 pointent sur le nouveau nom de schéma |
| `src/http/middlewares/validateRequest.js` | modifié | lève au lieu de répondre |
| `src/http/middlewares/errorHandler.js` | modifié | mappe `ValidationError` sur 400, publie `details` |
| `ARCHITECTURE.md` | modifié | décrit une seule forme d'erreur |
| `requests/beers.http` | modifié | annotations alignées sur la nouvelle forme |

---

### Task 1: la classe et la forme qu'elle publie

Une erreur et le schéma de son corps sont la même idée : un seul commit, deux fichiers. Inerte — rien ne lève la classe, personne n'importe le schéma.

**Files:**
- Create: `src/http/errors/ValidationError.js`
- Modify: `src/http/apiResponse.js` (ajout après `ApiError`, ligne 28)

**Interfaces:**
- Consumes: `ApiError`, déjà exporté par `apiResponse.js`.
- Produces:
  - `export class ValidationError extends Error` — constructeur `new ValidationError(issues)` où `issues` est un `Array<{ path: Array<string|number>, message: string }>`, c'est-à-dire `zodError.issues`. Instance : `name === "ValidationError"`, `message === "Validation failed"`, `details` de type `Array<{ path: string, message: string }>`. Les tâches 2 et 3 en dépendent.
  - `export const ApiValidationError` — schéma zod de forme `{ error: string, details: Array<{ path: string, message: string }> }`, clés inconnues refusées. La tâche 2 en dépend.

- [x] **Step 1: créer la classe**

Créer `src/http/errors/ValidationError.js` avec exactement ce contenu :

```js
/**
 * Une entrée ne respecte pas son schéma. Erreur de protocole, pas de métier :
 * elle vit dans `#http/` et non `#errors/`.
 *
 * Message fixe, contrairement à ses voisines : nommer les champs fautifs
 * dupliquerait `details`.
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

Les deux premières lignes de commentaire sont le parallèle mot pour mot de
`RouteNotFoundError` : la cohérence des deux classes se voit en lisant les
fichiers côte à côte.

Trois points à ne pas « améliorer » :
- `path.join(".")` sans branche. Un `path` vide rend `""`, et c'est voulu : cela signifie « l'échec porte sur la valeur validée elle-même ». Ne pas omettre la clé, ne pas rendre `null`.
- pas de paramètre supplémentaire (préfixe de chemin, nom de champ). Il y a trois situations où le `path` d'une issue est vide, un préfixe n'en couvrirait qu'une.
- le message reste `"Validation failed"`, en anglais comme `Cannot GET /x` et `Beer with id 3 not found`.

- [x] **Step 2: vérifier la mise en forme des issues**

Depuis la racine du dépôt, en Git Bash :

```bash
node --input-type=module -e 'const { ValidationError } = await import("#http/errors/ValidationError.js"); const e = new ValidationError([{ path: ["ingredients", 0, "id"], message: "m1" }, { path: [], message: "m2" }]); console.log(e.name, "|", e.message, "|", e instanceof Error, "|", JSON.stringify(e.details));'
```

Sortie attendue :

```
ValidationError | Validation failed | true | [{"path":"ingredients.0.id","message":"m1"},{"path":"","message":"m2"}]
```

Si le premier `path` sort en `""`, le `join` porte sur le mauvais objet. Si
`e instanceof Error` est `false`, le `super()` manque.

- [x] **Step 3: ajouter le schéma du corps**

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
          "chemin pointé du champ fautif — vide quand l'erreur porte sur le corps entier",
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
dépôt, cf. `beers.schemas.js`. Le garder court — il décrit le contrat HTTP, pas
les schémas zod qui produisent le cas.

- [x] **Step 4: vérifier le JSON Schema généré**

```bash
node --input-type=module -e 'const { ApiValidationError, ApiError } = await import("#http/apiResponse.js"); const z = await import("zod"); const s = z.toJSONSchema(ApiValidationError); const d = s.properties.details.items; console.log(s.additionalProperties, d.additionalProperties, s.required.join(","), d.required.join(","), Boolean(d.properties.path.description), JSON.stringify(z.toJSONSchema(ApiError).properties));'
```

Sortie attendue :

```
false false error,details path,message true {"error":{"type":"string"}}
```

Quatre choses prouvées d'un coup : `.extend()` sur un `strictObject` conserve le
refus des clés inconnues aux **deux** niveaux, les deux champs racine sont
requis, la `description` du `path` est bien présente, et `ApiError` n'a **pas**
gagné de clé `details` — `.extend()` ne mute pas le schéma de départ.

Ne pas comparer la sortie de `z.toJSONSchema` en chaîne complète : l'ordre des
clés émises par zod n'est pas contractuel (il place `type` avant `description`).

- [x] **Step 5: commit**

```bash
git add src/http/errors/ValidationError.js src/http/apiResponse.js docs/superpowers/plans/2026-08-26-validation-error-handling.md
git commit -F - <<'EOF'
feat(http): introduit ValidationError et son corps

Une entrée refusée par un schéma est une erreur de protocole : la classe
vit dans #http/errors/ aux côtés de RouteNotFoundError, pas dans #errors/.
Elle naît de req.body, req.params, req.query — trois notions qui n'ont
pas de sens hors HTTP.

Elle aplatit les issues zod en { path, message } dès le constructeur : un
seul endroit connaît la notation pointée. Le code zod reste interne, le
contrat public n'a pas à suivre la nomenclature d'une lib. Message fixe
là où ses voisines construisent le leur : lister les champs fautifs
dupliquerait details.

ApiValidationError étend ApiError plutôt que d'y ajouter un details
optionnel : ApiError est le contrat des 404 et 500, qui annonceraient
sinon un champ qu'ils n'émettent jamais. Le schéma vit dans apiResponse
et non à côté de la classe — apiResponse est le seul propriétaire de la
forme des réponses, succès comme échec.

Rien ne lève la classe, personne n'importe le schéma.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 2: la spec pointe sur le nouveau schéma

**Files:**
- Modify: `src/config/openapi.js` (import lignes 20-21, `components.schemas`)
- Modify: `src/features/beers/beers.routes.js` (quatre `$ref`, lignes 44, 78, 108, 123)

**Interfaces:**
- Consumes: `ApiValidationError` de la tâche 1.
- Produces: `#/components/schemas/ApiValidationError` dans la spec. Le schéma `#/components/schemas/ValidationError` **disparaît**, et `config/openapi.js` n'importe plus rien de `#http/middlewares/`.

- [x] **Step 1: corriger l'import dans openapi.js**

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

- [x] **Step 2: renommer l'entrée de components.schemas**

Toujours dans `src/config/openapi.js`, remplacer :

```js
        ValidationError: toSchemaObject(ValidationError),
```

par :

```js
        ApiValidationError: toSchemaObject(ApiValidationError),
```

Ne pas toucher à `components.responses`. Les 400 restent inline, décidé
sciemment : voir l'encadré du Step 3.

- [x] **Step 3: renommer le schéma référencé par les quatre 400**

Dans `src/features/beers/beers.routes.js`, quatre lignes et quatre seulement —
44, 78, 108 et 123. Chacune passe de :

```yaml
 *               $ref: '#/components/schemas/ValidationError'
```

à :

```yaml
 *               $ref: '#/components/schemas/ApiValidationError'
```

**Ne pas mutualiser ces blocs en `components/responses/BadRequest`.** Une
version antérieure de ce plan le prévoyait, au motif que `details[].path`
nommerait désormais le champ fautif et rendrait les `description`
par-opération superflues. C'est vrai pour **une** opération sur quatre :

| Opération | Description actuelle | `path` au runtime |
| --- | --- | --- |
| `POST /beers` | « Le corps de la requête ne respecte pas le schéma » | `"name"`, `"brewery_id"` — compensée |
| `GET /beers/{id}` | « L'ID fourni n'est pas un entier positif » | `""` |
| `DELETE /beers/{id}` | idem | `""` |
| `PATCH /beers/{id}` | « L'ID… ou le corps… » | `""` sur le `refine` racine |

Sur GET, DELETE et PATCH, `path` est vide précisément dans les cas dont la
description portait la seule information disponible. Mutualiser détruirait
« l'ID fourni n'est pas un entier positif » sans rien mettre à la place, et
renverserait `79bbc10`, qui avait tranché l'inverse le même jour. Les quatre
blocs `content/application-json/schema` restent donc dupliqués, exactement
comme les quatre 200 du même fichier — le fichier reste cohérent avec lui-même.

Ne toucher à rien d'autre : ni les `description` des 400, ni les 200, 404 et
500, ni les `summary`, ni le `description` du PATCH, ni le bloc `parameters`.

- [x] **Step 4: vérifier la spec générée**

```bash
node --input-type=module -e 'const s = (await import("./src/config/openapi.js")).default; console.log("schemas:", Object.keys(s.components.schemas).join(",")); console.log("responses:", Object.keys(s.components.responses).join(",")); for (const [p, ops] of Object.entries(s.paths)) for (const [m, op] of Object.entries(ops)) { const r = op.responses?.["400"]; if (r) console.log(m.toUpperCase(), p, r.content["application/json"].schema.$ref, "|", r.description); }'
```

Sortie attendue :

```
schemas: NewBeer,Beer,BeerResponse,BeerListResponse,BeerDetailsResponse,UpdateBeer,ApiError,ApiValidationError
responses: NotFound,InternalServerError
POST /beers #/components/schemas/ApiValidationError | Le corps de la requête ne respecte pas le schéma
GET /beers/{id} #/components/schemas/ApiValidationError | L'ID fourni n'est pas un entier positif
PATCH /beers/{id} #/components/schemas/ApiValidationError | L'ID fourni n'est pas un entier positif, ou le corps ne respecte pas le schéma

DELETE /beers/{id} #/components/schemas/ApiValidationError | L'ID fourni n'est pas un entier positif
```

La ligne vide après le PATCH est normale : sa `description` est écrite en bloc
YAML `>`, qui plie les lignes et laisse un saut de ligne final.

Trois contrôles : `ValidationError` est **absent** des schemas, `ApiValidationError`
présent, et les quatre descriptions sont **intactes**. Si une description
manque, un bloc a été mutilé au-delà du renommage.

Cette commande fonctionne aussi avant modification — la lancer d'abord donne la
photo d'avant, où les quatre `$ref` portent encore `ValidationError`.

- [x] **Step 5: commit**

Le schéma zod `ValidationError` est maintenant orphelin dans
`validateRequest.js` — plus personne ne l'importe. Il reste en place jusqu'à la
tâche 3 : le supprimer ici ne casserait rien, mais mélangerait deux sujets.

```bash
git add src/config/openapi.js src/features/beers/beers.routes.js docs/superpowers/plans/2026-08-26-validation-error-handling.md
git commit -F - <<'EOF'
docs(openapi): aligne le schéma du 400

Les quatre 400 référencent ApiValidationError, qui décrit le corps que
errorHandler produira au commit suivant.

Les blocs restent inline plutôt que mutualisés en components/responses :
sur GET, PATCH et DELETE, details[].path est vide — l'échec porte sur un
paramètre scalaire ou sur le corps entier — et la description de
l'opération est la seule chose qui dise que le 400 concerne l'id. C'est
la décision de 79bbc10, elle tient.

Corrige au passage une dépendance inversée : la config importait un
schéma de réponse depuis #http/middlewares/.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 3: validateRequest lève, errorHandler répond

Seul commit qui change une réponse de l'API.

**Files:**
- Modify: `src/http/middlewares/validateRequest.js` (remplacement complet)
- Modify: `src/http/middlewares/errorHandler.js` (remplacement complet)

**Interfaces:**
- Consumes: `ValidationError` (tâche 1), `HTTP_STATUS.BAD_REQUEST` de `#http/httpStatus.js`.
- Produces: le contrat de réponse 400 `{ error, details }`. L'export `ValidationError` (schéma zod) de `validateRequest.js` **disparaît** ; le module n'exporte plus que `validateParam` et `validateBody`.

Note : `validateRequest.js` est modifié dans le working tree (`reject` passé à
`HTTP_STATUS.BAD_REQUEST`). Le Step 1 remplace tout le fichier, ce changement
disparaît sans conséquence sur l'état final.

- [x] **Step 1: réécrire validateRequest.js**

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
- le schéma zod `ValidationError` et son `@typedef ValidationErrorBody` — partis dans `apiResponse.js` sous le nom `ApiValidationError` à la tâche 1 ;
- le helper `reject` — il ne portait que le statut et la forme, qui ne sont plus ici. La ligne `next(new ValidationError(error.issues))` est identique dans les deux validateurs : ne pas la refactoriser derrière un nom, cela masquerait le `next` explicite qui est le point du chantier ;
- l'import runtime `import * as z from "zod"` — les JSDoc passent par `import("zod").ZodType` ;
- la phrase « Le format de la réponse 400 est défini ici une seule fois » de l'en-tête, devenue fausse.

Le `@module` passe de `middlewares/validateRequest` à `http/middlewares/validateRequest` : il était périmé depuis le déplacement du commit `035d3c5`, et l'en-tête est réécrit de toute façon.

- [x] **Step 2: réécrire errorHandler.js**

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

/** Terminal, à monter en dernier dans l'app. */
export default (error, req, res, next) => {
  const status =
    HTTP_STATUS_BY_ERROR.get(error.constructor) ??
    HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Un message de 5xx porte le SQL, l'hôte, les chemins : logs seulement.
  if (isServerErrorStatus(status)) {
    console.error(error);
    return res.status(status).json({ error: "Internal server error" });
  }

  // `details` vient de l'erreur, pas du statut : aucune classe n'est nommée ici.
  return res.status(status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
  });
};
```

Trois changements par rapport à l'existant :
- l'entrée `ValidationError → BAD_REQUEST` dans la table ;
- le spread conditionnel de `details` sur la branche 4xx. La branche 5xx n'y touche pas : le message d'une 500 ne sort jamais, ses détails non plus ;
- « Seul point où **le domaine** reçoit un code HTTP » devient « Seul point où **une classe d'erreur** reçoit un code HTTP ». La formulation était déjà approximative — `RouteNotFoundError` n'est pas du domaine — et l'ajout de `ValidationError` la rend franchement fausse. Le JSDoc de l'export est replié sur une ligne et son backtick parasite (`l'app\``) disparaît, le fichier est touché de toute façon.

- [x] **Step 3: vérifier que le module n'exporte plus le schéma**

```bash
node --input-type=module -e 'const m = await import("#http/middlewares/validateRequest.js"); console.log(Object.keys(m).sort().join(","));'
```

Sortie attendue :

```
validateBody,validateParam
```

- [x] **Step 4: recharger l'API**

```bash
docker compose up -d api
```

Pas de `--build` : aucune tâche ne touche la table `imports` de `package.json`,
et `./src` est bind-mounté. Si le conteneur tourne déjà et que sa config n'a pas
changé, la commande est un no-op — c'est `nodemon --legacy-watch --watch src`
dans le conteneur qui a rechargé. Vérifier que le nouveau fichier
`src/http/errors/ValidationError.js` a bien été pris en compte, le watch est en
mode polling.

- [x] **Step 5: vérifier les trois cas où le path est vide**

```bash
curl.exe -s http://localhost:3000/beers/abc
curl.exe -s -X PATCH http://localhost:3000/beers/1 -H "Content-Type: application/json" -d '{}'
curl.exe -s -X POST http://localhost:3000/beers -H "Content-Type: application/json" -d '{"name":"K","brewery_id":1,"zz":1}'
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

La troisième rend bien **une seule** issue : `name` et `brewery_id` sont fournis
et valides, seule la clé inconnue est signalée.

Ces trois `path` vides sont les trois situations recensées : paramètre scalaire
(`IdParam` parse une valeur, pas un objet), `refine` racine de `UpdateBeer`, et
clé inconnue sur un `strictObject` — la clé fautive est alors dans le message.

- [x] **Step 6: vérifier qu'un path non vide sort bien, dans l'ordre**

```bash
curl.exe -s -X POST http://localhost:3000/beers -H "Content-Type: application/json" -d '{}'
```

Sortie attendue :

```json
{"error":"Validation failed","details":[{"path":"name","message":"Invalid input: expected string, received undefined"},{"path":"brewery_id","message":"Invalid input: expected number, received undefined"}]}
```

`name` avant `brewery_id` : zod rapporte les issues dans l'ordre de déclaration
du schéma.

- [x] **Step 7: vérifier que les 404 n'ont pas gagné de clé details**

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

- [x] **Step 8: vérifier les codes de statut de bout en bout**

Cette étape suppose une base **déjà initialisée et peuplée**. Sur un volume
`postgres18_cluster` neuf, `/beers/1` et `/beers` rendent 500 et l'étape n'est
pas discriminante. Au besoin : `pnpm db:reset`.

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

Les trois premiers et le dernier sont le vrai apport de l'étape : ils prouvent
que rien d'autre n'a cassé. Les deux autres ont déjà rendu leur corps aux
Steps 5 et 7.

- [x] **Step 9: commit**

```bash
git add src/http/middlewares/validateRequest.js src/http/middlewares/errorHandler.js docs/superpowers/plans/2026-08-26-validation-error-handling.md
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
statut. Son en-tête parlait du domaine alors que la table contient des
erreurs de protocole.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

### Task 4: la documentation dit la vérité

**Files:**
- Modify: `ARCHITECTURE.md:61-63`
- Modify: `requests/beers.http:13-15` et les annotations des lignes 23, 27, 37

**Interfaces:**
- Consumes: le contrat de réponse figé à la tâche 3.
- Produces: rien de consommable par du code.

- [x] **Step 1: corriger ARCHITECTURE.md**

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
`path` en notation pointée, vide quand l'erreur porte sur le corps entier.
```

Ce passage était faux deux fois : `notFound.js` a été supprimé par le commit
`9ae7f79`, et la double forme disparaît avec la tâche 3.

- [x] **Step 2: corriger l'en-tête de requests/beers.http**

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
# fautif en notation pointée, et reste vide quand l'erreur porte sur le corps
# entier.
```

La phrase sur les réponses 2xx est conservée : elle est toujours vraie.

- [x] **Step 3: corriger les trois annotations qui citent un code zod**

Le code zod n'apparaît plus dans les réponses. Remplacer par du contenu, et non
par le nom de la clé — écrire « details sur name » serait un recul, `details`
est le nom du champ, pas une information.

| Ligne | Actuel | Nouveau |
| --- | --- | --- |
| 23 | `### CREATE — sans body → 400, invalid_type sur name et brewery_id` | `### CREATE — sans body → 400, name et brewery_id manquants` |
| 27 | `### CREATE — brewery_id manquant → 400, invalid_type sur brewery_id` | `### CREATE — brewery_id manquant → 400` |
| 37 | `### CREATE — brewery_id en string → 400, invalid_type sur brewery_id` | `### CREATE — brewery_id en string → 400, type attendu number` |

Ne pas toucher au reste de ce fichier. Deux défauts préexistants y restent
délibérément — un `j` parasite ligne 30 dans le corps d'une requête, et un
`PUT /beers/{{id}}` ligne 60 alors que la route est en PATCH. Ils n'ont rien à
voir avec ce chantier.

- [x] **Step 4: vérifier qu'aucune mention obsolète ne subsiste**

`-F` est indispensable : sans lui, `git grep` interprète les accolades comme un
quantificateur d'intervalle.

```bash
git grep -n -F -e 'errors }' -e 'issues zod' -e 'notFound.js' -e 'invalid_type' -- ARCHITECTURE.md requests/ src/ || echo "aucune mention obsolete"
```

Sortie attendue :

```
aucune mention obsolete
```

Cette commande trouve 7 lignes avant la tâche 4 (2 dans `ARCHITECTURE.md`,
5 dans `requests/beers.http`). Le périmètre est complet : `README.md` et
`CONTRIBUTING.md` ne contiennent aucun de ces motifs.

- [x] **Step 5: commit**

```bash
git add ARCHITECTURE.md requests/beers.http docs/superpowers/plans/2026-08-26-validation-error-handling.md
git commit -F - <<'EOF'
docs: aligne la description du contrat d'erreur

ARCHITECTURE annonçait deux formes d'erreur et citait notFound.js,
supprimé par 9ae7f79. Le recueil de requêtes annonçait un tableau
d'issues zod sur les 400 et nommait des codes zod qui ne sortent plus.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
```

---

## Hors périmètre

Repéré pendant l'instruction du chantier, à **ne pas** traiter ici.

- **Corps JSON malformé** — `express.json()` lève un `SyntaxError` absent de
  `HTTP_STATUS_BY_ERROR` : l'API rend 500 là où elle devrait rendre 400. Très
  tentant à combler dans la tâche 3, et pourtant non : `HTTP_STATUS_BY_ERROR`
  indexe sur `error.constructor` en égalité exacte. Y mettre `SyntaxError`
  attraperait **tout** `SyntaxError`, y compris un bug de parsing dans notre
  propre code, qui sortirait en 400 au lieu de 500. Distinguer le corps
  malformé exige un prédicat (`error instanceof SyntaxError && "body" in error`),
  donc un cas particulier avant la lecture de la Map : c'est un changement de
  structure d'`errorHandler`, pas une ligne.
- **`beers.controller.js` appelle `service.updateOne`**, absent du service, qui
  n'expose que `updateOneById` : `PATCH /beers/1` avec un corps valide rend 500.
  Bug présent dans le working tree, à corriger séparément.
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
