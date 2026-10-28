# Séquence — liste des bières côté client (livré)

De l'URL `/beers?page=N` au tableau paginé :

- [`BeersPage.tsx`](../../src/pages/beers/ui/BeersPage.tsx)
- [`use-beers.ts`](../../src/pages/beers/model/use-beers.ts)
- [`get-beers.ts`](../../src/entities/beer/api/get-beers.ts)

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant P as BeersPage (page beers)
    participant H as useBeers (page beers)
    participant A as getBeers (entity beer)
    participant API as API

    U->>P: ouvre /beers?page=N
    P->>P: pageNumber lu dans l'URL (1 par défaut)
    P->>H: useBeers(pageNumber)
    H-->>P: status loading
    P-->>U: 12 lignes squelette

    H->>+A: getBeers({ pageNumber, pageSize: 12 }, signal)
    A->>API: GET /beers?page=N&size=12 (cookie envoyé par le navigateur)

    break API injoignable, 401 ou 500
        API-->>A: erreur
        A-->>H: ApiError
        H-->>P: status error
        P-->>U: « Impossible de charger les bières. Réessayez plus tard. »
    end

    API-->>A: 200 { data: Beer[], meta: { total, page, size } }
    A-->>-H: response
    H-->>P: status success

    alt meta.total = 0
        P-->>U: « Aucune bière pour le moment. »
    else au moins une bière
        P-->>U: tableau Nom / Brasserie / Degré / ⋯ et pagination
    end

    U->>P: clic « Suivant »
    P->>P: setSearchParams({ page: N + 1 })
    Note over P,API: nouveau pageNumber, l'effet de useBeers annule la requête en cours et relance le chargement
```

## Notes

- La barre d'activation de `getBeers` montre l'attente de la réponse.
  `useBeers` n'en a pas : l'effet lance la requête et se termine aussitôt,
  la réponse revient plus tard par un `setLastResult`.
- La page est dans l'URL et non dans un state : F5 et « précédent » la
  conservent.
- `useBeers` passe un `AbortController` à `getBeers` : la réponse d'une page
  quittée ne peut pas écraser celle de la page suivante.
- `reload()` relance la même requête sans changer de page. La
  [création](create-beer-sequence.md), la
  [modification](edit-beer-sequence.md) et la
  [suppression](delete-beer-sequence.md) s'en servent pour rafraîchir la
  liste.
- Chaque participant porte sa couche FSD : `page` importe `entity`, jamais
  l'inverse. `apiFetch` (`shared/api`) n'est pas dessiné : `getBeers` s'en
  sert pour l'appel HTTP et lève une `ApiError` si la réponse n'est pas `ok`.
- `GET /beers` ne renvoie que la brasserie (id et nom) : le détail d'une bière
  passe par `GET /beers/:id`, non utilisé par le client à ce stade.
