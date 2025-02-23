import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "00:00", pppoe: 345, hotspot: 200 },
  { name: "03:00", pppoe: 300, hotspot: 180 },
  { name: "06:00", pppoe: 278, hotspot: 189 },
  { name: "09:00", pppoe: 389, hotspot: 239 },
  { name: "12:00", pppoe: 480, hotspot: 280 },
  { name: "15:00", pppoe: 524, hotspot: 298 },
  { name: "18:00", pppoe: 566, hotspot: 320 },
  { name: "21:00", pppoe: 455, hotspot: 250 },
]

export function Overview() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Network Overview</CardTitle>
        <CardDescription>Active connections over the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <Tooltip />
            <Line type="monotone" dataKey="pppoe" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="hotspot" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

