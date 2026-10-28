# Séquence — liste des bières côté client (livré)

De l'URL `/beers?page=N&size=S` au tableau paginé :

- [`BeersPage.tsx`](../../src/pages/beers/ui/BeersPage.tsx)
- [`columns.tsx`](../../src/pages/beers/ui/columns.tsx)
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

    U->>P: ouvre /beers?page=N&size=S
    P->>P: page et taille lues dans l'URL (1 et 12 par défaut)
    P->>H: useBeers(pageNumber, pageSize)
    H-->>P: status loading
    P-->>U: S lignes squelette

    H->>+A: getBeers({ pageNumber, pageSize }, signal)
    A->>API: GET /beers?page=N&size=S (cookie envoyé par le navigateur)

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

    U->>P: clic ⏮ ◀ ▶ ⏭ ou choix « Bières par page »
    P->>P: TanStack calcule la pagination, setSearchParams({ page, size })
    Note over P,API: nouvelle page ou taille, l'effet de useBeers annule la requête en cours et relance le chargement
```

## Notes

- La barre d'activation de `getBeers` montre l'attente de la réponse.
  `useBeers` n'en a pas : l'effet lance la requête et se termine aussitôt,
  la réponse revient plus tard par un `setLastResult`.
- La page et la taille sont dans l'URL et non dans un state : F5 et
  « précédent » les conservent. Une taille hors de `PAGE_SIZES` (12, 24, 48)
  revient à 12.
- Le tableau est un Data Table TanStack non dessiné : `useTable` reçoit les
  colonnes de `getBeerColumns` et la pagination lue dans l'URL. Avec
  `manualPagination`, il ne redécoupe pas la page reçue, et `rowCount:
  meta.total` lui donne le nombre de pages. Un clic passe par
  `onPaginationChange`, qui écrit dans l'URL.
- Changer la taille recalcule la page pour garder visible la première bière
  affichée : de la page 2 en 12, on passe à la page 1 en 24.
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
