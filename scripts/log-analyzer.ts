// Log Analyzer Utility (Phase 1)
// Usage: Provide a path to a log file as an argument. The script will print:
// - Count of each log level (INFO, WARN, ERROR)
// - Top 5 most frequent ERROR messages

import { promises as fs } from "node:fs"
import path from "node:path"

type Counts = Record<"INFO" | "WARN" | "ERROR", number>

function parseLog(content: string) {
  const lines = content.split(/\r?\n/).filter(Boolean)
  const counts: Counts = { INFO: 0, WARN: 0, ERROR: 0 }
  const errorFreq = new Map<string, number>()

  for (const line of lines) {
    const levelMatch = line.match(/\b(INFO|WARN|ERROR)\b/)
    if (!levelMatch) continue
    const level = levelMatch[1] as keyof Counts
    counts[level] += 1

    if (level === "ERROR") {
      // capture the message after ERROR (strip timestamp/prefixes if any)
      // e.g., "[2025-10-09 12:00:01] ERROR: Disk full on /dev/sda1"
      const msg = (line.split(/ERROR[:\s-]+/i)[1] || line).trim()
      const key = msg || "Unknown error"
      errorFreq.set(key, (errorFreq.get(key) || 0) + 1)
    }
  }

  const topErrors = Array.from(errorFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return { counts, topErrors }
}

async function main() {
  const fileArg = process.argv[2]
  if (!fileArg) {
    console.log("Usage: node scripts/log-analyzer.ts <path-to-logfile>")
    return
  }
  const fullPath = path.resolve(process.cwd(), fileArg)
  const content = await fs.readFile(fullPath, "utf8")
  const { counts, topErrors } = parseLog(content)

  console.log("--- Log Level Counts ---")
  console.log(`INFO:  ${counts.INFO}`)
  console.log(`WARN:  ${counts.WARN}`)
  console.log(`ERROR: ${counts.ERROR}`)
  console.log("")
  console.log("--- Top 5 Error Messages ---")
  if (topErrors.length === 0) {
    console.log("No ERROR messages found.")
  } else {
    for (const [msg, n] of topErrors) {
      console.log(`(${n}) ${msg}`)
    }
  }
}

main().catch((err) => {
  console.error("Failed to analyze log:", err)
})
