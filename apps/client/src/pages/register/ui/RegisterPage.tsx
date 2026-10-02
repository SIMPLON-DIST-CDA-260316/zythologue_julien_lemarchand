import { Link } from "react-router"

import { RegisterForm } from "./RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte&nbsp;?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
