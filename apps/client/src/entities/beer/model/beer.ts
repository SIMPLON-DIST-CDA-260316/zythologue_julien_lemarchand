// Forme renvoyée par `GET /beers` (schéma `BeerListItem` de l'API).
export type Beer = {
  id: number
  name: string
  description: string | null
  alcohol_content: number | null
  created_at: string
  updated_at: string
  brewery: { id: number; name: string }
}

const percentFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })

export function formatAlcoholContent(alcoholContent: number) {
  return `${percentFormat.format(alcoholContent)} %`
}
