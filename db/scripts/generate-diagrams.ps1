# Genere les 3 niveaux depuis la source unique typee modeles/zytho.mcd :
# MCD.svg (conceptuel, sans types) | MLD.svg (relationnel, sans types) | MPD (.dbml + .sql)
# Usage (PowerShell, depuis la racine) : .\scripts\generate-diagrams.ps1 [-Arrange]
# -Arrange : re-agence d'abord la disposition de la source (algo genetique, gere le graphe non-planaire de PHOTO)
param([switch]$Arrange)
$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$src = "modeles"
$out = "docs/generated"
New-Item -ItemType Directory -Force $out | Out-Null

if ($Arrange) {
  Write-Host "-> Re-agencement (arrange) des .mcd source"
  New-Item -ItemType Directory -Force "$out/_arr" | Out-Null
  python -m mocodo --input "$src/zytho.mcd" --output_dir "$out/_arr" -t "arrange:algo=ga,population_size=200,max_generations=100,timeout=12,verbose=1"
  Move-Item -Force "$out/_arr/zytho.mcd" "$src/zytho.mcd"
  Remove-Item -Recurse -Force "$out/_arr"
}

Write-Host "-> MLD (markdown) + MPD (DBML, SQL) depuis la source typee"
python -m mocodo --input "$src/zytho.mcd" --output_dir "$out" -t "relation:$src/templates/znames.mld.yaml"
python -m mocodo --input "$src/zytho.mcd" --output_dir "$out" -t "relation:$src/templates/znames.dbml.yaml"
python -m mocodo --input "$src/zytho.mcd" --output_dir "$out" -t "relation:$src/templates/znames.sql.yaml"

Write-Host "-> MLD visuel (SVG relationnel, sans types) via -t diagram"
New-Item -ItemType Directory -Force "$out/_mld" | Out-Null
python -m mocodo --input "$src/zytho.mcd" --output_dir "$out/_mld" -t diagram
# Renomme les jonctions N:N (verbe MCD -> nom de table semantique) pour le diagramme MLD
# UNIQUEMENT. La source zytho.mcd n'est pas touchee : le MCD garde ses verbes.
$mld = "$out/_mld/zytho_mld.mcd"
$lines = Get-Content $mld
# (a) jonctions N:N : verbe MCD -> nom de table semantique EN
$jonctions = [ordered]@{
  '^Composer:'            = 'composition:'
  '^Vendre:'              = 'sale:'
  '^Categoriser:'         = 'categorization:'
  '^Illustrer brasserie:' = 'illustration_brewery:'
  '^Illustrer biere:'     = 'illustration_beer:'
  '^Favori brasserie:'    = 'favorite_brewery:'
  '^Favori biere:'        = 'favorite_beer:'
}
foreach ($k in $jonctions.Keys) { $lines = $lines -replace $k, $jonctions[$k] }
# (b) entites + attributs FR -> EN (le diagramme MLD est en anglais ; la source
# zytho.mcd reste FR, donc le MCD garde son nommage conceptuel francais).
# Ordre imperatif : cibles FK -> colonnes FK -> attributs -> PK nus -> noms d'entites.
$fr2en = @(
  # 1) cibles de FK : '> ENTITE > pk_fr' -> '> entity_en > id'
  @('> BIERE > bie_id', '> beer > id'),
  @('> CATEGORIE > cat_id', '> category > id'),
  @('> INGREDIENT > ing_id', '> ingredient > id'),
  @('> POINT_DE_VENTE > pdv_id', '> outlet > id'),
  @('> ADRESSE > adr_id', '> address > id'),
  @('> BRASSERIE > bra_id', '> brewery > id'),
  @('> PERSONNE > per_id', '> account > id'),
  @('> PHOTO > pho_id', '> photo > id'),
  # 2) colonnes FK : (_?#)code_fr -> (_?#)<entity>_id
  @('(_?#)bie_id', '${1}beer_id'),
  @('(_?#)cat_id', '${1}category_id'),
  @('(_?#)ing_id', '${1}ingredient_id'),
  @('(_?#)pdv_id', '${1}outlet_id'),
  @('(_?#)adr_id', '${1}address_id'),
  @('(_?#)bra_id', '${1}brewery_id'),
  @('(_?#)per_id', '${1}account_id'),
  @('(_?#)pho_id', '${1}photo_id'),
  # 3) attributs non-id (tokens uniques)
  @('\bbie_nom\b', 'name'), @('\bbie_description\b', 'description'), @('\bbie_degre_alcool\b', 'alcohol_content'),
  @('\bcat_nom\b', 'name'), @('\bcat_description\b', 'description'),
  @('\bing_nom\b', 'name'), @('\bing_est_allergene\b', 'is_allergen'),
  @('\bpdv_nom\b', 'name'), @('\bpdv_type\b', 'type'), @('\bpdv_vente_ligne\b', 'online_sales'), @('\bpdv_telephone\b', 'phone'), @('\bpdv_site_web\b', 'website'),
  @('\badr_numero\b', 'number'), @('\badr_rue\b', 'street'), @('\badr_code_postal\b', 'zip_code'), @('\badr_ville\b', 'city'), @('\badr_pays\b', 'country'),
  @('\bbra_nom\b', 'name'), @('\bbra_description\b', 'description'), @('\bbra_annee_creation\b', 'founding_year'), @('\bbra_capacite_prod\b', 'production_capacity'), @('\bbra_type_prod\b', 'production_type'), @('\bbra_telephone\b', 'phone'), @('\bbra_site_web\b', 'website'),
  @('\bper_email\b', 'email'), @('\bper_nom\b', 'last_name'), @('\bper_prenom\b', 'first_name'), @('\bper_mdp\b', 'password'), @('\bper_role\b', 'role'), @('\bper_date_inscr\b', 'created_at'),
  @('\bpho_url\b', 'url'), @('\bpho_legende\b', 'caption'), @('\bpho_date\b', 'created_at'),
  @('\bavi_note\b', 'rating'), @('\bavi_commentaire\b', 'comment'), @('\bavi_date\b', 'created_at'), @('\bavi_signale\b', 'reported'), @('\bavi_reponse\b', 'reply'),
  @('\bven_prix\b', 'price'),
  # 4) PK nus restants (declaration d'entite) -> id
  @('\bbie_id\b', 'id'), @('\bcat_id\b', 'id'), @('\bing_id\b', 'id'), @('\bpdv_id\b', 'id'),
  @('\badr_id\b', 'id'), @('\bbra_id\b', 'id'), @('\bper_id\b', 'id'), @('\bpho_id\b', 'id'), @('\bavi_id\b', 'id'),
  # 5) noms d'entites (declaration en debut de ligne)
  @('^BIERE:', 'beer:'), @('^CATEGORIE:', 'category:'), @('^INGREDIENT:', 'ingredient:'), @('^POINT_DE_VENTE:', 'outlet:'),
  @('^ADRESSE:', 'address:'), @('^BRASSERIE:', 'brewery:'), @('^PERSONNE:', 'account:'), @('^PHOTO:', 'photo:'), @('^AVIS:', 'review:')
)
foreach ($p in $fr2en) { $lines = $lines -replace $p[0], $p[1] }
Set-Content -Encoding UTF8 $mld $lines
python -m mocodo --input "$out/_mld/zytho_mld.mcd" --output_dir "$out/_mld"
Move-Item -Force "$out/_mld/zytho_mld.svg" "$out/zytho_mld.svg"
Move-Item -Force "$out/_mld/zytho_mld_geo.json" "$out/zytho_mld_geo.json"
Remove-Item -Recurse -Force "$out/_mld"

Write-Host "-> MCD conceptuel PUR (types retires via delete:types, ecrase le zytho.svg type)"
New-Item -ItemType Directory -Force "$out/_pure" | Out-Null
python -m mocodo --input "$src/zytho.mcd" --output_dir "$out/_pure" -t delete:types
Move-Item -Force "$out/_pure/zytho.svg" "$out/zytho.svg"
Move-Item -Force "$out/_pure/zytho_geo.json" "$out/zytho_geo.json"
Remove-Item -Recurse -Force "$out/_pure"

Write-Host "OK -> $out/"
Get-ChildItem $out -Name | Sort-Object
