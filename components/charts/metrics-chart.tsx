"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Reading = { ts: number; cpuPercent: number; memPercent: number }

export function MetricsChart({ data }: { data: Reading[] }) {
  const chartData = data.map((d) => ({
    ts: new Date(d.ts).toLocaleTimeString(),
    cpu: Number.isFinite(d.cpuPercent) ? Number(d.cpuPercent.toFixed(1)) : null,
    mem: Number.isFinite(d.memPercent) ? Number(d.memPercent.toFixed(1)) : null,
  }))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">CPU and Memory (%)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No metrics yet. Keep this page open to start sampling.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" minTickGap={24} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="var(--color-chart-1)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="mem" stroke="var(--color-chart-2)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
