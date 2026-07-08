-- Active: 1781204680165@@127.0.0.1@5432
-- =====================================================================
--  Clean la DB
-- =====================================================================
DROP TABLE IF EXISTS sale CASCADE;
DROP TABLE IF EXISTS illustration_brewery CASCADE;
DROP TABLE IF EXISTS illustration_beer CASCADE;
DROP TABLE IF EXISTS favorite_brewery CASCADE;
DROP TABLE IF EXISTS favorite_beer CASCADE;
DROP TABLE IF EXISTS categorization CASCADE;
DROP TABLE IF EXISTS composition CASCADE;
DROP TABLE IF EXISTS review CASCADE;
DROP TABLE IF EXISTS outlet CASCADE;
DROP TABLE IF EXISTS beer CASCADE;
DROP TABLE IF EXISTS brewery CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS ingredient CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS photo CASCADE;
DROP TABLE IF EXISTS address CASCADE;
DROP TYPE IF EXISTS outlet_type;
DROP TYPE IF EXISTS production_type;
DROP TYPE IF EXISTS account_role;
-- =====================================================================
--  Defnis les types - best practice
-- =====================================================================
CREATE TYPE account_role AS ENUM ('customer', 'brewer', 'admin');
CREATE TYPE production_type AS ENUM ('craft', 'industrial', 'microbrewery');
CREATE TYPE outlet_type AS ENUM ('cellar', 'bar', 'restaurant', 'supermarket');
-- =====================================================================
-- DEFINITION DES TABLES : Une FK exige que la table cible existe déjà. Donc ordre topologique obligatoire
-- =====================================================================
--  Tables sans dépendance
CREATE TABLE address (
  id SERIAL PRIMARY KEY,
  number VARCHAR(10),
  street VARCHAR(255) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(60) NOT NULL
);
CREATE TABLE photo (
  id SERIAL PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  caption VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE,
  description TEXT
);
CREATE TABLE ingredient (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  is_allergen BOOLEAN NOT NULL DEFAULT false
);
-- =====================================================================
--  Entités - dépendent des références
-- =====================================================================
CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  last_name VARCHAR(80) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role account_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  photo_id INTEGER REFERENCES photo (id) ON DELETE
  SET NULL
);
CREATE TABLE brewery (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  founding_year SMALLINT,
  production_capacity INTEGER CHECK (production_capacity > 0),
  production_type production_type,
  phone VARCHAR(20),
  website VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  address_id INTEGER REFERENCES address (id) ON DELETE
  SET NULL
);
CREATE TABLE beer (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  alcohol_content NUMERIC(4, 2) CHECK (
    alcohol_content BETWEEN 0 AND 100
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  brewery_id INTEGER NOT NULL REFERENCES brewery (id) ON DELETE RESTRICT
);
CREATE TABLE outlet (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  type outlet_type,
  online_sales BOOLEAN NOT NULL DEFAULT false,
  phone VARCHAR(20),
  website VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  address_id INTEGER REFERENCES address (id) ON DELETE
  SET NULL,
    brewery_id INTEGER REFERENCES brewery (id) ON DELETE
  SET NULL,
    -- CHECK multi-colonnes : reste table-level (porte sur address_id + online_sales)
    CHECK (
      address_id IS NOT NULL
      OR online_sales = true
    )
);
CREATE TABLE review (
  id SERIAL PRIMARY KEY,
  rating SMALLINT NOT NULL CHECK (
    rating BETWEEN 1 AND 5
  ),
  -- SMALINT pluslégé que INT
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reported BOOLEAN NOT NULL DEFAULT false,
  reply TEXT,
  beer_id INTEGER NOT NULL REFERENCES beer (id) ON DELETE CASCADE,
  photo_id INTEGER REFERENCES photo (id) ON DELETE
  SET NULL,
    account_id INTEGER NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    -- UNIQUE composite : reste table-level (un compte note une bière une seule fois)
    UNIQUE (account_id, beer_id)
);
-- =====================================================================
--  Tables d'association - dépendes des entités
-- =====================================================================
CREATE TABLE categorization (
  beer_id INTEGER NOT NULL REFERENCES beer (id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES category (id) ON DELETE RESTRICT,
  PRIMARY KEY (beer_id, category_id)
);
CREATE TABLE composition (
  beer_id INTEGER NOT NULL REFERENCES beer (id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredient (id) ON DELETE CASCADE,
  PRIMARY KEY (beer_id, ingredient_id)
);
CREATE TABLE favorite_beer (
  account_id INTEGER NOT NULL REFERENCES account (id) ON DELETE CASCADE,
  beer_id INTEGER NOT NULL REFERENCES beer (id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, beer_id)
);
CREATE TABLE favorite_brewery (
  account_id INTEGER NOT NULL REFERENCES account (id) ON DELETE CASCADE,
  brewery_id INTEGER NOT NULL REFERENCES brewery (id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, brewery_id)
);
CREATE TABLE illustration_beer (
  beer_id INTEGER NOT NULL REFERENCES beer (id) ON DELETE CASCADE,
  photo_id INTEGER NOT NULL REFERENCES photo (id) ON DELETE CASCADE,
  PRIMARY KEY (beer_id, photo_id)
);
CREATE TABLE illustration_brewery (
  brewery_id INTEGER NOT NULL REFERENCES brewery (id) ON DELETE CASCADE,
  photo_id INTEGER NOT NULL REFERENCES photo (id) ON DELETE CASCADE,
  PRIMARY KEY (brewery_id, photo_id)
);
CREATE TABLE sale (
  outlet_id INTEGER NOT NULL REFERENCES outlet (id) ON DELETE CASCADE,
  beer_id INTEGER NOT NULL REFERENCES beer (id) ON DELETE CASCADE,
  price NUMERIC(8, 2) NOT NULL CHECK (price > 0),
  -- évite les erreurs d 'arrondi binaire (0.1 + 0.2 != 0.3)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (outlet_id, beer_id)
);
-- =====================================================================
--  Horodatage automatique 
-- =====================================================================
-- definition de la trigger function
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- creation des triggers pour chaque table
CREATE TRIGGER trg_photo_updated_at BEFORE
UPDATE ON photo FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_account_updated_at BEFORE
UPDATE ON account FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_brewery_updated_at BEFORE
UPDATE ON brewery FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_beer_updated_at BEFORE
UPDATE ON beer FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_outlet_updated_at BEFORE
UPDATE ON outlet FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_review_updated_at BEFORE
UPDATE ON review FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sale_updated_at BEFORE
UPDATE ON sale FOR EACH ROW EXECUTE FUNCTION set_updated_at();
