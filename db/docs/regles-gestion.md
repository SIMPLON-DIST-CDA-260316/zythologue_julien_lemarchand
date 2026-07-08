# Règles de gestion

> **Format :** SUJET **verbe quantité** OBJET *condition*

| ↔  | Règle                                                                              | Type |
|----|------------------------------------------------------------------------------------|------|
| 01 | une PERSONNE **est un** CLIENT, un BRASSEUR ou UN ADMINISTRATEUR                   | STRU |
| 02 | une PERSONNE **a zéro ou plusieurs** AVIS                                          | STRU |
| 03 | une PERSONNE **n'a qu'un seul** AVIS *par BIÈRE*                                   | CTRL |
| 04 | une PERSONNE **est illustrée par zéro ou une** PHOTO                               | STRU |
| 05 | une PERSONNE **a en FAVORI une ou plusieurs** BRASSERIES ou BIÈRES                 | STRU |
| -- | l'Email d'une PERSONNE **est unique**                                              | CTRL |
| -- | une PERSONNE **peut signaler** un AVIS                                             | CTRL |
| 01 | un BRASSEUR **est une seule** PERSONNE                                             | STRU |
| 06 | un BRASSEUR **représente une seule** BRASSERIE                                     | STRU |
| 01 | un CLIENT **est une seule** PERSONNE                                               | STRU |
| 07 | un CLIENT **a zéro ou plusieurs** FAVORIS                                          | STRU |
| 01 | un ADMINISTRATEUR **est une seule** PERSONNE                                       | STRU |
|    |                                                                                    |      |
| 02 | un AVIS **appartient à une seule** PERSONNE                                        | STRU |
| 08 | un AVIS **évalue une seule** BIÈRE                                                 | STRU |
| -- | la note d'un AVIS **est comprise entre** 1 et 5                                    | CTRL |
| -- | un AVIS **peut recevoir une** RÉPONSE *écrite par le BRASSEUR de la BIÈRE évaluée* | CTRL |
| -- | une PERSONNE **peut supprimer son propre** AVIS                                    | CTRL |
| -- | un AVIS *signalé* **est supprimé uniquement par un** ADMINISTRATEUR                | CTRL |
| 04 | un AVIS **est illustré par zéro ou une** PHOTO                                     | STRU |
| -- | un nouvel AVIS **notifie le** BRASSEUR de la BIÈRE évaluée                         | ACTN |
| -- | le signalement d'un AVIS **le met en file de** modération                          | ACTN |
| -- | l'ajout ou suppression d'un AVIS **recalcule la** NOTE MOYENNE de la BIÈRE         | ACTN |
|    |                                                                                    |      |
| 05 | une BRASSERIE **est en FAVORI de zéro ou plusieurs** PERSONNE                      | STRU |
| 06 | une BRASSERIE **est représentée par zéro ou plusieurs** BRASSEUR                   | STRU |
| 11 | une BRASSERIE **brasse une ou plusieurs** BIÈRES                                   | STRU |
| 09 | une BRASSERIE **possède zéro ou plusieurs** POINTS DE VENTE                        | STRU |
| 10 | une BRASSERIE **se localise à zéro ou une** ADRESSE                                | STRU |
| 04 | une BRASSERIE **est illustrée par zéro ou plusieurs** PHOTOS                       | STRU |
| -- | la capacité de production d'une BRASSERIE **est** *strictement positive*           | CTRL |
|    |                                                                                    |      |
| 09 | un POINT DE VENTE **appartient à zéro ou une** BRASSERIE                           | STRU |
| 12 | un POINT DE VENTE **vend zéro ou plusieurs** BIÈRES                                | STRU |
| 13 | un POINT DE VENTE **se localise à zéro ou une** ADRESSE                            | STRU |
| -- | un POINT DE VENTE **a une ADRESSE et/ou vend en ligne**                            | CTRL |
| -- | un POINT DE VENTE avec ADRESSE **est un point physique** (`pdv_type` renseigné)    | CTRL |
|    |                                                                                    |      |
| 10 | une ADRESSE **localise zéro ou plusieurs** BRASSERIES                              | STRU |
| 13 | une ADRESSE **localise zéro ou plusieurs** POINTS DE VENTE                         | STRU |
|    |                                                                                    |      |
| 11 | une BIÈRE **est brassée par une seule** BRASSERIE                                  | STRU |
| 12 | une BIÈRE **est vendue dans zéro ou plusieurs** POINTS DE VENTE                    | STRU |
| 14 | une BIÈRE **est catégorisée dans une ou plusieurs** CATÉGORIE                      | STRU |
| 15 | une BIÈRE **est composée de plusieurs** INGRÉDIENTS                                | STRU |
| 08 | une BIÈRE **est évaluée par zéro ou plusieurs** AVIS                               | STRU |
| 05 | une BIÈRE **est en FAVORI de zéro ou plusieurs** PERSONNE                          | STRU |
| 04 | une BIÈRE **est illustrée par zéro ou plusieurs** PHOTOS                           | STRU |
| 03 | une BIÈRE **a zéro ou un** AVIS *par PERSONNE*                                     | CTRL |
| -- | une BIÈRE **est notée par l'ensemble de** ses AVIS                                 | CALC |
| -- | une BIÈRE **doit déclarer** ses INGRÉDIENTS                                        | CTRL |
| -- | le DEGRÉ d'alcool d'une BIÈRE **est compris entre** 0 et 100                       | CTRL |
| -- | une BIÈRE **a au moins une** CATÉGORIE et une BRASSERIE                            | CTRL |
|    |                                                                                    |      |
| 15 | un INGRÉDIENT **compose une ou plusieurs** BIÈRES                                  | STRU |
| -- | un INGRÉDIENT **peut être classé comme** ALLERGÈNE                                 | CTRL |
|    |                                                                                    |      |
| 14 | une CATÉGORIE **catégorise une ou plusieurs** BIÈRES                               | STRU |
|    |                                                                                    |      |
| 04 | une PHOTO **illustre une seule** PERSONNE / BRASSERIE / BIÈRE / AVIS               | STRU |
|    |                                                                                    |      |

---

La colonne **Type** indique la nature de chaque règle et détermine directement sa destination dans les modèles Merise.

| Acronyme | Type      | Décrit…                                                                    | Destination                               |
|----------|-----------|----------------------------------------------------------------------------|-------------------------------------------|
| `STRU`   | Structure | Existence des entités et liens entre elles                                 | MCD — entités, associations, cardinalités |
| `CALC`   | Calcul    | Donnée déduite ou calculée à partir d'autres                               | Traitements — donnée non stockée          |
| `CTRL`   | Contrôle  | Contrainte ou statut qui conditionne une donnée ou son comportement        | Contrainte CHECK ou garde dans MCT        |
| `ACTN`   | Action    | Réaction automatique déclenchée par un événement ou une action utilisateur | MCT — opérations, règles d'émission       |
