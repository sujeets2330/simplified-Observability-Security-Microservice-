import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/security"
import { store } from "@/lib/store"
import type { Thresholds } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    requireAuth(authHeader)
    return NextResponse.json(store.getThresholds())
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    requireAuth(authHeader)

    const data = (await req.json()) as Partial<Thresholds>
    const current = store.getThresholds()
    const next: Thresholds = {
      cpuThreshold:
        typeof data.cpuThreshold === "number" ? Math.max(0, Math.min(100, data.cpuThreshold)) : current.cpuThreshold,
      memThreshold:
        typeof data.memThreshold === "number" ? Math.max(0, Math.min(100, data.memThreshold)) : current.memThreshold,
    }
    store.setThresholds(next)
    return NextResponse.json(next)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Bad Request" }, { status: 400 })
  }
}
