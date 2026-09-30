# Séquence — création de compte (livré)

Flux `POST /users` :

- [`users.routes.js`](../../src/features/users/users.routes.js)
- [`users.controller.js`](../../src/features/users/users.controller.js)
- [`users.service.js`](../../src/features/users/users.service.js)
- [`users.repository.js`](../../src/features/users/users.repository.js)

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur (navigateur)
    participant R as Router (users.routes)
    participant BODY as validateBody (Zod)
    participant C as users.controller
    participant S as users.service
    participant Lib as auth.lib
    participant Repo as users.repository
    participant DB as PostgreSQL

    U->>R: POST /users {email, password}
    R->>BODY: validateBody(NewUser)

    break payload invalide
        BODY-->>U: 400 ValidationError
    end

    BODY->>+C: next() — req.validated.body
    C->>+S: createOne({email, password})
    S->>+Lib: hashPassword(password)
    Lib-->>-S: hashed_password
    S->>+Repo: createOne({email, hashed_password})
    Repo->>+DB: INSERT INTO account (email, hashed_password) RETURNING ...

    alt email déjà utilisé
        DB-->>Repo: erreur UNIQUE_VIOLATION
        Repo-->>-S: erreur
        S-->>C: 409 ConflictError
    else succès
        DB-->>Repo: row
        Repo-->>S: user
        S-->>-C: user
        C-->>-U: 201 Created {user}
    end
```

## Notes

- Validation stricte du body : le schéma `NewUser` (Zod) n'accepte que
  `email` et `password` — toute clé en plus ou en moins est rejetée avant
  d'atteindre le controller.
- Le mot de passe est haché (Argon2, `auth.lib.js`) à chaque création,
  sans condition — sur `PATCH /users/:id`, le hash n'a lieu que si le
  mot de passe fait partie des champs modifiés.
- Un email déjà utilisé remonte comme une contrainte Postgres
  (`UNIQUE_VIOLATION`), traduite en 409 `ConflictError` par
  `toDomainError`.
- Pas de vérification de compte (email, `verified_at`) dans ce flux —
  voir [`signup-verify-sequence.md`](signup-verify-sequence.md), design
  bonus non implémenté.
- `ValidationError` et `ConflictError` ne sont pas renvoyées explicitement
  par le controller : elles remontent jusqu'au middleware d'erreur global
  d'Express, qui les transforme en réponse HTTP — c'est pourquoi certaines
  branches du diagramme s'arrêtent sans flèche de retour vers l'utilisateur.
