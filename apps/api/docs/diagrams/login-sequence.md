# Séquence — login (livré)

Flux `POST /auth/login` :

- [`auth.routes.js`](../../src/features/auth/auth.routes.js)
- [`auth.controller.js`](../../src/features/auth/auth.controller.js)
- [`auth.service.js`](../../src/features/auth/auth.service.js)
- [`auth.lib.js`](../../src/features/auth/auth.lib.js)

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur (navigateur)
    participant R as Router (auth.routes)
    participant MW as validateBody (Zod)
    participant C as auth.controller
    participant S as auth.service
    participant US as users.service
    participant DB as PostgreSQL
    participant Lib as auth.lib

    U->>R: POST /auth/login {email, password}
    R->>MW: validateBody(Login)

    break payload invalide
        MW-->>U: 400 ValidationError
    end

    MW->>+C: next() — req.validated.body
    C->>+S: login({email, password})
    S->>+US: findByEmail({email})
    US->>+DB: SELECT id, email, hashed_password FROM account WHERE email = $1
    DB-->>-US: row | undefined
    US-->>-S: user | undefined

    break user introuvable
        S-->>C: 401 InvalidCredentialsError
    end

    S->>+Lib: verifyPassword(hashed_password, password)
    Lib-->>-S: boolean

    break mot de passe incorrect
        S-->>C: 401 InvalidCredentialsError
    end

    S->>+Lib: generateToken(user.id)
    Lib-->>-S: JWT (sub=String(id), exp=15m)
    S-->>-C: token
    C->>C: res.cookie(AUTH_COOKIE_NAME, token, {httpOnly, secure, sameSite: strict, maxAge: 15m, path: "/"})
    C-->>-U: 200 OK
```

## Notes

- Le mot de passe est vérifié avec Argon2 (`verifyPassword`, `auth.lib.js`)
  contre le hash stocké en base — jamais de comparaison en clair.
- Le JWT (`generateToken`, payload `{ sub: id }`) expire après 15 minutes ;
  signé avec `JWT_SECRET`, une variable d'environnement, jamais en dur
  dans le code.
- Le cookie qui transporte le JWT a la même durée de vie que le token
  (`JWT_DURATION_MS`, `auth.config.js`) — les deux expirent ensemble,
  pas de cookie qui survivrait à un JWT déjà expiré.
- `ValidationError` et `InvalidCredentialsError` ne sont pas renvoyées
  explicitement par le controller : elles remontent jusqu'au middleware
  d'erreur global d'Express, qui les transforme en réponse HTTP — c'est
  pourquoi certaines branches du diagramme s'arrêtent sans flèche de
  retour vers l'utilisateur.
