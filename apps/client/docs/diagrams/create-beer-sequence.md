# Séquence — création d'une bière côté client

Du bouton « Ajouter une bière » à la liste rechargée :

- [`BeersPage.tsx`](../../src/pages/beers/ui/BeersPage.tsx)
- [`CreateBeerDialog.tsx`](../../src/features/create-beer/ui/CreateBeerDialog.tsx)
- [`CreateBeerForm.tsx`](../../src/features/create-beer/ui/CreateBeerForm.tsx)
- [`BeerFormFields.tsx`](../../src/entities/beer/ui/BeerFormFields.tsx)
- [`beer-form-schema.ts`](../../src/entities/beer/model/beer-form-schema.ts)
- [`BreweryField.tsx`](../../src/entities/brewery/ui/BreweryField.tsx)
- [`create-beer.ts`](../../src/entities/beer/api/create-beer.ts)

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant P as BeersPage (page beers)
    participant D as CreateBeerDialog (feature create-beer)
    participant F as CreateBeerForm (feature create-beer)
    participant B as BreweryField (entity brewery)
    participant A as createBeer (entity beer)
    participant API as API

    U->>D: clic « Ajouter une bière »
    D->>F: ouvre le dialog, formulaire vide
    F->>B: BeerFormFields affiche le champ brasserie
    B->>API: GET /breweries (useBreweries)

    alt brasseries reçues
        API-->>B: 200 { data: Brewery[] }
        B-->>U: liste déroulante des brasseries
    else erreur
        API-->>B: erreur
        B-->>U: champ désactivé, « Impossible de charger les brasseries. »
    end

    U->>F: remplit et soumet
    F->>F: beerFormSchema.safeParse (Zod), champ vide devient null

    break format invalide
        F-->>U: erreurs sous les champs
    end

    F->>A: createBeer(newBeer)
    A->>API: POST /beers { name, brewery_id, alcohol_content, description }

    break nom déjà pris dans la brasserie
        API-->>A: 409
        A-->>F: ApiError 409
        F-->>U: « Cette brasserie a déjà une bière de ce nom » sous le nom
    end

    break autre erreur (400, 401, 422, 500, API injoignable)
        API-->>A: erreur
        A-->>F: ApiError
        F-->>U: « Création impossible, réessayez plus tard »
    end

    API-->>A: 201 { data: beer }
    A-->>F: ok
    F-->>U: toast « Bière ajoutée »
    F->>D: onCreated()
    D->>D: ferme le dialog
    D->>P: onCreated()

    alt déjà sur la page 1
        P->>P: reload()
    else autre page
        P->>P: goToPage(1)
    end
    Note over P,API: GET /beers?page=1 (séquence de liste)
```

## Notes

- La liste est triée de la plus récente à la plus ancienne : on revient en
  page 1, où la nouvelle bière apparaît en tête. Le rechargement suit la
  [séquence de liste](list-beers-sequence.md).
- Chaque participant porte sa couche FSD. `BreweryField` vient de l'entité
  `brewery` alors que le formulaire est celui d'une bière : `BeerFormFields`
  (entité `beer`) l'importe via la notation `@x`. `BeerFormFields` n'est pas
  dessiné, il ne fait qu'afficher les champs. `apiFetch` (`shared/api`) non
  plus : `createBeer` s'en sert et lève une `ApiError` si la réponse n'est
  pas `ok`.
- Le formulaire n'est pas contrôlé (`defaultValue`, `FormData`) : le dialog
  démonte son contenu à la fermeture, il repart vide à chaque ouverture.
- Le bouton n'est désactivé que pendant l'envoi (« Ajout… »), jamais pendant
  le chargement des brasseries : le schéma Zod signale un champ manquant.
- Le 422 (brasserie inexistante) ne peut pas arriver depuis la liste
  déroulante, sauf si la brasserie est supprimée entre-temps : il tombe dans
  l'erreur générique.
