export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};


// types.ts
export type Connection = {
  id: string
  username: string
  ipAddress: string
  macAddress: string
  uptime: string
  downloadSpeed: string
  uploadSpeed: string
  signal: number
  status: "active" | "inactive"
  plan: string
}

// utils.ts
export const getSignalStrength = (signal: number) => {
  if (signal >= -50) return "Excellent"
  if (signal >= -60) return "Good"
  if (signal >= -70) return "Fair"
  return "Poor"
}

export const getSignalColor = (signal: number) => {
  if (signal >= -50) return "bg-green-500"
  if (signal >= -60) return "bg-blue-500"
  if (signal >= -70) return "bg-yellow-500"
  return "bg-red-500"
}
