import { DashboardShell } from "@/Components/layout/dashboard-shell"
import { Overview } from "@/Components/overview"
import { RecentActivity } from "@/Components/recent-activity"
import { NetworkStats } from "@/Components/network-stats"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <NetworkStats />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Overview />
          <RecentActivity />
        </div>
      </div>
    </DashboardShell>
  )
}

