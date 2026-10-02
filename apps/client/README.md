# Zythologue — client

Dashboard d'administration de Zythologue : inscription, connexion, déconnexion, tableau de bord.

## Stack

- React 19, TypeScript, Vite
- [shadcn/ui](https://ui.shadcn.com) (style `base-nova`, sur Base UI) et Tailwind CSS v4
- React Router (`createBrowserRouter`)
- zod pour la validation des formulaires, sonner pour les toasts

## Lancer

Depuis la racine du repo, `docker compose up --watch` démarre le client sur <http://localhost:5173> avec l'API et la base (voir le [README racine](../../README.md)).

Hors conteneur :

```bash
pnpm --filter client dev
```

| Script    | Rôle                                              |
| --------- | ------------------------------------------------- |
| `dev`     | serveur Vite                                      |
| `build`   | vérification des types (`tsc -b`) puis build Vite |
| `lint`    | ESLint                                            |
| `preview` | sert le build                                     |

`VITE_API_URL` donne l'URL de l'API vue par le navigateur (défaut `http://localhost:3000`).

## Routes

| Chemin      | Page                          |
| ----------- | ----------------------------- |
| `/`         | tableau de bord               |
| `/login`    | connexion                     |
| `/register` | inscription                   |
| `*`         | page introuvable              |

Les routes sont déclarées dans `src/App.tsx`.

## Arborescence

Le code suit [Feature-Sliced Design](https://feature-sliced.design/docs/get-started/overview). Les [couches](https://feature-sliced.design/docs/reference/layers) présentes, de la plus haute à la plus basse :

1. `app/` : routeur (`App.tsx`), point d'entrée (`main.tsx`), styles globaux
2. `pages/` : un dossier par page (dashboard, login, register, not-found)
3. `features/` : actions utilisateur réutilisables (logout)
4. `entities/` : objets métier (user : schémas email et mot de passe)
5. `shared/` : code sans métier — `api/` (apiFetch, ApiError), `ui/` (composants shadcn), `lib/` (utilitaires)

Une couche n'importe que les couches situées en dessous : `pages` peut importer `features`, jamais l'inverse.

Chaque [slice se découpe en segments](https://feature-sliced.design/docs/reference/slices-segments) `ui/` (composants), `model/` (schémas, données) et `api/` (appels réseau), et n'expose que ce que son `index.ts` exporte ([public API](https://feature-sliced.design/docs/reference/public-api)). On importe donc `@/pages/login`, jamais `@/pages/login/ui/LoginForm`. À l'intérieur d'un slice, les imports sont relatifs.

Pas de couche `widgets/` : un bloc propre à une page reste dans la page (les composants du dashboard sont dans `pages/dashboard/ui/`). On ne descend un bloc d'une couche que lorsqu'une deuxième page en a besoin.

`components.json` installe les composants shadcn dans `shared/ui/` (`pnpm exec shadcn add <composant>`). `shared/ui/` n'a pas d'`index.ts` : on importe chaque composant par son fichier, `@/shared/ui/button`.

L'alias `@/` pointe vers `src/`.

## Authentification

L'API pose le JWT dans un cookie httpOnly : le client ne lit ni ne stocke jamais le token. `apiFetch` (`src/shared/api/client.ts`) envoie le cookie avec `credentials: 'include'` et lève une `ApiError` (message et statut HTTP) sur toute réponse non-2xx. La déconnexion passe par `POST /auth/logout`, seule manière d'effacer un cookie httpOnly.

Détails côté serveur : [apps/api/AUTH.md](../api/AUTH.md).
