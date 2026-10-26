Z# Séquence — login côté client

Du formulaire au dashboard, en passant par l'`AuthContext` :

- [`LoginForm.tsx`](../../src/pages/login/ui/LoginForm.tsx)
- [`use-login.ts`](../../src/pages/login/model/use-login.ts)
- [`post-login.ts`](../../src/pages/login/api/post-login.ts)
- [`auth-provider.tsx`](../../src/entities/user/model/auth-provider.tsx)
- [`get-me.ts`](../../src/entities/user/api/get-me.ts)

Le détail côté serveur est dans le
[diagramme de l'API](../../../api/docs/diagrams/login-sequence.md).

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant F as LoginForm
    participant HL as useLogin
    participant AL as postLogin
    participant P as AuthProvider
    participant GM as getMe
    participant API as API

    U->>F: soumet email + mot de passe
    F->>F: loginSchema.safeParse (Zod)

    break format invalide
        F-->>U: erreurs sous les champs
    end

    F->>HL: login(credentials)
    HL->>AL: postLogin(credentials)
    AL->>API: POST /auth/login

    break identifiants invalides
        API-->>AL: 401
        AL-->>F: ApiError 401 (remonte via useLogin)
        F-->>U: « Email ou mot de passe incorrect »
    end

    API-->>AL: 200 + Set-Cookie access_token (httpOnly)
    AL-->>HL: ok

    HL->>P: refreshUser()
    P->>GM: getMe()
    GM->>API: GET /users/me (cookie envoyé par le navigateur)
    API-->>GM: 200 { data: user }
    GM-->>P: user
    P->>P: setUser(user) → isAuthenticated = true
    P-->>HL: ok
    HL-->>F: ok
    F->>U: navigate("/") → dashboard
```

## Notes

- `LoginForm` ne connaît que `login()` : `useLogin` enchaîne l'appel API et
  la mise à jour du contexte.
- `refreshUser()` est attendu **avant** `navigate("/")` : le dashboard
  s'affiche avec un utilisateur déjà chargé.
- Le JavaScript ne lit jamais le cookie (`httpOnly`) : c'est `GET /users/me`
  qui dit au client qui est connecté.
- Toute autre erreur (API injoignable, 500, échec de `refreshUser`) remonte
  au formulaire, qui affiche « Connexion impossible, réessayez plus tard ».
