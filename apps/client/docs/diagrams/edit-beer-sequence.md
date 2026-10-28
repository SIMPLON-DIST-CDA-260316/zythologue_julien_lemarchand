# Séquence — modification d'une bière côté client

Du menu « ⋯ » d'une ligne à la liste rechargée :

- [`BeersPage.tsx`](../../src/pages/beers/ui/BeersPage.tsx) (`BeerActions`)
- [`EditBeerDialog.tsx`](../../src/features/edit-beer/ui/EditBeerDialog.tsx)
- [`EditBeerForm.tsx`](../../src/features/edit-beer/ui/EditBeerForm.tsx)
- [`get-changed-fields.ts`](../../src/features/edit-beer/model/get-changed-fields.ts)
- [`beer-form-schema.ts`](../../src/entities/beer/model/beer-form-schema.ts)
- [`update-beer.ts`](../../src/entities/beer/api/update-beer.ts)

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant P as BeersPage
    participant R as BeerActions
    participant D as EditBeerDialog
    participant F as EditBeerForm
    participant A as updateBeer
    participant API as API

    U->>R: clic « ⋯ » puis « Modifier »
    R->>R: setEditing(true)
    R->>D: open = true, beer de la ligne
    D->>F: formulaire pré-rempli avec beer (defaultValue)
    Note over F: pas de GET /beers/:id, la ligne a déjà les données

    U->>F: modifie et soumet
    F->>F: beerFormSchema.safeParse (Zod), champ vide devient null

    break format invalide
        F-->>U: erreurs sous les champs
    end

    F->>F: getChangedFields(beer, values)

    break aucun champ modifié
        F->>D: onUnchanged()
        D-->>U: dialog fermé, aucune requête
    end

    F->>A: updateBeer(beer.id, changes)
    A->>API: PATCH /beers/:id { seulement les champs modifiés }

    break nom déjà pris dans la brasserie
        API-->>A: 409
        A-->>F: ApiError 409
        F-->>U: « Cette brasserie a déjà une bière de ce nom » sous le nom
    end

    break autre erreur (400, 401, 404, 422, 500, API injoignable)
        API-->>A: erreur
        A-->>F: ApiError
        F-->>U: « Modification impossible, réessayez plus tard »
    end

    API-->>A: 200 { data: beer }
    A-->>F: ok
    F-->>U: toast « Bière modifiée »
    F->>D: onUpdated()
    D->>R: onOpenChange(false)
    D->>P: onUpdated() = reload()
    Note over P,API: GET /beers?page=N, on reste sur la page en cours
```

## Notes

- `PATCH` et non `PUT` : une clé absente laisse la colonne intacte, `null`
  l'efface. `getChangedFields` n'envoie donc que ce qui diffère de `beer`.
- Un champ vidé part à `null` (« effacer »), pas absent (« ne pas toucher ») :
  c'est le rôle des transformations du schéma.
- `initial` est typé `BeerFormValues` dans `getChangedFields` : un champ ajouté
  au schéma mais oublié ici ne compile pas.
- C'est `BeerActions` qui tient `open` : le menu se démonte en se fermant, il
  ne peut pas porter le `DialogTrigger`.
