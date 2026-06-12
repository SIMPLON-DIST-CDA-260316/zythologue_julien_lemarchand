-- Active: 1781204680165@@127.0.0.1@5432@zythologue
-- Requêtes SQL.
--
--
--  Lister les bières par taux d 'alcool croissant
SELECT *
FROM beer
ORDER BY beer.alcohol_content ASC;
--
-- Afficher le nombre de bières par catégorie ou style
SELECT COUNT(b.id) as beer_count,
    c.name
FROM category c
    LEFT JOIN categorization cat ON c.id = cat.category_id
    LEFT JOIN beer b ON cat.beer_id = b.id
GROUP BY c.id,
    c.name
ORDER BY beer_count DESC;
--
-- Trouver toutes les bières d 'une brasserie donnée
SELECT *
FROM beer
WHERE beer.brewery_id = 1;
--
-- Lister les utilisateurs et le nombre de bières ajoutées à leurs favoris 
SELECT a.id,
    a.first_name,
    a.last_name,
    COUNT(fb.beer_id) as favorite_beer_count
FROM account a
    LEFT JOIN favorite_beer fb ON fb.account_id = a.id
GROUP BY a.id,
    a.first_name,
    a.last_name;
--
-- Ajouter une nouvelle bière à la base de données
INSERT INTO beer (name, alcohol_content, brewery_id) VALUES ('La Chouffe', 8.0, 1);
--
-- Afficher les bières avec leur brasserie, triées par pays
SELECT b.name AS beer_name,
    br.name AS brewery_name,
    addr.country
FROM beer b
    JOIN brewery br ON b.brewery_id = br.id
    LEFT JOIN address addr ON br.address_id = addr.id
ORDER BY addr.country ASC;
--
-- Lister les bières avec leurs ingrédients
SELECT b.name AS beer_name,
    i.name AS ingredient_name,
    i.is_allergen
FROM beer b
    JOIN composition comp ON comp.beer_id = b.id
    JOIN ingredient i ON i.id = comp.ingredient_id
ORDER BY b.name,
    i.name;
--
-- Afficher les brasseries produisant plus de cinq bières
SELECT br.name AS brewery_name,
    COUNT(b.id) AS beer_count
FROM brewery br
    JOIN beer b ON b.brewery_id = br.id
GROUP BY br.id,
    br.name
HAVING COUNT(b.id) > 5
ORDER BY beer_count DESC;
--
-- Lister les bières qui ne figurent dans aucun favori
SELECT b.name
FROM beer b
    LEFT JOIN favorite_beer fb ON fb.beer_id = b.id
WHERE fb.beer_id IS NULL
ORDER BY b.name;
--
-- Trouver les bières favorites communes entre deux utilisateurs
--
-- Afficher les brasseries dont les bières ont une moyenne de notes supérieure à une valeur donnée
--
-- Mettre à jour les informations d'une brasserie
UPDATE brewery
SET phone = '+33 3 20 00 00 00',
    website = 'https://nouvelle-url.fr'
WHERE id = 1;
--
-- Supprimer les photos d'une bière donnée
DELETE FROM photo
WHERE id IN (
        SELECT photo_id
        FROM illustration_beer
        WHERE beer_id = 1
    );
