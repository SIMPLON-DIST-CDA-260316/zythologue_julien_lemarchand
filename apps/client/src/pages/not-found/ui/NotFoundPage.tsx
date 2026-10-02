import { Link } from "react-router"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-muted p-6">
      <h1 className="text-xl font-medium">Page introuvable</h1>
      <p className="text-sm text-muted-foreground">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="text-sm underline underline-offset-4">
        Retour à l'accueil
      </Link>
    </div>
  )
}
