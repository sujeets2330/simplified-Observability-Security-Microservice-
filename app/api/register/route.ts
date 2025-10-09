import { type NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/store"
import { generateId, hashPassword, createSession } from "@/lib/security"
import { z } from "zod"

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] /api/register: incoming request")

    let raw: any
    try {
      raw = await req.json()
    } catch (err: any) {
      console.error("[v0] /api/register: invalid JSON body", err?.message)
      return NextResponse.json({ error: "invalid JSON" }, { status: 400 })
    }

    // Sanitize input
    const body = {
      email: typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "",
      password: raw.password,
    }

    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      console.warn("[v0] /api/register: validation failed", parsed.error.flatten())
      return NextResponse.json({ error: "invalid input", details: parsed.error.flatten() }, { status: 400 })
    }

    const { email, password } = parsed.data

    const existing = store.getUserByEmail(email)
    if (existing) {
      console.log("[v0] /api/register: user exists", email)
      return NextResponse.json({ error: "user exists" }, { status: 409 })
    }

    console.log("[v0] /api/register: hashing password")
    const passwordHash = await hashPassword(password)

    const user = {
      id: generateId("user"),
      email,
      passwordHash,
      createdAt: Date.now(),
    }

    store.addUser(user)
    const session = createSession(user)
    console.log("[v0] /api/register: success", user.id)

    return NextResponse.json({ token: session.token, user: { id: user.id, email: user.email } }, { status: 201 })
  } catch (e: any) {
    console.error("[v0] /api/register error:", e?.stack || e?.message || e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}