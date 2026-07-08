# Mocodo — fiche de syntaxe (MCD en texte)

> Apprendre à rédiger un `.mcd` à la main. Mocodo = texte → diagramme SVG + schéma relationnel (MLD/SQL).

## Liens officiels

- **Éditeur en ligne** (rendu live, zéro install) : <https://www.mocodo.net>
- **Dépôt + README** : <https://github.com/laowantong/mocodo>
- **Manuel de référence** (héritage, agrégation, CIF, options) : <https://rawgit.com/laowantong/mocodo/master/doc/fr_refman.html>
- **Aide-mémoire des transformations** : <https://github.com/laowantong/mocodo/blob/master/doc/fr_cheat_sheet.md>

---

## Installation & CLI

```bash
pip install mocodo

# rend model.mcd -> model.svg (le fichier source porte l'extension .mcd)
mocodo --input model

# generer aussi le relationnel (MLD) + le SQL
mocodo --input model --transform mld ddl

# couleurs et formes
mocodo -i model --colors desert --shapes copperplate

# convertir la notation : Chen, crow's foot (patte d'oie), UML
mocodo -i model -t chen
mocodo -i model -t crow
```

Options utiles : `--input/-i` (source), `--transform/-t` (mld, ddl, chen, crow, arrange…), `--colors`, `--shapes`, `--defer` (rendu web).
`mocodo --help` liste tout.

---

## 1. Entité

```
NOM_ENTITE: identifiant, attribut2, attribut3
```

- **1er attribut = identifiant** (souligné automatiquement).
- Types optionnels entre crochets (servent au MLD/SQL, pas obligatoires en MCD pur) :

```
CLIENT: ref_client [VARCHAR(8)], nom [VARCHAR(255)], prenom [VARCHAR(255)]
```

## 2. Association binaire

```
NOM_ASSOC, <card> ENTITE_A, <card> ENTITE_B
```

```
PASSER, 0N CLIENT, 11 COMMANDE
```

Cardinalités : `01` (0,1) · `0N` (0,n) · `11` (1,1) · `1N` (1,n).

## 3. Association porteuse d'attributs

Attributs après le `:` → portés par l'association (pas par une entité).

```
INCLURE, 1N COMMANDE, 0N PRODUIT: quantite [INTEGER]
```

## 4. Association n-aire (ternaire+)

Lister plus de deux pattes :

```
RESERVER, 0N CLIENT, 0N CHAMBRE, 0N DATE: nb_personnes
```

## 5. Entité faible / identification relative

Préfixe `_` sur la cardinalité `11` du côté faible → l'entité est identifiée **relativement** à l'autre (identifiant = sien + celui du parent).

```
POSSEDER, _11 EXEMPLAIRE, 1N OUVRAGE
```

Dans le rendu : l'identifiant de l'entité faible est souligné en **pointillés**, le `(1,1)` souligné d'un **trait plein**.

## 6. Cardinalité orientée (chevron)

Suffixe `<` ou `>` pour orienter la lecture (de l'association vers l'entité) :

```
SUIVRE, 0N> PERSONNE, 0N PERSONNE
```

## 7. Héritage / spécialisation

> ⚠️ Notation avancée — **vérifie sur [mocodo.net](https://www.mocodo.net) ou le [manuel](https://rawgit.com/laowantong/mocodo/master/doc/fr_refman.html)**. Forme générale (Mocodo 3+) : une clause encadrée par `/ \` avec les contraintes.

```
/XT\, PERSONNE, ENSEIGNANT, ETUDIANT
```

- 1ère entité = **mère (générique)**, les suivantes = **filles (spécialisées)**.
- Contraintes entre `/ \` : `T` = totalité, `X` = exclusivité, `XT` = partition.

## 8. Mise en page (grille)

Mocodo place les boîtes selon la **disposition du texte** :

- Chaque **ligne** de source = une rangée de la grille.
- Une ligne `:` seule = **boîte vide** (espace pour aérer / aligner).
- `mocodo -t arrange` recalcule un placement automatique optimal.

```
CLIENT: ref, nom
PASSER, 0N CLIENT, 11 COMMANDE
:
COMMANDE: num, date
```

## 9. Commentaires

```
%% ceci est un commentaire, ignore au rendu
```

---

## Exemple appliqué — extrait Zythologue

```
%% MCD Zythologue (extrait)
CATEGORIE: cat_id, cat_libelle, cat_description
Appartenir, 1N BIERE, 1N CATEGORIE
BIERE: bie_id, bie_nom, bie_degre_alcool, bie_statut, bie_date_creation
Composer, 1N BIERE, 1N INGREDIENT
INGREDIENT: ing_id, ing_nom, ing_est_allergene

Brasser, 11 BIERE, 1N BRASSERIE
BRASSERIE: bra_id, bra_annee_creation, bra_type_prod

Evaluer, 11 AVIS, 0N BIERE
AVIS: avi_id, avi_note, avi_commentaire, avi_date
Rediger, 0N PERSONNE, 11 AVIS
PERSONNE: per_id, per_email, per_nom, per_prenom, per_role
```

Rendu : `mocodo --input mcd_zythologue` → SVG.
MLD : `mocodo --input mcd_zythologue --transform mld ddl` → schéma relationnel + SQL.

---

## Règle de lecture des cardinalités (rappel Merise)

Pour `PASSER, 0N CLIENT, 11 COMMANDE` :

- un CLIENT passe **0 à n** COMMANDE,
- une COMMANDE est passée par **1 et 1 seul** CLIENT.

La cardinalité écrite à côté d'une entité = participation **de cette entité** à l'association.
