import { ChartAreaInteractive } from "./ChartAreaInteractive"
import { SectionCards } from "./SectionCards"

// Page du block shadcn dashboard-01 : la CLI ne la génère pas pour Vite
// (pas de routage par fichiers), elle est recopiée depuis le registre.
export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </div>
      </div>
    </div>
  )
}
