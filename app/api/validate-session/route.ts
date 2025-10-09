import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/security"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    const session = requireAuth(authHeader)
    return NextResponse.json({ valid: true, userId: session.userId, expiresAt: session.expiresAt })
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}
