# Contribuer

Pour la structure du code, voir [`ARCHITECTURE.md`](ARCHITECTURE.md).
Pour lancer le projet, voir [`README.md`](README.md).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), sujet en français :

```
<type>(<scope>): <description>
```

Types observés dans l'historique : `feat`, `fix`, `refactor`, `docs`, `chore`,
`test`. Scope = nom de la ressource ou du sujet touché (`beers`, `openapi`,
`structure`...), omis si le changement est transverse.

Un commit = un changement atomique. Un renommage et un déplacement de dossier
distincts vont dans deux commits séparés, même s'ils sont demandés dans la
même conversation.

## Convention de nommage des fichiers

Dans `src/features/<ressource>/` :

| Fichier | Rôle |
|---|---|
| `*.routes.js` | déclaration des routes Express |
| `*.controller.js` | req/res, appelle le service |
| `*.services.js` | logique métier |
| `*.repository.js` | accès DB |
| `*.schema.js` | schémas zod (model, DTOs, réponses) |

## Vérifier avant de committer

Pas de suite de tests automatisée ni de linter configuré à ce jour — à
mettre en place plutôt que de considérer leur absence comme acquise.
En attendant :

- L'app démarre : `docker compose up -d --build api` (ou `pnpm dev` hors
  conteneur), logs sans erreur.
- Si un endpoint est ajouté/modifié : le fichier `requests/<ressource>.http`
  correspondant est mis à jour avec les nouveaux cas.
- Si un schéma zod change : la doc `/docs` reflète le changement (générée
  depuis le schéma, donc automatique, mais à relire).

## Alias d'import

Same-scope (même dossier) → relatif. Cross-scope (feature différente,
`config/`, `middlewares/`, `http/`) → alias `#*` déclaré dans le champ
`imports` de `package.json`. Ne pas ajouter de nouveau chemin relatif
`../../` qui traverse une frontière de dossier — ajouter/étendre un alias
à la place.
