"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type Props = {
  onToken: (token: string, email: string) => void
}

export function AuthForm({ onToken }: Props) {
  const [mode, setMode] = useState<"login" | "register">("register")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const contentType = res.headers.get("content-type") || ""
      const text = await res.text()

      if (!res.ok) {
        // Show server error text if available
        const snippet = text?.slice(0, 200) || res.statusText
        throw new Error(`Request failed (${res.status}): ${snippet}`)
      }
      if (!contentType.includes("application/json")) {
        const snippet = text?.slice(0, 200)
        throw new Error(`Server returned non-JSON response: ${snippet}`)
      }

      const data = JSON.parse(text)
      localStorage.setItem("sessionToken", data.token)
      localStorage.setItem("email", data.user?.email || email)
      onToken(data.token, data.user?.email || email)
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-balance">{mode === "register" ? "Create account" : "Sign in"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={loading} className="min-w-28">
            {loading ? "Please wait…" : mode === "register" ? "Register" : "Login"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => setMode(mode === "register" ? "login" : "register")}>
            {mode === "register" ? "Have an account? Sign in" : "New here? Create account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
