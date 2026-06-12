#!/usr/bin/env bash
# Genere les 3 niveaux depuis la source unique typee modeles/zytho.mcd :
#   MCD.svg (conceptuel, sans types) | MLD.svg (relationnel, sans types) | MPD (.dbml + .sql)
# Usage : bash scripts/generate-diagrams.sh [--arrange]   (depuis la racine du projet)
#   --arrange : re-agence d'abord la disposition de la source (algo genetique, gere le graphe non-planaire de PHOTO)
set -euo pipefail

ARRANGE=0
[ "${1:-}" = "--arrange" ] && ARRANGE=1

cd "$(dirname "$0")/.."
SRC=modeles
OUT=docs/generated

# Choisit le Python qui a mocodo (Git Bash mappe python3 -> /usr/bin sans mocodo)
PY=""
for c in python py python3; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c "import mocodo" >/dev/null 2>&1; then PY="$c"; break; fi
done
[ -z "$PY" ] && { echo "ERREUR : mocodo introuvable. Installer : pip install mocodo" >&2; exit 1; }

mkdir -p "$OUT"

if [ "$ARRANGE" = 1 ]; then
  echo "→ Re-agencement (arrange) des .mcd source"
  mkdir -p "$OUT/_arr"
  "$PY" -m mocodo --input "$SRC/zytho.mcd" --output_dir "$OUT/_arr" -t "arrange:algo=ga,population_size=200,max_generations=100,timeout=12,verbose=1"
  mv -f "$OUT/_arr/zytho.mcd" "$SRC/zytho.mcd"
  rm -rf "$OUT/_arr"
fi

echo "→ MLD (markdown) + MPD (DBML, SQL) depuis la source typee"
"$PY" -m mocodo --input "$SRC/zytho.mcd" --output_dir "$OUT" -t "relation:$SRC/templates/znames.mld.yaml"
"$PY" -m mocodo --input "$SRC/zytho.mcd" --output_dir "$OUT" -t "relation:$SRC/templates/znames.dbml.yaml"
"$PY" -m mocodo --input "$SRC/zytho.mcd" --output_dir "$OUT" -t "relation:$SRC/templates/znames.sql.yaml"

echo "→ MLD visuel (SVG relationnel, sans types) via -t diagram"
mkdir -p "$OUT/_mld"
"$PY" -m mocodo --input "$SRC/zytho.mcd" --output_dir "$OUT/_mld" -t diagram
# Renomme le diagramme MLD UNIQUEMENT (la source zytho.mcd reste FR : le MCD garde
# verbes + entites/attributs en francais). Ordre imperatif : jonctions, puis FR->EN
# (cibles FK -> colonnes FK -> attributs -> PK nus -> noms d'entites).
sed -i \
  -e 's/^Composer:/composition:/' \
  -e 's/^Vendre:/sale:/' \
  -e 's/^Categoriser:/categorization:/' \
  -e 's/^Illustrer brasserie:/illustration_brewery:/' \
  -e 's/^Illustrer biere:/illustration_beer:/' \
  -e 's/^Favori brasserie:/favorite_brewery:/' \
  -e 's/^Favori biere:/favorite_beer:/' \
  -e 's/> BIERE > bie_id/> beer > id/g' \
  -e 's/> CATEGORIE > cat_id/> category > id/g' \
  -e 's/> INGREDIENT > ing_id/> ingredient > id/g' \
  -e 's/> POINT_DE_VENTE > pdv_id/> outlet > id/g' \
  -e 's/> ADRESSE > adr_id/> address > id/g' \
  -e 's/> BRASSERIE > bra_id/> brewery > id/g' \
  -e 's/> PERSONNE > per_id/> account > id/g' \
  -e 's/> PHOTO > pho_id/> photo > id/g' \
  -e 's/\(_\?#\)bie_id/\1beer_id/g' \
  -e 's/\(_\?#\)cat_id/\1category_id/g' \
  -e 's/\(_\?#\)ing_id/\1ingredient_id/g' \
  -e 's/\(_\?#\)pdv_id/\1outlet_id/g' \
  -e 's/\(_\?#\)adr_id/\1address_id/g' \
  -e 's/\(_\?#\)bra_id/\1brewery_id/g' \
  -e 's/\(_\?#\)per_id/\1account_id/g' \
  -e 's/\(_\?#\)pho_id/\1photo_id/g' \
  -e 's/\bbie_nom\b/name/g' -e 's/\bbie_description\b/description/g' -e 's/\bbie_degre_alcool\b/alcohol_content/g' \
  -e 's/\bcat_nom\b/name/g' -e 's/\bcat_description\b/description/g' \
  -e 's/\bing_nom\b/name/g' -e 's/\bing_est_allergene\b/is_allergen/g' \
  -e 's/\bpdv_nom\b/name/g' -e 's/\bpdv_type\b/type/g' -e 's/\bpdv_vente_ligne\b/online_sales/g' -e 's/\bpdv_telephone\b/phone/g' -e 's/\bpdv_site_web\b/website/g' \
  -e 's/\badr_numero\b/number/g' -e 's/\badr_rue\b/street/g' -e 's/\badr_code_postal\b/zip_code/g' -e 's/\badr_ville\b/city/g' -e 's/\badr_pays\b/country/g' \
  -e 's/\bbra_nom\b/name/g' -e 's/\bbra_description\b/description/g' -e 's/\bbra_annee_creation\b/founding_year/g' -e 's/\bbra_capacite_prod\b/production_capacity/g' -e 's/\bbra_type_prod\b/production_type/g' -e 's/\bbra_telephone\b/phone/g' -e 's/\bbra_site_web\b/website/g' \
  -e 's/\bper_email\b/email/g' -e 's/\bper_nom\b/last_name/g' -e 's/\bper_prenom\b/first_name/g' -e 's/\bper_mdp\b/password/g' -e 's/\bper_role\b/role/g' -e 's/\bper_date_inscr\b/created_at/g' \
  -e 's/\bpho_url\b/url/g' -e 's/\bpho_legende\b/caption/g' -e 's/\bpho_date\b/created_at/g' \
  -e 's/\bavi_note\b/rating/g' -e 's/\bavi_commentaire\b/comment/g' -e 's/\bavi_date\b/created_at/g' -e 's/\bavi_signale\b/reported/g' -e 's/\bavi_reponse\b/reply/g' \
  -e 's/\bven_prix\b/price/g' \
  -e 's/\bbie_id\b/id/g' -e 's/\bcat_id\b/id/g' -e 's/\bing_id\b/id/g' -e 's/\bpdv_id\b/id/g' \
  -e 's/\badr_id\b/id/g' -e 's/\bbra_id\b/id/g' -e 's/\bper_id\b/id/g' -e 's/\bpho_id\b/id/g' -e 's/\bavi_id\b/id/g' \
  -e 's/^BIERE:/beer:/' -e 's/^CATEGORIE:/category:/' -e 's/^INGREDIENT:/ingredient:/' -e 's/^POINT_DE_VENTE:/outlet:/' \
  -e 's/^ADRESSE:/address:/' -e 's/^BRASSERIE:/brewery:/' -e 's/^PERSONNE:/account:/' -e 's/^PHOTO:/photo:/' -e 's/^AVIS:/review:/' \
  "$OUT/_mld/zytho_mld.mcd"
"$PY" -m mocodo --input "$OUT/_mld/zytho_mld.mcd" --output_dir "$OUT/_mld"
mv -f "$OUT/_mld/zytho_mld.svg" "$OUT/zytho_mld.svg"
mv -f "$OUT/_mld/zytho_mld_geo.json" "$OUT/zytho_mld_geo.json"
rm -rf "$OUT/_mld"

echo "→ MCD conceptuel PUR (types retires via delete:types, ecrase le zytho.svg type)"
mkdir -p "$OUT/_pure"
"$PY" -m mocodo --input "$SRC/zytho.mcd" --output_dir "$OUT/_pure" -t delete:types
mv -f "$OUT/_pure/zytho.svg" "$OUT/zytho.svg"
mv -f "$OUT/_pure/zytho_geo.json" "$OUT/zytho_geo.json"
rm -rf "$OUT/_pure"

echo "OK → $OUT/"
ls "$OUT/"
