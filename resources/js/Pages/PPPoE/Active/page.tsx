import { DashboardShell } from "@/Components/layout/dashboard-shell"
import { ConnectionsTable } from "@/Components/connections-table"
import { BreadcrumbNav } from "@/Components/breadcrumb-nav"

export default function PPPoEActivePage() {
  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex flex-col gap-4">
          <BreadcrumbNav />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Active PPPoE Connections</h2>
            <p className="text-muted-foreground">Manage and monitor all active PPPoE connections</p>
          </div>
        </div>
        <ConnectionsTable />
      </div>
    </DashboardShell>
  )
}

