import { Card } from "@/Components/ui/card"
import { AlertTriangle, Network, Wifi, BadgeAlert } from "lucide-react"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: 1,
    title: "High Network Load Detected",
    description: "Network load has exceeded 90% capacity",
    time: "2 minutes ago",
    type: "alert",
    read: false,
  },
  {
    id: 2,
    title: "New PPPoE Connection",
    description: "User john.doe has connected to PPPoE",
    time: "5 minutes ago",
    type: "pppoe",
    read: false,
  },
  {
    id: 3,
    title: "Hotspot Usage Warning",
    description: "Hotspot user guest-123 has reached 80% of data limit",
    time: "10 minutes ago",
    type: "hotspot",
    read: true,
  },
  {
    id: 4,
    title: "System Update Available",
    description: "A new system update is available for installation",
    time: "1 hour ago",
    type: "system",
    read: true,
  },
  {
    id: 5,
    title: "Connection Lost",
    description: "PPPoE connection lost for user alice.smith",
    time: "2 hours ago",
    type: "pppoe",
    read: true,
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "alert":
      return <AlertTriangle className="h-5 w-5 text-destructive" />
    case "pppoe":
      return <Network className="h-5 w-5 text-primary" />
    case "hotspot":
      return <Wifi className="h-5 w-5 text-primary" />
    default:
      return <BadgeAlert className="h-5 w-5 text-primary" />
  }
}

export function NotificationList() {
  return (
    <Card>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-1 p-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50",
                !notification.read && "bg-muted",
              )}
            >
              <div className="mt-1">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">{notification.title}</p>
                  {!notification.read && <span className="rounded-full bg-blue-500 h-2 w-2" />}
                </div>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

