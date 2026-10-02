# Séquence — inscription + vérification de compte (non implémenté)

Flux `POST /users` puis `GET /auth/verify?token=...`, cas nominal uniquement
(pas de gestion d'erreur : token invalide/expiré/déjà utilisé).

```mermaid
sequenceDiagram
    actor U as Utilisateur (navigateur)
    participant API as API
    participant DB as PostgreSQL
    participant Mail as Service Email
    participant FE as Frontend

    U->>API: POST /users {email, password}
    Note over API,DB: Inscription (validation, hash, INSERT) — cf. create-user-sequence.md<br/>verified_at=NULL à la création
    API-->>U: 201 Created

    Note over API,Mail: Async, hors chemin critique de la réponse
    API->>API: génère JWT vérif (user_id, exp, scope=email_verification)
    API->>Mail: envoie email (lien /auth/verify?token=...)
    Mail->>U: email de vérification (lien)

    U->>API: GET /auth/verify?token=...
    API->>API: vérifie signature + exp du JWT
    API->>DB: UPDATE account SET verified_at=now() WHERE id=... AND verified_at IS NULL
    DB-->>API: OK
    API-->>U: 302 Redirect (Location: FE/verification?status=success)
    U->>FE: GET /verification?status=success
    FE-->>U: page "compte vérifié"
```

## Décisions actées

- `GET /auth/verify` redirige (302) vers une page frontend, pas de réponse
  JSON brute (endpoint atteint par clic navigateur, pas par un client API).
