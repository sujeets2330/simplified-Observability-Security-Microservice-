import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/security"
import { store } from "@/lib/store"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    requireAuth(authHeader)

    const alerts = store.getAlerts()
    const totalAlerts = alerts.length
    const byType = {
      CPU: alerts.filter((a) => a.type === "CPU").length,
      Memory: alerts.filter((a) => a.type === "Memory").length,
    }
    const url = new URL(req.url)
    const lastN = Number(url.searchParams.get("n") || 10)
    const lastAlerts = store.getLastNAlerts(Math.max(1, Math.min(100, lastN)))

    const lastReadings = store.getLastNMetrics(10)
    const avgCpu = lastReadings.length ? lastReadings.reduce((s, r) => s + r.cpuPercent, 0) / lastReadings.length : 0
    const avgMem = lastReadings.length ? lastReadings.reduce((s, r) => s + r.memPercent, 0) / lastReadings.length : 0

    return NextResponse.json({
      totalAlerts,
      byType,
      lastAlertTimestamps: lastAlerts.map((a) => a.ts),
      averages: { cpuPercent: avgCpu, memPercent: avgMem },
    })
  } catch (e: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
