"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Alert = {
  id: string
  type: "CPU" | "Memory"
  value: number
  threshold: number
  ts: number
}

type Props = {
  alerts: Alert[]
}

export function AlertsTable({ alerts }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-balance">Recent alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Value</th>
                <th className="py-2 pr-4">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {alerts
                .slice()
                .reverse()
                .map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="py-2 pr-4">{new Date(a.ts).toLocaleTimeString()}</td>
                    <td className="py-2 pr-4">{a.type}</td>
                    <td className="py-2 pr-4">{a.value.toFixed(1)}%</td>
                    <td className="py-2 pr-4">{a.threshold.toFixed(1)}%</td>
                  </tr>
                ))}
              {alerts.length === 0 && (
                <tr>
                  <td className="py-6" colSpan={4}>
                    No alerts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
