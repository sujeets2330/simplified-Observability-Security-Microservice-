import { type NextRequest, NextResponse } from "next/server"
import { collectAndStoreMetrics } from "@/lib/metrics"
import { store } from "@/lib/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    // Collect one fresh sample on each call
    const latest = await collectAndStoreMetrics()
    const url = new URL(req.url)
    const n = Number(url.searchParams.get("n") || 50)
    const readings = store.getLastNMetrics(Math.max(1, Math.min(200, n)))
    const alertsRecent = store.getLastNAlerts(20)

    const safeLatest = {
      ...latest,
      cpuPercent: Number.isFinite(latest.cpuPercent) ? latest.cpuPercent : 0,
      memPercent: Number.isFinite(latest.memPercent) ? latest.memPercent : 0,
    }
    const safeReadings = readings.map((r) => ({
      ...r,
      cpuPercent: Number.isFinite(r.cpuPercent) ? r.cpuPercent : 0,
      memPercent: Number.isFinite(r.memPercent) ? r.memPercent : 0,
    }))

    console.log("[v0] /api/metrics sample", {
      cpu: safeLatest.cpuPercent.toFixed(1),
      mem: safeLatest.memPercent.toFixed(1),
      n: safeReadings.length,
    })
    return NextResponse.json(
      { latest: safeLatest, readings: safeReadings, alertsRecent, thresholds: store.getThresholds() },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 })
  }
}
