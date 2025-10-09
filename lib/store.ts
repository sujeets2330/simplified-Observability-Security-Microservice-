// Simple in-memory singleton store for users, sessions, metrics, and alerts.


import type { Alert, MetricReading, Session, Thresholds, User } from "./types"

const RING_MAX = 200

class InMemoryStore {
  usersByEmail = new Map<string, User>()
  sessionsByToken = new Map<string, Session>()
  metrics: MetricReading[] = []
  alerts: Alert[] = []
  thresholds: Thresholds = { cpuThreshold: 80, memThreshold: 75 }

  // Users
  addUser(user: User) {
    this.usersByEmail.set(user.email.toLowerCase(), user)
  }
  getUserByEmail(email: string) {
    return this.usersByEmail.get(email.toLowerCase()) || null
  }

  // Sessions
  addSession(sess: Session) {
    this.sessionsByToken.set(sess.token, sess)
  }
  getSession(token: string | undefined | null) {
    if (!token) return null
    const s = this.sessionsByToken.get(token)
    if (!s) return null
    if (Date.now() > s.expiresAt) {
      this.sessionsByToken.delete(token)
      return null
    }
    return s
  }

  // Metrics
  addMetric(m: MetricReading) {
    this.metrics.push(m)
    if (this.metrics.length > RING_MAX) this.metrics.shift()
  }
  getLastNMetrics(n: number) {
    return this.metrics.slice(-n)
  }
  getAllMetrics() {
    return this.metrics
  }

  // Alerts
  addAlert(a: Alert) {
    this.alerts.push(a)
    if (this.alerts.length > 1000) this.alerts.shift()
  }
  getAlerts() {
    return this.alerts
  }
  getLastNAlerts(n: number) {
    return this.alerts.slice(-n)
  }

  // Thresholds
  getThresholds() {
    return this.thresholds
  }
  setThresholds(t: Thresholds) {
    this.thresholds = t
  }
}

const globalAny = globalThis as any
export const store: InMemoryStore = globalAny.__OBS_STORE__ || new InMemoryStore()
if (!globalAny.__OBS_STORE__) {
  globalAny.__OBS_STORE__ = store
}
