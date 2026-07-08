# Dictionnaire de données

> On y recense uniquement les **données élémentaires** (valeurs atomiques) portées par une entité ou une association. Les **relations** entre entités n'y figurent pas : elles sont traitées au MCD.

<!-- https://memento-dev.fr/docs/merise/dictionnaire-de-donnees -->

## PERSONNE

| Code           | Description        | Format         | Longueur | Règle                                                             |
|----------------|--------------------|----------------|----------|-------------------------------------------------------------------|
| per_email      | Adresse e-mail     | Alphanumérique | 255      | obligatoire, unique                                               |
| per_nom        | Nom de famille     | Alphanumérique | 80       | obligatoire                                                       |
| per_prenom     | Prénom             | Alphanumérique | 80       | obligatoire                                                       |
| per_mdp        | Mot de passe       | Alphanumérique | 255      | obligatoire                                                       |
| per_role       | Rôle applicatif    | Alphanumérique | 10       | obligatoire, domaine { client, brasseur, admin }, défaut = client |
| per_date_inscr | Date d'inscription | Date           | —        | obligatoire, automatique à l'inscription                          |

## BRASSERIE

| Code               | Description            | Format         | Longueur | Règle                                                           |
|--------------------|------------------------|----------------|----------|-----------------------------------------------------------------|
| bra_nom            | Nom de la brasserie    | Alphanumérique | 120      | obligatoire                                                     |
| bra_description    | Description            | Alphanumérique | —        | facultatif                                                      |
| bra_annee_creation | Année de création      | Numérique      | —        | facultatif                                                      |
| bra_capacite_prod  | Capacité de production | Numérique      | —        | facultatif, > 0 si renseignée                                   |
| bra_type_prod      | Type de production     | Alphanumérique | 20       | facultatif,domaine { artisanale, industrielle, microbrasserie } |
| bra_telephone      | Téléphone              | Alphanumérique | 20       | facultatif                                                      |
| bra_site_web       | Site web               | Alphanumérique | 255      | facultatif                                                      |

## POINT DE VENTE

| Code            | Description            | Format         | Longueur | Règle                                                      |
|-----------------|------------------------|----------------|----------|------------------------------------------------------------|
| pdv_nom         | Nom du point de vente  | Alphanumérique | 120      | obligatoire                                                |
| pdv_type        | Type de point de vente | Alphanumérique | 20       | facultatif, domaine { cave, bar, restaurant, supermarché } |
| pdv_vente_ligne | Vente en ligne         | Logique        | —        | défaut = faux                                              |
| pdv_telephone   | Téléphone              | Alphanumérique | 20       | facultatif                                                 |
| pdv_site_web    | Site web               | Alphanumérique | 255      | facultatif                                                 |

## ADRESSE

| Code            | Description    | Format         | Longueur | Règle                        |
|-----------------|----------------|----------------|----------|------------------------------|
| adr_numero      | Numéro de voie | Alphanumérique | 10       | facultatif (ex. 12, 12 bis)  |
| adr_rue         | Rue / voie     | Alphanumérique | 255      | obligatoire                  |
| adr_code_postal | Code postal    | Alphanumérique | 10       | obligatoire                  |
| adr_ville       | Ville          | Alphanumérique | 100      | obligatoire                  |
| adr_pays        | Pays           | Alphanumérique | 60       | obligatoire                  |

## BIÈRE

| Code              | Description             | Format         | Longueur | Règle                                  |
|-------------------|-------------------------|----------------|----------|----------------------------------------|
| bie_nom           | Nom de la bière         | Alphanumérique | 120      | obligatoire                            |
| bie_description   | Description de la bière | Alphanumérique | —        | facultatif                             |
| bie_degre_alcool  | Degré d'alcool (% vol.) | Numérique      | 4,2      | facultatif, 0 ≤ degré ≤ 100            |

## CATÉGORIE

| Code            | Description                 | Format         | Longueur | Règle               |
|-----------------|-----------------------------|----------------|----------|---------------------|
| cat_nom         | Nom de la catégorie         | Alphanumérique | 60       | obligatoire, unique |
| cat_description | Description de la catégorie | Alphanumérique | —        | facultatif          |

## INGRÉDIENT

| Code              | Description         | Format         | Longueur | Règle               |
|-------------------|---------------------|----------------|----------|---------------------|
| ing_nom           | Nom de l'ingrédient | Alphanumérique | 80       | obligatoire, unique |
| ing_est_allergene | Est un allergène    | Logique        | —        | défaut = faux       |

## AVIS

| Code            | Description               | Format         | Longueur | Règle                                                  |
|-----------------|---------------------------|----------------|----------|--------------------------------------------------------|
| avi_note        | Note attribuée            | Numérique      | —        | obligatoire, domaine 1 à 5                             |
| avi_commentaire | Commentaire               | Alphanumérique | —        | facultatif                                             |
| avi_date        | Date de l'avis            | Date           | —        | obligatoire, automatique à la création                 |
| avi_signale     | Signalé comme inapproprié | Logique        | —        | défaut = faux                                          |
| avi_reponse     | Réponse du brasseur       | Alphanumérique | —        | facultatif, rempli par le BRASSEUR de la bière évaluée |

## PHOTO

| Code        | Description             | Format         | Longueur | Règle           |
|-------------|-------------------------|----------------|----------|-----------------|
| pho_url     | URL / chemin du fichier | Alphanumérique | 255      | obligatoire     |
| pho_legende | Légende                 | Alphanumérique | 255      | facultatif      |
| pho_date    | Date d'ajout            | Date           | —        | obligatoire     |

## VENDRE *(association POINT DE VENTE × BIÈRE)*

> Donnée portée par l'association : le prix dépend du **couple** (point de vente, bière), pas de l'un ou l'autre seul.

| Code     | Description     | Format    | Longueur | Règle                        |
|----------|-----------------|-----------|----------|------------------------------|
| ven_prix | Prix de vente € | Numérique | 8,2      | obligatoire, > 0             |
