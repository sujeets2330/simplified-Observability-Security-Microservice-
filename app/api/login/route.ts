import { type NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/store"
import { verifyPassword, createSession } from "@/lib/security"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 })
    }
    const user = store.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 })
    }
    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 })
    }
    const session = createSession(user)
    return NextResponse.json({ token: session.token, user: { id: user.id, email: user.email } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "internal error" }, { status: 500 })
  }
}
