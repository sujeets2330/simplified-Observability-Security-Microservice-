"use client"

import useSWR from "swr"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthForm } from "@/components/auth-form"
import { ThresholdsForm } from "@/components/thresholds-form"
import { MetricsChart } from "@/components/charts/metrics-chart"
import { AlertsTable } from "@/components/alerts-table"

type MetricReading = { ts: number; cpuPercent: number; memPercent: number }
type Alert = { id: string; type: "CPU" | "Memory"; value: number; threshold: number; ts: number }

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" })
  const text = await res.text()
  if (!res.ok) throw new Error(text.slice(0, 200) || "Request failed")
  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Non-JSON response: " + text.slice(0, 120))
  }
}

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem("sessionToken"))
    setEmail(localStorage.getItem("email"))
  }, [])

  const { data, isLoading, error, mutate } = useSWR<{
    latest: MetricReading
    readings: MetricReading[]
    alertsRecent: Alert[]
    thresholds: { cpuThreshold: number; memThreshold: number }
  }>("/api/metrics?n=100", fetcher, { refreshInterval: 5000 })

  // Summary (secure) - only fetch when token exists
  const summaryFetcher = (url: string) =>
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }).then((r) => r.json())
  const { data: summary } = useSWR(token ? "/api/summary?n=10" : null, summaryFetcher, { refreshInterval: 10000 })

  const onAuthed = (t: string, e: string) => {
    setToken(t)
    setEmail(e)
  }

  return (
    <main className="mx-auto max-w-6xl p-6 grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">CodeXray Observability & Security Microservice</h1>
        <div className="flex items-center gap-3">
          {email ? (
            <span className="text-sm">Signed in as {email}</span>
          ) : (
            <span className="text-sm">Not signed in</span>
          )}
          {email ? (
            <Button
              variant="secondary"
              onClick={() => {
                localStorage.removeItem("sessionToken")
                localStorage.removeItem("email")
                setToken(null)
                setEmail(null)
              }}
            >
              Sign out
            </Button>
          ) : null}
        </div>
      </header>

      {!token && (
        <section>
          <AuthForm onToken={onAuthed} />
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MetricsChart data={data?.readings || []} />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-balance">Current status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div>
                CPU:{" "}
                {data?.latest && Number.isFinite(data.latest.cpuPercent)
                  ? `${data.latest.cpuPercent.toFixed(1)}%`
                  : "—"}
              </div>
              <div>
                Memory:{" "}
                {data?.latest && Number.isFinite(data.latest.memPercent)
                  ? `${data.latest.memPercent.toFixed(1)}%`
                  : "—"}
              </div>
              <div>CPU threshold: {data?.thresholds ? `${data.thresholds.cpuThreshold}%` : "—"}</div>
              <div>Memory threshold: {data?.thresholds ? `${data.thresholds.memThreshold}%` : "—"}</div>
            </CardContent>
          </Card>

          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-balance">Summary (secure)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <div>Total alerts: {summary.totalAlerts}</div>
                <div>
                  By type — CPU: {summary.byType?.CPU ?? 0}, Memory: {summary.byType?.Memory ?? 0}
                </div>
                <div>Avg CPU (last 10): {summary.averages?.cpuPercent?.toFixed?.(1) ?? "—"}%</div>
                <div>Avg Mem (last 10): {summary.averages?.memPercent?.toFixed?.(1) ?? "—"}%</div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-3 text-sm text-destructive">
            Metrics error: {String(error.message || error)}
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsTable alerts={data?.alertsRecent || []} />
        </div>
        <div>
          {token ? (
            <ThresholdsForm />
          ) : (
            <Card>
              <CardContent className="py-6 text-sm">Sign in to configure thresholds.</CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
