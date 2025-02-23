import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { Network, Wifi } from "lucide-react"

const activities = [
  {
    type: "pppoe",
    user: "john.doe",
    action: "connected",
    time: "2 minutes ago",
  },
  {
    type: "hotspot",
    user: "guest-123",
    action: "disconnected",
    time: "5 minutes ago",
  },
  {
    type: "pppoe",
    user: "alice.smith",
    action: "connected",
    time: "8 minutes ago",
  },
  {
    type: "hotspot",
    user: "guest-456",
    action: "connected",
    time: "10 minutes ago",
  },
  {
    type: "pppoe",
    user: "bob.jones",
    action: "disconnected",
    time: "12 minutes ago",
  },
  {
    type: "hotspot",
    user: "guest-789",
    action: "connected",
    time: "15 minutes ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest network connections and disconnections</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="rounded-full p-2 bg-muted">
                  {activity.type === "pppoe" ? <Network className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <div className="text-sm text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

