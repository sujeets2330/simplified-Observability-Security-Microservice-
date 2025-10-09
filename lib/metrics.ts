// // Metrics collection helper with systeminformation fallback to node:os.
// // Generates alerts based on thresholds.

// import { store } from "./store"
// import type { Alert, MetricReading } from "./types"
// import { generateId } from "./security"
// import os from "node:os"

// async function getCpuPercent(): Promise<number> {
//   // Try systeminformation if available for better accuracy.
//   try {
//     // dynamic import to avoid bundling issues if not present
//     const si = await import("systeminformation")
//     const load = await si.currentLoad()
//     return Math.max(0, Math.min(100, load.currentload)) // already percentage
//   } catch {
//     // Fallback using 1-second sampling with os.cpus()
//     const start = os.cpus()
//     await new Promise((r) => setTimeout(r, 300))
//     const end = os.cpus()
//     let idleDiff = 0
//     let totalDiff = 0
//     for (let i = 0; i < start.length; i++) {
//       const s = start[i].times
//       const e = end[i].times
//       const idle = e.idle - s.idle
//       const total = e.user - s.user + (e.nice - s.nice) + (e.sys - s.sys) + (e.irq - s.irq) + idle
//       idleDiff += idle
//       totalDiff += total
//     }
//     const usage = (1 - idleDiff / totalDiff) * 100
//     return Math.max(0, Math.min(100, usage))
//   }
// }

// async function getMemPercent(): Promise<number> {
//   try {
//     const si = await import("systeminformation")
//     const mem = await si.mem()
//     const used = mem.active ?? mem.used
//     const pct = (used / mem.total) * 100
//     return Math.max(0, Math.min(100, pct))
//   } catch {
//     const total = os.totalmem()
//     const free = os.freemem()
//     const used = total - free
//     const pct = (used / total) * 100
//     return Math.max(0, Math.min(100, pct))
//   }
// }

// export async function collectAndStoreMetrics(): Promise<MetricReading> {
//   const [cpuPercent, memPercent] = await Promise.all([getCpuPercent(), getMemPercent()])
//   const reading: MetricReading = { ts: Date.now(), cpuPercent, memPercent }
//   store.addMetric(reading)

//   const thresholds = store.getThresholds()
//   if (cpuPercent > thresholds.cpuThreshold) {
//     const alert: Alert = {
//       id: generateId("alert"),
//       type: "CPU",
//       value: cpuPercent,
//       threshold: thresholds.cpuThreshold,
//       ts: reading.ts,
//     }
//     store.addAlert(alert)
//   }
//   if (memPercent > thresholds.memThreshold) {
//     const alert: Alert = {
//       id: generateId("alert"),
//       type: "Memory",
//       value: memPercent,
//       threshold: thresholds.memThreshold,
//       ts: reading.ts,
//     }
//     store.addAlert(alert)
//   }

//   return reading
// }

import { store } from "./store"
import type { Alert, MetricReading } from "./types"
import { generateId } from "./security"
import os from "node:os"

async function getCpuPercent(): Promise<number> {
  try {
    const si = await import("systeminformation")
    const load = await si.currentLoad()
    return Math.max(0, Math.min(100, load.currentload))
  } catch (err) {
    console.warn("[metrics] systeminformation CPU failed:", err)

    const start = os.cpus()
    await new Promise((r) => setTimeout(r, 500))
    const end = os.cpus()

    let idleDiff = 0
    let totalDiff = 0
    for (let i = 0; i < start.length; i++) {
      const s = start[i].times
      const e = end[i].times
      const idle = e.idle - s.idle
      const total = e.user - s.user + (e.nice - s.nice) + (e.sys - s.sys) + (e.irq - s.irq) + idle
      idleDiff += idle
      totalDiff += total
    }

    const usage = (1 - idleDiff / totalDiff) * 100
    return Math.max(0, Math.min(100, usage))
  }
}

async function getMemPercent(): Promise<number> {
  try {
    const si = await import("systeminformation")
    const mem = await si.mem()
    const used = mem.active ?? mem.used
    const pct = (used / mem.total) * 100
    return Math.max(0, Math.min(100, pct))
  } catch (err) {
    console.warn("[metrics] systeminformation Memory failed:", err)

    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free
    const pct = (used / total) * 100
    return Math.max(0, Math.min(100, pct))
  }
}

export async function collectAndStoreMetrics(): Promise<MetricReading> {
  const [cpuPercent, memPercent] = await Promise.all([getCpuPercent(), getMemPercent()])
  const reading: MetricReading = { ts: Date.now(), cpuPercent, memPercent }
  store.addMetric(reading)

  const thresholds = store.getThresholds() ?? { cpuThreshold: 80, memThreshold: 80 }

  if (cpuPercent > thresholds.cpuThreshold) {
    const alert: Alert = {
      id: generateId("alert"),
      type: "CPU",
      value: cpuPercent,
      threshold: thresholds.cpuThreshold,
      ts: reading.ts,
    }
    store.addAlert(alert)
  }

  if (memPercent > thresholds.memThreshold) {
    const alert: Alert = {
      id: generateId("alert"),
      type: "Memory",
      value: memPercent,
      threshold: thresholds.memThreshold,
      ts: reading.ts,
    }
    store.addAlert(alert)
  }

  return reading
}