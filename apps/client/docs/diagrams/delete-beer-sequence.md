# Séquence — suppression d'une bière côté client (livré)

Du menu « ⋯ » d'une ligne à la liste rechargée :

- [`BeersPage.tsx`](../../src/pages/beers/ui/BeersPage.tsx) (`handleDeleted`)
- [`BeerActions.tsx`](../../src/pages/beers/ui/BeerActions.tsx)
- [`DeleteBeerDialog.tsx`](../../src/features/delete-beer/ui/DeleteBeerDialog.tsx)
- [`delete-beer.ts`](../../src/entities/beer/api/delete-beer.ts)

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant P as BeersPage (page beers)
    participant R as BeerActions (page beers)
    participant D as DeleteBeerDialog (feature delete-beer)
    participant A as deleteBeer (entity beer)
    participant API as API

    U->>R: clic « ⋯ » puis « Supprimer »
    R->>R: setDeleting(true)
    R->>D: open = true, beer de la ligne
    D-->>U: « Supprimer « nom » ? » et avertissement sur la cascade

    break clic « Annuler » ou Échap
        D->>R: onOpenChange(false)
        D-->>U: dialog fermé, aucune requête
    end

    U->>D: clic « Supprimer »
    activate D
    D->>+A: deleteBeer(beer.id)
    A->>API: DELETE /beers/:id

    break erreur (401, 404, 500, API injoignable)
        API-->>A: erreur
        A-->>D: ApiError
        D-->>U: dialog reste ouvert, « Suppression impossible, réessayez plus tard »
    end

    API-->>A: 204
    A-->>-D: ok
    D-->>U: toast « Bière supprimée »
    D->>R: onOpenChange(false)
    D->>P: onDeleted() = handleDeleted()

    alt dernière bière de la page et page > 1
        P->>P: goToPage(N - 1)
        Note over P,API: GET /beers?page=N-1
    else sinon
        P->>P: reload()
        Note over P,API: GET /beers?page=N
    end
    deactivate D
```

## Notes

- Les barres d'activation montrent qui attend la réponse. Celle de
  `DeleteBeerDialog` correspond à `pending` : le bouton reste désactivé
  (« Suppression… ») de l'appel jusqu'au `finally`, une fois le callback du parent appelé. Le `GET` de rechargement part ensuite, depuis l'effet de `useBeers`.
- `AlertDialog` plutôt que `Dialog` : rôle `alertdialog`, et un clic à
  l'extérieur ne le ferme pas. L'action est irréversible.
- `AlertDialogAction` ne ferme pas le dialog tout seul : il ne se ferme
  qu'après le 204, pour pouvoir afficher l'erreur sinon.
- Sans le retour à la page précédente, supprimer la seule bière de la
  dernière page afficherait une page vide.
- Côté API, la suppression part en cascade : avis, favoris, photos,
  compositions, catégorisations et mises en vente liés à la bière.
- Chaque participant porte sa couche FSD. Non dessinés : `getBeerColumns`
  (`columns.tsx`), qui transmet `onDeleted` de `BeersPage` à `BeerActions`
  dans la cellule d'actions, et
  `apiFetch` (`shared/api`), dont `deleteBeer` se sert et qui lève une
  `ApiError` si la réponse n'est pas `ok`.
- Le rechargement suit la [séquence de liste](list-beers-sequence.md).
