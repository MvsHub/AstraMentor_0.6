// Este arquivo é apenas para testar se o Next.js consegue resolver os caminhos
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { DashboardHeader } from "../components/dashboard-header"
import { DashboardShell } from "../components/dashboard-shell"

export default function TestImports() {
  return (
    <div>
      <DashboardHeader />
      <DashboardShell>
        <Button>Test Button</Button>
        <Input placeholder="Test Input" />
      </DashboardShell>
    </div>
  )
}

