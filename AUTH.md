# Authentification

Comptes utilisateur·ice (email + mot de passe), connexion par JWT en cookie
httpOnly, autorisation par middleware.

> Déroulé pas-à-pas de chaque route : voir les diagrammes de séquence
> (`docs/diagrams/`, générés à partir du code — inscription, connexion,
> autorisation).

## Mécanismes

- **Mot de passe** — haché avec **Argon2** (`hashPassword`,
  [`auth.lib.js`](src/features/auth/auth.lib.js)), jamais stocké en clair.
- **Email** — unique, comparaison insensible à la casse (409 si déjà pris).
- **JWT** — signé (`jsonwebtoken`, payload `{ sub: userId }`), durée de vie
  15 min (`JWT_DURATION_MS`, [`auth.config.js`](src/features/auth/auth.config.js)),
  posé en cookie **httpOnly** (`access_token`, [`AUTH_COOKIE_NAME`](src/features/auth/auth.config.js)) — jamais dans le corps de la réponse,
  illisible en JS côté client. Options
  ([`auth.controller.js`](src/features/auth/auth.controller.js)) : `secure`
  en production, `sameSite: "strict"`, `maxAge` synchronisé sur
  `JWT_DURATION_MS` (15 min) — cookie et token expirent ensemble.
- **`requireAuth`** ([`requireAuth.js`](src/http/middlewares/requireAuth.js))
  — vérifie le cookie/JWT, attache `req.user`. 401 si absent/invalide.
- **`requireSelf`** ([`requireSelf.js`](src/http/middlewares/requireSelf.js))
  — `req.user.id` doit correspondre au `:id` de la route. 403 sinon.

## Décisions

- Email inconnu et mot de passe incorrect renvoient la **même erreur 401**
  (`InvalidCredentialsError`) — évite l'énumération de comptes.
- JWT courte durée (15 min), pas de refresh token pour l'instant — choix de
  scope actuel, pas un oubli.
