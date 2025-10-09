import { type NextRequest, NextResponse } from "next/server"
import { collectAndStoreMetrics } from "@/lib/metrics"
import { store } from "@/lib/store"

export async function GET(req: NextRequest) {
  try {
    // Collect one fresh sample on each call
    const latest = await collectAndStoreMetrics()
    const url = new URL(req.url)
    const n = Number(url.searchParams.get("n") || 50)
    const readings = store.getLastNMetrics(Math.max(1, Math.min(200, n)))
    const alertsRecent = store.getLastNAlerts(20)
    return NextResponse.json({ latest, readings, alertsRecent, thresholds: store.getThresholds() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 })
  }
}
