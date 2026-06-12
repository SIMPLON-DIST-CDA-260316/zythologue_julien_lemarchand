-- Active: 1781204680165@@127.0.0.1@5432@zythologue
-- Zythologue — données de seed (générées par Claude)
BEGIN;
-- =====================================================================
--  Tables de référence
-- =====================================================================
INSERT INTO address (number, street, zip_code, city, country)
VALUES (
    '12',
    'Rue des Brasseurs',
    '59800',
    'Lille',
    'France'
  ),
  (
    '5',
    'Quai du Wault',
    '59000',
    'Lille',
    'France'
  ),
  (
    '230',
    'Avenue de Dunkerque',
    '59160',
    'Lomme',
    'France'
  ),
  (
    '1',
    'Grand-Place',
    '59100',
    'Roubaix',
    'France'
  ),
  (
    '44 bis',
    'Rue Nationale',
    '59800',
    'Lille',
    'France'
  ),
  (
    '8',
    'Place du Théâtre',
    '59000',
    'Lille',
    'France'
  );
INSERT INTO photo (url, caption)
VALUES (
    'https://cdn.zytho.test/breweries/celestins.jpg',
    'Salle de brassage des Célestins'
  ),
  (
    'https://cdn.zytho.test/breweries/hopfield.jpg',
    'Façade Hopfield'
  ),
  (
    'https://cdn.zytho.test/beers/blonde-nord.jpg',
    'Blonde du Nord'
  ),
  (
    'https://cdn.zytho.test/beers/triple-flandre.jpg',
    'Triple de Flandre'
  ),
  (
    'https://cdn.zytho.test/beers/ipa-houblon.jpg',
    'IPA Houblon Sauvage'
  ),
  (
    'https://cdn.zytho.test/beers/stout-minuit.jpg',
    'Stout Minuit'
  ),
  (
    'https://cdn.zytho.test/avatars/marie.jpg',
    'Avatar de Marie'
  ),
  (
    'https://cdn.zytho.test/reviews/degustation.jpg',
    'Dégustation entre amis'
  );
INSERT INTO category (name, description)
VALUES (
    'Blonde',
    'Bière de fermentation basse ou haute, robe dorée, amertume modérée.'
  ),
  (
    'Ambrée',
    'Robe cuivrée, notes maltées et caramélisées.'
  ),
  (
    'IPA',
    'India Pale Ale, fortement houblonnée, amertume marquée.'
  ),
  (
    'Stout',
    'Bière noire, notes torréfiées de café et chocolat.'
  ),
  (
    'Pilsner',
    'Lager houblonnée de style tchèque/allemand.'
  ),
  (
    'Triple',
    'Bière belge forte, riche et fruitée.'
  );
INSERT INTO ingredient (name, is_allergen)
VALUES ('Eau', false),
  ('Malt d''orge', true),
  -- gluten
  ('Froment', true),
  -- gluten
  ('Avoine', true),
  -- gluten
  ('Houblon', false),
  ('Levure', false),
  ('Sucre candi', false),
  ('Coriandre', false);
-- =====================================================================
--  Comptes (1 admin, 2 brasseurs, 3 clients)
--  Mot de passe = hash bcrypt factice (même valeur partout pour le seed).
-- =====================================================================
INSERT INTO account (
    email,
    last_name,
    first_name,
    password,
    role,
    photo_id
  )
VALUES (
    'admin@zytho.test',
    'Durand',
    'Sophie',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'admin',
    NULL
  ),
  (
    'brasseur1@zytho.test',
    'Lefebvre',
    'Antoine',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'brewer',
    NULL
  ),
  (
    'brasseur2@zytho.test',
    'Moreau',
    'Camille',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'brewer',
    NULL
  ),
  (
    'marie@zytho.test',
    'Petit',
    'Marie',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'customer',
    (
      SELECT id
      FROM photo
      WHERE caption = 'Avatar de Marie'
    )
  ),
  (
    'lucas@zytho.test',
    'Bernard',
    'Lucas',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'customer',
    NULL
  ),
  (
    'nadia@zytho.test',
    'Garcia',
    'Nadia',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'customer',
    NULL
  );
-- =====================================================================
--  Brasseries
-- =====================================================================
INSERT INTO brewery (
    name,
    description,
    founding_year,
    production_capacity,
    production_type,
    phone,
    website,
    address_id
  )
VALUES (
    'Brasserie des Célestins',
    'Microbrasserie artisanale au cœur de Lille.',
    2014,
    1200,
    'microbrewery',
    '+33320111213',
    'https://celestins.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Rue des Brasseurs'
        AND city = 'Lille'
    )
  ),
  (
    'Hopfield Brewing',
    'Brasserie artisanale spécialisée IPA et houblons.',
    2018,
    3500,
    'craft',
    '+33320445566',
    'https://hopfield.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Avenue de Dunkerque'
    )
  ),
  (
    'Grandes Cuves du Nord',
    'Production industrielle de lagers.',
    1999,
    90000,
    'industrial',
    '+33320778899',
    'https://gcn.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Quai du Wault'
    )
  );
-- Photos d'illustration des brasseries
INSERT INTO illustration_brewery (brewery_id, photo_id)
VALUES (
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brasserie des Célestins'
    ),
    (
      SELECT id
      FROM photo
      WHERE caption = 'Salle de brassage des Célestins'
    )
  ),
  (
    (
      SELECT id
      FROM brewery
      WHERE name = 'Hopfield Brewing'
    ),
    (
      SELECT id
      FROM photo
      WHERE caption = 'Façade Hopfield'
    )
  );
-- =====================================================================
--  Bières (2 par brasserie)
-- =====================================================================
INSERT INTO beer (name, description, alcohol_content, brewery_id)
VALUES (
    'Blonde du Nord',
    'Blonde légère et désaltérante.',
    5.20,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brasserie des Célestins'
    )
  ),
  (
    'Triple de Flandre',
    'Triple belge généreuse et fruitée.',
    8.50,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brasserie des Célestins'
    )
  ),
  (
    'IPA Houblon Sauvage',
    'IPA résineuse aux agrumes.',
    6.50,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Hopfield Brewing'
    )
  ),
  (
    'Stout Minuit',
    'Stout torréfié, café et chocolat noir.',
    7.00,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Hopfield Brewing'
    )
  ),
  (
    'Pils Cristal',
    'Pilsner industrielle légère.',
    4.60,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Grandes Cuves du Nord'
    )
  ),
  (
    'Ambrée Beffroi',
    'Ambrée maltée aux notes caramel.',
    6.00,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Grandes Cuves du Nord'
    )
  );
-- Catégorisation (au moins une catégorie par bière)
INSERT INTO categorization (beer_id, category_id)
VALUES (
    (
      SELECT id
      FROM beer
      WHERE name = 'Blonde du Nord'
    ),
    (
      SELECT id
      FROM category
      WHERE name = 'Blonde'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Triple de Flandre'
    ),
    (
      SELECT id
      FROM category
      WHERE name = 'Triple'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Triple de Flandre'
    ),
    (
      SELECT id
      FROM category
      WHERE name = 'Blonde'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'IPA Houblon Sauvage'
    ),
    (
      SELECT id
      FROM category
      WHERE name = 'IPA'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Stout Minuit'
    ),
    (
      SELECT id
      FROM category
      WHERE name = 'Stout'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Pils Cristal'
    ),
    (
      SELECT id
      FROM category
      WHERE name = 'Pilsner'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Ambrée Beffroi'
    ),
    (
      SELECT id
      FROM category
      WHERE name = 'Ambrée'
    )
  );
-- Composition (ingrédients par bière — base eau/malt/houblon/levure + spécifiques)
INSERT INTO composition (beer_id, ingredient_id)
SELECT b.id,
  i.id
FROM beer b
  JOIN ingredient i ON i.name IN ('Eau', 'Malt d''orge', 'Houblon', 'Levure')
WHERE b.name IN (
    'Blonde du Nord',
    'Triple de Flandre',
    'IPA Houblon Sauvage',
    'Stout Minuit',
    'Pils Cristal',
    'Ambrée Beffroi'
  );
INSERT INTO composition (beer_id, ingredient_id)
VALUES (
    (
      SELECT id
      FROM beer
      WHERE name = 'Triple de Flandre'
    ),
    (
      SELECT id
      FROM ingredient
      WHERE name = 'Sucre candi'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Triple de Flandre'
    ),
    (
      SELECT id
      FROM ingredient
      WHERE name = 'Coriandre'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Stout Minuit'
    ),
    (
      SELECT id
      FROM ingredient
      WHERE name = 'Avoine'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Blonde du Nord'
    ),
    (
      SELECT id
      FROM ingredient
      WHERE name = 'Froment'
    )
  );
-- Photos d'illustration des bières
INSERT INTO illustration_beer (beer_id, photo_id)
VALUES (
    (
      SELECT id
      FROM beer
      WHERE name = 'Blonde du Nord'
    ),
    (
      SELECT id
      FROM photo
      WHERE caption = 'Blonde du Nord'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Triple de Flandre'
    ),
    (
      SELECT id
      FROM photo
      WHERE caption = 'Triple de Flandre'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'IPA Houblon Sauvage'
    ),
    (
      SELECT id
      FROM photo
      WHERE caption = 'IPA Houblon Sauvage'
    )
  ),
  (
    (
      SELECT id
      FROM beer
      WHERE name = 'Stout Minuit'
    ),
    (
      SELECT id
      FROM photo
      WHERE caption = 'Stout Minuit'
    )
  );
-- =====================================================================
--  Points de vente
--  Physiques → adresse renseignée ; en ligne pur → adresse NULL + online_sales
-- =====================================================================
INSERT INTO outlet (
    name,
    type,
    online_sales,
    phone,
    website,
    address_id,
    brewery_id
  )
VALUES (
    'Cave des Célestins',
    'cellar',
    true,
    '+33320111213',
    'https://shop.celestins.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Rue des Brasseurs'
        AND city = 'Lille'
    ),
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brasserie des Célestins'
    )
  ),
  (
    'Le Houblon Bar',
    'bar',
    false,
    '+33320223344',
    NULL,
    (
      SELECT id
      FROM address
      WHERE street = 'Rue Nationale'
    ),
    NULL
  ),
  (
    'Resto La Cuve',
    'restaurant',
    false,
    '+33320556677',
    NULL,
    (
      SELECT id
      FROM address
      WHERE street = 'Place du Théâtre'
    ),
    NULL
  ),
  (
    'BièreEnLigne',
    NULL,
    true,
    NULL,
    'https://biereenligne.test',
    NULL,
    NULL
  );
-- vente en ligne pure : pas d'adresse (CHECK satisfait par online_sales)
-- =====================================================================
--  Ventes (prix dépend du couple point de vente × bière)
-- =====================================================================
INSERT INTO sale (outlet_id, beer_id, price)
VALUES (
    (
      SELECT id
      FROM outlet
      WHERE name = 'Cave des Célestins'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'Blonde du Nord'
    ),
    3.20
  ),
  (
    (
      SELECT id
      FROM outlet
      WHERE name = 'Cave des Célestins'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'Triple de Flandre'
    ),
    4.90
  ),
  (
    (
      SELECT id
      FROM outlet
      WHERE name = 'Le Houblon Bar'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'IPA Houblon Sauvage'
    ),
    6.50
  ),
  (
    (
      SELECT id
      FROM outlet
      WHERE name = 'Le Houblon Bar'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'Blonde du Nord'
    ),
    5.00
  ),
  (
    (
      SELECT id
      FROM outlet
      WHERE name = 'Resto La Cuve'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'Stout Minuit'
    ),
    7.20
  ),
  (
    (
      SELECT id
      FROM outlet
      WHERE name = 'BièreEnLigne'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'IPA Houblon Sauvage'
    ),
    5.80
  ),
  (
    (
      SELECT id
      FROM outlet
      WHERE name = 'BièreEnLigne'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'Pils Cristal'
    ),
    2.40
  );
-- =====================================================================
--  Avis (UNIQUE par compte × bière ; note 1..5)
-- =====================================================================
INSERT INTO review (
    rating,
    comment,
    reported,
    reply,
    beer_id,
    photo_id,
    account_id
  )
VALUES (
    5,
    'Parfaitement équilibrée, ma préférée !',
    false,
    'Merci Marie, ravi qu''elle vous plaise !',
    (
      SELECT id
      FROM beer
      WHERE name = 'Blonde du Nord'
    ),
    (
      SELECT id
      FROM photo
      WHERE caption = 'Dégustation entre amis'
    ),
    (
      SELECT id
      FROM account
      WHERE email = 'marie@zytho.test'
    )
  ),
  (
    4,
    'Très bonne triple, un peu forte pour moi.',
    false,
    NULL,
    (
      SELECT id
      FROM beer
      WHERE name = 'Triple de Flandre'
    ),
    NULL,
    (
      SELECT id
      FROM account
      WHERE email = 'marie@zytho.test'
    )
  ),
  (
    5,
    'IPA au top, bien amère comme il faut.',
    false,
    NULL,
    (
      SELECT id
      FROM beer
      WHERE name = 'IPA Houblon Sauvage'
    ),
    NULL,
    (
      SELECT id
      FROM account
      WHERE email = 'lucas@zytho.test'
    )
  ),
  (
    2,
    'Trop fade à mon goût.',
    true,
    NULL,
    (
      SELECT id
      FROM beer
      WHERE name = 'Pils Cristal'
    ),
    NULL,
    (
      SELECT id
      FROM account
      WHERE email = 'lucas@zytho.test'
    )
  ),
  (
    4,
    'Le stout est riche et rond.',
    false,
    NULL,
    (
      SELECT id
      FROM beer
      WHERE name = 'Stout Minuit'
    ),
    NULL,
    (
      SELECT id
      FROM account
      WHERE email = 'nadia@zytho.test'
    )
  );
-- =====================================================================
--  Favoris
-- =====================================================================
INSERT INTO favorite_beer (account_id, beer_id)
VALUES (
    (
      SELECT id
      FROM account
      WHERE email = 'marie@zytho.test'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'Blonde du Nord'
    )
  ),
  (
    (
      SELECT id
      FROM account
      WHERE email = 'lucas@zytho.test'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'IPA Houblon Sauvage'
    )
  ),
  (
    (
      SELECT id
      FROM account
      WHERE email = 'nadia@zytho.test'
    ),
    (
      SELECT id
      FROM beer
      WHERE name = 'Stout Minuit'
    )
  );
INSERT INTO favorite_brewery (account_id, brewery_id)
VALUES (
    (
      SELECT id
      FROM account
      WHERE email = 'marie@zytho.test'
    ),
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brasserie des Célestins'
    )
  ),
  (
    (
      SELECT id
      FROM account
      WHERE email = 'lucas@zytho.test'
    ),
    (
      SELECT id
      FROM brewery
      WHERE name = 'Hopfield Brewing'
    )
  );
-- =====================================================================
--  EXTENSION — Brasseries étrangères (hors France) et données liées
-- =====================================================================
--  Adresses étrangères
-- ---------------------------------------------------------------------
INSERT INTO address (number, street, zip_code, city, country)
VALUES (
    '12',
    'Langestraat',
    '8000',
    'Brugge',
    'Belgique'
  ),
  (
    '7',
    'Hopfenstraße',
    '80331',
    'München',
    'Allemagne'
  ),
  (
    '3',
    'Riverside',
    'S3 8EN',
    'Sheffield',
    'Royaume-Uni'
  ),
  (
    '64',
    'U Prazdroje',
    '30100',
    'Plzeň',
    'Tchéquie'
  ),
  (
    '1420',
    'Alder Street',
    '97205',
    'Portland',
    'États-Unis'
  ),
  ('5', 'Markt', '8000', 'Brugge', 'Belgique'),
  (
    '88',
    'Hauptstraße',
    '10115',
    'Berlin',
    'Allemagne'
  );
-- ---------------------------------------------------------------------
--  Catégories supplémentaires
-- ---------------------------------------------------------------------
INSERT INTO category (name, description)
VALUES (
    'Weizen',
    'Bière de blé allemande, trouble, notes de banane et clou de girofle.'
  ),
  (
    'Lager',
    'Fermentation basse, robe claire, profil net et désaltérant.'
  ),
  (
    'Porter',
    'Bière brune anglaise, malts torréfiés, notes chocolat et caramel.'
  ),
  (
    'Pale Ale',
    'Ale houblonnée d''amertume modérée, robe ambrée à dorée.'
  ),
  (
    'Bock',
    'Lager forte allemande, maltée et ronde.'
  ),
  (
    'Dubbel',
    'Brune belge d''abbaye, fruits secs et caramel.'
  ),
  (
    'Quadrupel',
    'Belge très forte, riche, notes de fruits confits.'
  );
-- ---------------------------------------------------------------------
--  Ingrédients supplémentaires
-- ---------------------------------------------------------------------
INSERT INTO ingredient (name, is_allergen)
VALUES ('Malt de blé', true),
  -- gluten
  ('Malt caramel', true),
  -- gluten
  ('Malt torréfié', true),
  -- gluten
  ('Houblon Saaz', false),
  ('Houblon Cascade', false);
-- ---------------------------------------------------------------------
--  Comptes supplémentaires (clients étrangers)
-- ---------------------------------------------------------------------
INSERT INTO account (
    email,
    last_name,
    first_name,
    password,
    role,
    photo_id
  )
VALUES (
    'thomas@zytho.test',
    'Bauer',
    'Thomas',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'customer',
    NULL
  ),
  (
    'eva@zytho.test',
    'Novak',
    'Eva',
    '$2b$10$seedseedseedseedseedseO0pVxJ3y9Qz8wq5h6tK0aB1cD2eF3g',
    'customer',
    NULL
  );
-- ---------------------------------------------------------------------
--  Brasseries étrangères
-- ---------------------------------------------------------------------
INSERT INTO brewery (
    name,
    description,
    founding_year,
    production_capacity,
    production_type,
    phone,
    website,
    address_id
  )
VALUES (
    'Brouwerij Saint-Sang',
    'Brasserie d''abbaye à Bruges, spécialiste des brunes belges.',
    1947,
    25000,
    'craft',
    '+3250334455',
    'https://saint-sang.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Langestraat'
        AND city = 'Brugge'
    )
  ),
  (
    'Bayerische Hopfen Bräu',
    'Brasserie munichoise traditionnelle, Helles et Weizen.',
    1888,
    120000,
    'industrial',
    '+498921001',
    'https://hopfenbraeu.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Hopfenstraße'
    )
  ),
  (
    'Thornbridge Yard',
    'Brasserie artisanale anglaise du Yorkshire.',
    2005,
    40000,
    'craft',
    '+441142701',
    'https://thornbridge-yard.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Riverside'
        AND city = 'Sheffield'
    )
  ),
  (
    'Zlatý Chmel',
    'Brasserie tchèque historique de Plzeň, berceau de la pilsner.',
    1842,
    250000,
    'industrial',
    '+420377061111',
    'https://zlatychmel.test',
    (
      SELECT id
      FROM address
      WHERE street = 'U Prazdroje'
    )
  ),
  (
    'Redwood Craft Co.',
    'Microbrasserie de Portland, IPA West Coast et stouts impériaux.',
    2012,
    8000,
    'microbrewery',
    '+15032220199',
    'https://redwoodcraft.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Alder Street'
    )
  );
-- ---------------------------------------------------------------------
--  Bières étrangères (2 par brasserie)
-- ---------------------------------------------------------------------
INSERT INTO beer (name, description, alcohol_content, brewery_id)
VALUES (
    'Sang Dubbel',
    'Brune d''abbaye, fruits secs et caramel.',
    7.00,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brouwerij Saint-Sang'
    )
  ),
  (
    'Sang Quadrupel',
    'Belge très forte, fruits confits et épices.',
    10.50,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brouwerij Saint-Sang'
    )
  ),
  (
    'Münchner Helles',
    'Lager munichoise claire, maltée et douce.',
    4.90,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Bayerische Hopfen Bräu'
    )
  ),
  (
    'Weiss Engel',
    'Bière de blé, notes de banane et girofle.',
    5.40,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Bayerische Hopfen Bräu'
    )
  ),
  (
    'Yorkshire Pale',
    'Pale ale anglaise équilibrée, légèrement fruitée.',
    4.20,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Thornbridge Yard'
    )
  ),
  (
    'Black Sheffield Porter',
    'Porter anglais, chocolat et café torréfié.',
    5.80,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Thornbridge Yard'
    )
  ),
  (
    'Plzeň Zlatá',
    'Pilsner tchèque dorée, houblon Saaz floral.',
    4.40,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Zlatý Chmel'
    )
  ),
  (
    'Tmavý Bock',
    'Bock brune tchèque, maltée et ronde.',
    6.80,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Zlatý Chmel'
    )
  ),
  (
    'West Coast Reaper IPA',
    'IPA américaine résineuse, agrumes et pin.',
    7.20,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Redwood Craft Co.'
    )
  ),
  (
    'Imperial Night Stout',
    'Stout impérial, café noir et chocolat amer.',
    9.50,
    (
      SELECT id
      FROM brewery
      WHERE name = 'Redwood Craft Co.'
    )
  );
-- ---------------------------------------------------------------------
--  Catégorisation des bières étrangères
-- ---------------------------------------------------------------------
INSERT INTO categorization (beer_id, category_id)
SELECT b.id,
  c.id
FROM (
    VALUES ('Sang Dubbel', 'Dubbel'),
      ('Sang Dubbel', 'Ambrée'),
      ('Sang Quadrupel', 'Quadrupel'),
      ('Münchner Helles', 'Lager'),
      ('Münchner Helles', 'Blonde'),
      ('Weiss Engel', 'Weizen'),
      ('Yorkshire Pale', 'Pale Ale'),
      ('Black Sheffield Porter', 'Porter'),
      ('Black Sheffield Porter', 'Stout'),
      ('Plzeň Zlatá', 'Pilsner'),
      ('Plzeň Zlatá', 'Lager'),
      ('Tmavý Bock', 'Bock'),
      ('Tmavý Bock', 'Ambrée'),
      ('West Coast Reaper IPA', 'IPA'),
      ('West Coast Reaper IPA', 'Pale Ale'),
      ('Imperial Night Stout', 'Stout'),
      ('Imperial Night Stout', 'Porter')
  ) AS m (beer_name, category_name)
  JOIN beer b ON b.name = m.beer_name
  JOIN category c ON c.name = m.category_name;
-- ---------------------------------------------------------------------
--  Composition — base eau/malt/houblon/levure pour les bières étrangères
-- ---------------------------------------------------------------------
INSERT INTO composition (beer_id, ingredient_id)
SELECT b.id,
  i.id
FROM beer b
  JOIN ingredient i ON i.name IN ('Eau', 'Malt d''orge', 'Houblon', 'Levure')
WHERE b.name IN (
    'Sang Dubbel',
    'Sang Quadrupel',
    'Münchner Helles',
    'Weiss Engel',
    'Yorkshire Pale',
    'Black Sheffield Porter',
    'Plzeň Zlatá',
    'Tmavý Bock',
    'West Coast Reaper IPA',
    'Imperial Night Stout'
  );
-- Ingrédients spécifiques
INSERT INTO composition (beer_id, ingredient_id)
SELECT b.id,
  i.id
FROM (
    VALUES ('Sang Dubbel', 'Sucre candi'),
      ('Sang Dubbel', 'Malt caramel'),
      ('Sang Quadrupel', 'Sucre candi'),
      ('Sang Quadrupel', 'Malt caramel'),
      ('Weiss Engel', 'Malt de blé'),
      ('Weiss Engel', 'Froment'),
      ('Münchner Helles', 'Houblon Saaz'),
      ('Yorkshire Pale', 'Houblon Cascade'),
      ('Black Sheffield Porter', 'Malt torréfié'),
      ('Black Sheffield Porter', 'Avoine'),
      ('Plzeň Zlatá', 'Houblon Saaz'),
      ('Tmavý Bock', 'Malt caramel'),
      ('West Coast Reaper IPA', 'Houblon Cascade'),
      ('Imperial Night Stout', 'Malt torréfié'),
      ('Imperial Night Stout', 'Avoine')
  ) AS m (beer_name, ingredient_name)
  JOIN beer b ON b.name = m.beer_name
  JOIN ingredient i ON i.name = m.ingredient_name;
-- ---------------------------------------------------------------------
--  Points de vente étrangers
-- ---------------------------------------------------------------------
INSERT INTO outlet (
    name,
    type,
    online_sales,
    phone,
    website,
    address_id,
    brewery_id
  )
VALUES (
    'Saint-Sang Taproom',
    'bar',
    false,
    '+3250334456',
    NULL,
    (
      SELECT id
      FROM address
      WHERE street = 'Markt'
        AND city = 'Brugge'
    ),
    (
      SELECT id
      FROM brewery
      WHERE name = 'Brouwerij Saint-Sang'
    )
  ),
  (
    'Bräuhaus München',
    'restaurant',
    false,
    '+498921002',
    'https://braeuhaus-muenchen.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Hopfenstraße'
    ),
    (
      SELECT id
      FROM brewery
      WHERE name = 'Bayerische Hopfen Bräu'
    )
  ),
  (
    'EuroBeer Market',
    'supermarket',
    true,
    NULL,
    'https://eurobeer.test',
    (
      SELECT id
      FROM address
      WHERE street = 'Hauptstraße'
        AND city = 'Berlin'
    ),
    NULL
  ),
  (
    'CraftBeer.eu',
    NULL,
    true,
    NULL,
    'https://craftbeer.eu.test',
    NULL,
    NULL
  );
-- ---------------------------------------------------------------------
--  Ventes (point de vente × bière)
-- ---------------------------------------------------------------------
INSERT INTO sale (outlet_id, beer_id, price)
SELECT o.id,
  b.id,
  v.price
FROM (
    VALUES ('Saint-Sang Taproom', 'Sang Dubbel', 4.80),
      ('Saint-Sang Taproom', 'Sang Quadrupel', 6.50),
      ('Bräuhaus München', 'Münchner Helles', 3.90),
      ('Bräuhaus München', 'Weiss Engel', 4.20),
      ('EuroBeer Market', 'Plzeň Zlatá', 1.95),
      ('EuroBeer Market', 'Münchner Helles', 2.10),
      ('EuroBeer Market', 'Yorkshire Pale', 2.60),
      ('CraftBeer.eu', 'West Coast Reaper IPA', 6.90),
      ('CraftBeer.eu', 'Imperial Night Stout', 8.50),
      ('CraftBeer.eu', 'Sang Quadrupel', 7.20),
      ('CraftBeer.eu', 'Black Sheffield Porter', 5.40),
      ('CraftBeer.eu', 'Tmavý Bock', 5.10)
  ) AS v (outlet_name, beer_name, price)
  JOIN outlet o ON o.name = v.outlet_name
  JOIN beer b ON b.name = v.beer_name;
-- ---------------------------------------------------------------------
--  Avis sur les bières étrangères (UNIQUE compte × bière)
-- ---------------------------------------------------------------------
INSERT INTO review (
    rating,
    comment,
    reported,
    reply,
    beer_id,
    photo_id,
    account_id
  )
SELECT v.rating,
  v.comment,
  false,
  NULL,
  b.id,
  NULL,
  a.id
FROM (
    VALUES (
        5,
        'Quadrupel exceptionnelle, à siroter doucement.',
        'eva@zytho.test',
        'Sang Quadrupel'
      ),
      (
        4,
        'Belle dubbel, caramel bien présent.',
        'thomas@zytho.test',
        'Sang Dubbel'
      ),
      (
        5,
        'La Helles parfaite après le boulot.',
        'thomas@zytho.test',
        'Münchner Helles'
      ),
      (
        4,
        'Weizen rafraîchissante, banane subtile.',
        'marie@zytho.test',
        'Weiss Engel'
      ),
      (
        5,
        'Pilsner de référence, nette et florale.',
        'lucas@zytho.test',
        'Plzeň Zlatá'
      ),
      (
        5,
        'IPA West Coast brutale, j''adore.',
        'lucas@zytho.test',
        'West Coast Reaper IPA'
      ),
      (
        4,
        'Stout impérial puissant mais équilibré.',
        'nadia@zytho.test',
        'Imperial Night Stout'
      ),
      (
        3,
        'Porter correct, manque un peu de corps.',
        'eva@zytho.test',
        'Black Sheffield Porter'
      )
  ) AS v (rating, comment, email, beer_name)
  JOIN account a ON a.email = v.email
  JOIN beer b ON b.name = v.beer_name;
-- ---------------------------------------------------------------------
--  Favoris sur les bières / brasseries étrangères
-- ---------------------------------------------------------------------
INSERT INTO favorite_beer (account_id, beer_id)
SELECT a.id,
  b.id
FROM (
    VALUES ('eva@zytho.test', 'Sang Quadrupel'),
      ('thomas@zytho.test', 'Münchner Helles'),
      ('lucas@zytho.test', 'West Coast Reaper IPA'),
      ('marie@zytho.test', 'Weiss Engel')
  ) AS v (email, beer_name)
  JOIN account a ON a.email = v.email
  JOIN beer b ON b.name = v.beer_name;
INSERT INTO favorite_brewery (account_id, brewery_id)
SELECT a.id,
  br.id
FROM (
    VALUES ('eva@zytho.test', 'Brouwerij Saint-Sang'),
      ('thomas@zytho.test', 'Bayerische Hopfen Bräu'),
      ('nadia@zytho.test', 'Redwood Craft Co.')
  ) AS v (email, brewery_name)
  JOIN account a ON a.email = v.email
  JOIN brewery br ON br.name = v.brewery_name;
-- =====================================================================
--  COUVERTURE REQUÊTES — cas limites à exercer
-- =====================================================================
--  1) Une brasserie produisant plus de cinq bières
--     (Brasserie des Célestins passe de 2 à 6 bières)
-- ---------------------------------------------------------------------
INSERT INTO beer (name, description, alcohol_content, brewery_id)
SELECT v.name,
  v.description,
  v.alcohol_content,
  (
    SELECT id
    FROM brewery
    WHERE name = 'Brasserie des Célestins'
  )
FROM (
    VALUES (
        'Brune des Moines',
        'Brune douce aux notes de caramel et fruits secs.',
        6.50
      ),
      (
        'Saison Estivale',
        'Saison légère et épicée, refermentée en bouteille.',
        5.50
      ),
      (
        'Blanche Lilloise',
        'Blanche trouble à la coriandre et au froment.',
        4.80
      ),
      (
        'Bock d''Hiver',
        'Bock maltée et ronde pour la saison froide.',
        7.50
      )
  ) AS v (name, description, alcohol_content);
-- ---------------------------------------------------------------------
--  2) Favoris communs entre deux utilisateurs (comptes 1 = admin, 2 = brasseur1)
--     Bière commune : « Blonde du Nord » ; le reste diffère.
-- ---------------------------------------------------------------------
INSERT INTO favorite_beer (account_id, beer_id)
SELECT a.id,
  b.id
FROM (
    VALUES ('admin@zytho.test', 'Blonde du Nord'),
      ('admin@zytho.test', 'Triple de Flandre'),
      ('brasseur1@zytho.test', 'Blonde du Nord'),
      ('brasseur1@zytho.test', 'IPA Houblon Sauvage')
  ) AS v (email, beer_name)
  JOIN account a ON a.email = v.email
  JOIN beer b ON b.name = v.beer_name;
COMMIT;
