// Password hashing and session token helpers

import bcrypt from "bcryptjs"
import crypto from "crypto"
import type { Session, User } from "./types"
import { store } from "./store"

export async function hashPassword(plain: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`
}

export function createSession(user: User): Session {
  // 24h session
  const now = Date.now()
  const token = crypto.randomBytes(24).toString("hex")
  const sess: Session = {
    token,
    userId: user.id,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  }
  store.addSession(sess)
  return sess
}

export function requireAuth(authorizationHeader: string | null | undefined): Session {
  if (!authorizationHeader) throw new Error("Unauthorized")
  const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim()
  const sess = store.getSession(token)
  if (!sess) throw new Error("Unauthorized")
  return sess
}
