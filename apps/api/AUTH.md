# Authentification

Comptes utilisateur·ice (email + mot de passe), connexion par JWT en cookie
httpOnly, autorisation par middleware.

> Déroulé pas-à-pas, en diagrammes de séquence (`docs/diagrams/`) :
> * [inscription](docs/diagrams/create-user-sequence.md)
> * [connexion](docs/diagrams/login-sequence.md)
> * [autorisation](docs/diagrams/patch-user-sequence.md) (modification de son compte)
> * [Vérification d'email](docs/diagrams/signup-verify-sequence.md) : design non implémenté

## Mécanismes

- **Mot de passe** — haché avec **Argon2** (`hashPassword`,
  [`auth.lib.js`](src/features/auth/auth.lib.js)), jamais stocké en clair.
- **Email** — unique, comparaison insensible à la casse (409 si déjà pris).
- **JWT** — signé (`jsonwebtoken`, payload `{ sub: String(id) }`), durée de vie
  15 min (`JWT_DURATION_MS`, [`auth.config.js`](src/features/auth/auth.config.js)),
  posé en cookie **httpOnly** (`access_token`, [`AUTH_COOKIE_NAME`](src/features/auth/auth.config.js)) — jamais dans le corps de la réponse,
  illisible en JS côté client. Options
  ([`auth.controller.js`](src/features/auth/auth.controller.js)) : `secure`
  en production, `sameSite: "strict"`, `path: "/"`, `maxAge` synchronisé sur
  `JWT_DURATION_MS` (15 min) — cookie et token expirent ensemble.
- **Déconnexion** — `POST /auth/logout` efface le cookie (`res.clearCookie`)
  avec les mêmes options qu'à la pose, sinon le navigateur ne reconnaît pas
  le cookie à effacer. Répond 204. Le JS du client ne peut pas supprimer un
  cookie httpOnly : cette route est le seul moyen de se déconnecter.
- **Profil** — `GET /users/me` (derrière `requireAuth`) renvoie
  l'utilisateur·ice connecté·e, sans `hashed_password` (schéma de sortie
  `SafeUser`). C'est par cette route que le client sait qui est connecté.
- **`requireAuth`** ([`requireAuth.js`](src/http/middlewares/requireAuth.js))
  — vérifie le cookie/JWT, attache `req.user`. 401 si absent/invalide.
- **`requireSelf`** ([`requireSelf.js`](src/http/middlewares/requireSelf.js))
  — `req.user.id` doit correspondre au `:id` de la route. 403 sinon.

## Décisions

- Email inconnu et mot de passe incorrect renvoient la **même erreur 401**
  (`InvalidCredentialsError`) — évite l'énumération de comptes.
- JWT courte durée (15 min), pas de refresh token pour l'instant — choix de
  scope actuel, pas un oubli.
- `POST /auth/logout` n'est **pas** derrière `requireAuth` : effacer un cookie
  absent ou expiré ne pose aucun risque, et une session déjà expirée doit
  pouvoir se déconnecter sans erreur. La route répond 204 dans tous les cas.
- Le JWT reste en cookie httpOnly, jamais dans le `localStorage` : un script
  injecté (XSS) ne peut pas le lire.
