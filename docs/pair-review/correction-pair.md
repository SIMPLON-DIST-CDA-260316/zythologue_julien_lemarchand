# Correction par pair - Brief / Projet SQL & Docker

> par Julien Lemarchand

## Projet corrigé

Agathe — **Zythologue**, une base PostgreSQL pour un catalogue de bières
artisanales avec notation.

## Prise en main du projet

Le README est clair et bien rangé : prérequis, configuration du `.env`, ordre
d'exécution des scripts, et même une section qui explique les choix de
modélisation. On sait quoi faire en arrivant sur le repo.

Seule un détail qui m'aurait aidé : des liens directs depuis le README vers les
fichiers de `docs/`, pour naviguer entre les documents sans les chercher (pratique pour la navigation via github)

## Docker

`docker compose up -d` démarre PostgreSQL du premier coup, le service est bien là.
Rien à signaler de ce côté.

## PostgreSQL / DBeaver

Connexion DBeaver immédiate, et la base est bien initialisée une fois les scripts
passés. Les infos de connexion sont reprises dans le README, donc faciles à
retrouver.

## Fichiers SQL

Les trois scripts tournent. `01_create_schema.sql` crée bien toutes les tables,
`02_seed.sql` remplit la base avec un jeu de données réaliste, et les requêtes de
`03_queries.sql` répondent au cahier des charges. Deux ou trois détails relevés
au passage :

- La règle « ABV positif ou nul » est écrite dans les règles de gestion et le
  dictionnaire, mais je ne la retrouve pas en contrainte sur la table `beers`
  (alors que `rating`, lui, a bien son `CHECK`).
- La requête « brasseries produisant plus de cinq bières » filtre sur `>= 5`,
  donc elle attrape aussi celles qui en ont exactement cinq. L'intitulé dit
  « plus de cinq ». Sur le jeu de données actuel le résultat ne change pas, mais
  l'écart est là.

## Remarques générales

### Ce qui m'a plu

La doc est complète et tient debout : analyse du besoin, règles de gestion,
dictionnaire, schémas Merise, tout est là. Les choix de modélisation sont
assumés et expliqués plutôt que subis.

J'ai bien aimé l'astuce de l'`id` surrogate avec un `UNIQUE` sur la paire de FK
sur les tables d'association : c'est pensé pour la compat ORM, et c'est le genre
de détail que je ne connaissais pas.

### Ce sur quoi je m'interroge

Sur la relation Brasserie / Localisation, le MCD pose du 1,1 des deux côtés. Mais
en SQL la clé étrangère côté brasserie est nullable, et rien n'empêche deux
brasseries de pointer la même localisation. Du coup le modèle et l'implémentation
ne racontent pas tout à fait la même chose.

Même genre d'écart sur les tables d'association : le MLD et le MPD montrent une
clé primaire composite (les deux FK), alors qu'en SQL c'est un `id serial` qui
fait office de PK, la paire de FK étant rétrogradée en `UNIQUE`. Le choix est
expliqué dans le README, mais il n'est pas redescendu dans les schémas.

Le MCD mélange aussi français et anglais. Pas grave en soi, mais une seule langue
par document serait plus confortable à relire.

Dernier point, plus une réflexion qu'un reproche : une brasserie est rattachée à
une seule localisation. Si une même entreprise de brassage avait plusieurs sites,
le modèle aurait du mal à l'exprimer. Ça passe pour l'exercice, mais ça serait
sans doute à revoir sur un vrai projet.

### Pistes

- Remettre les schémas Merise (MCD / MLD / MPD) en phase avec le SQL livré, ou
  noter quelque part les écarts qui sont volontaires.
- Reporter en contraintes SQL les règles de gestion qui peuvent l'être.
