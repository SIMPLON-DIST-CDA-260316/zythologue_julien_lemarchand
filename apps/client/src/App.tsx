import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import DashboardPage from '@/pages/dashboard/DashboardPage'

function App() {
  return (
    <TooltipProvider>
      <DashboardPage />
      <Toaster />
    </TooltipProvider>
  )
}

export default App
