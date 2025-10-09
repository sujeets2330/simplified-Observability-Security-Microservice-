"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function authedFetcher(url: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then(async (r) => {
    const contentType = r.headers.get("content-type") || ""
    const text = await r.text()
    if (!r.ok) {
      throw new Error(`Request failed (${r.status}): ${text.slice(0, 200)}`)
    }
    if (!contentType.includes("application/json")) {
      throw new Error(`Non-JSON response: ${text.slice(0, 200)}`)
    }
    return JSON.parse(text)
  })
}

export function ThresholdsForm() {
  const { data, mutate } = useSWR("/api/config/thresholds", authedFetcher)
  const [cpu, setCpu] = useState<number | "">("")
  const [mem, setMem] = useState<number | "">("")
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (data?.cpuThreshold != null) setCpu(data.cpuThreshold)
    if (data?.memThreshold != null) setMem(data.memThreshold)
  }, [data])

  const save = async () => {
    const token = localStorage.getItem("sessionToken")
    if (!token) {
      toast({ title: "Not signed in", description: "Please sign in to change thresholds.", variant: "destructive" })
      return
    }
    try {
      setIsSaving(true)
      const res = await fetch("/api/config/thresholds", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cpuThreshold: typeof cpu === "number" ? cpu : undefined,
          memThreshold: typeof mem === "number" ? mem : undefined,
        }),
      })
      const contentType = res.headers.get("content-type") || ""
      const text = await res.text()

      if (!res.ok) {
        toast({
          title: "Failed to save thresholds",
          description: `Request failed (${res.status}): ${text.slice(0, 200)}`,
          variant: "destructive",
        })
        return
      }
      if (!contentType.includes("application/json")) {
        toast({
          title: "Unexpected response",
          description: text.slice(0, 200),
          variant: "destructive",
        })
        return
      }
      const data = JSON.parse(text)
      await mutate()
      toast({ title: "Thresholds updated", description: `CPU ${data.cpuThreshold}% • Memory ${data.memThreshold}%` })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong saving thresholds.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Alert thresholds</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cpu">CPU threshold (%)</Label>
            <Input
              id="cpu"
              type="number"
              min={0}
              max={100}
              value={cpu}
              onChange={(e) => setCpu(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mem">Memory threshold (%)</Label>
            <Input
              id="mem"
              type="number"
              min={0}
              max={100}
              value={mem}
              onChange={(e) => setMem(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={save} disabled={isSaving} aria-busy={isSaving}>
            {isSaving ? "Saving..." : "Save thresholds"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}