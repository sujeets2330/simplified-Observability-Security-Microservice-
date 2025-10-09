// Types shared across server code

export type User = {
  id: string
  email: string
  passwordHash: string
  createdAt: number
}

export type Session = {
  token: string
  userId: string
  createdAt: number
  expiresAt: number
}

export type MetricReading = {
  ts: number
  cpuPercent: number
  memPercent: number
}

export type AlertType = "CPU" | "Memory"

export type Alert = {
  id: string
  type: AlertType
  value: number
  threshold: number
  ts: number
}

export type Thresholds = {
  cpuThreshold: number // percent, 0..100
  memThreshold: number // percent, 0..100
}
