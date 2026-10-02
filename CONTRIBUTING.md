# Contribuer

Pour la structure du code, voir [`ARCHITECTURE.md`](apps/api/ARCHITECTURE.md) (API)
et [`apps/client/README.md`](apps/client/README.md) (client).
Pour lancer le projet, voir [`README.md`](README.md).

## Flux Git

`develop` est la branche par défaut et la branche de travail.

1. Une issue par changement, une branche par issue, créée depuis `develop` :
   `<type>/<sujet>` (`feat/logout-client`, `docs/align-monorepo`…).
2. Les commits citent l'issue en pied de message : `Refs #N`.
3. Une PR vers `develop`, dont le corps se termine par `Closes #N` : l'issue
   se ferme au merge.
4. Merge en squash, branche supprimée.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), sujet en français :

```
<type>(<scope>): <description>

Refs #N
```

Types utilisés : `feat`, `fix`, `refactor`, `docs`, `test`, `build`, `chore`,
`style`, `revert`.

`build` couvre ce qui touche la chaîne de construction et d'exécution —
`Dockerfile`, `compose.yaml`, dépendances, scripts npm ; `chore` prend le reste
de l'intendance qui ne construit rien. `style` est réservé au formatage sans
effet sur le comportement : dès qu'une ligne change de sens, c'est `refactor`.

Scope = l'application (`api`, `client`) ou la ressource / le sujet touché
(`beers`, `auth`, `openapi`, `bruno`, `db`, `compose`...), omis si le
changement est transverse.

Un commit = un changement atomique. Un renommage et un déplacement de dossier
distincts vont dans deux commits séparés, même s'ils sont demandés dans la
même conversation.

## Convention de nommage des fichiers

### API

Dans `apps/api/src/features/<ressource>/` :

| Fichier | Rôle |
|---|---|
| `*.routes.js` | déclaration des routes Express |
| `*.controller.js` | req/res, appelle le service |
| `*.service.js` | logique métier |
| `*.repository.js` | accès DB |
| `*.schemas.js` | schémas zod (model, DTOs, réponses) |

### Client

Dans `apps/client/src/<couche>/<slice>/` (voir le [README client](apps/client/README.md#arborescence)) :

| Emplacement | Contenu |
|---|---|
| `ui/` | composants React, en PascalCase (`LoginForm.tsx`) |
| `model/` | schémas zod, données (`login-schema.ts`) |
| `api/` | appels à l'API, via `apiFetch` (`login.ts`) |
| `index.ts` | public API du slice : seul point d'import depuis l'extérieur |

Les composants shadcn (`shared/ui/`) gardent le nom kebab-case que génère le CLI.

## Vérifier avant de committer

API :

- L'app démarre (`docker compose up --watch`, ou `pnpm dev` hors conteneur),
  logs sans erreur.
- `pnpm test:bruno` passe. Si un endpoint est ajouté ou modifié, le dossier
  `apps/api/bruno/<ressource>/<endpoint>/` correspondant est mis à jour
  (l'authentification est rangée sous `bruno/account/`). Le compte de test
  est défini une seule fois, dans `apps/api/bruno/environments/Local.bru`.
- Si un schéma zod change : la doc `/docs` reflète le changement (générée
  depuis le schéma, donc automatique, mais à relire).

Client :

- `pnpm --filter client build` passe (vérification des types puis build).
- `pnpm --filter client lint` ne signale rien de nouveau. Les erreurs
  `react-refresh/only-export-components` de `shared/ui/` viennent du code
  généré par shadcn.
- Le parcours touché est vérifié dans le navigateur.

## Alias d'import

### API

Same-scope (même dossier) → relatif. Cross-scope (feature différente,
`shared/`, `config/`, `http/`, `errors/`) → alias `#*` déclaré dans le champ
`imports` de `package.json` : `#features/*`, `#shared/*`, `#config/*`,
`#http/*`, `#errors/*`. Ne pas ajouter de nouveau chemin relatif `../../` qui
traverse une frontière de dossier — ajouter/étendre un alias à la place.

Un alias pointe une racine : les middlewares s'importent via
`#http/middlewares/…`, il n'y a pas d'alias `#middlewares/*`.

### Client

`@/` pointe vers `src/`. Dans un même slice → relatif ; vers un autre slice
ou une autre couche → `@/` et la public API du slice (`@/entities/user`,
jamais `@/entities/user/model/credentials`).
