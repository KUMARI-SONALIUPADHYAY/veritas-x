import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Radio,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

import ThreatFeed from '../components/feature/ThreatFeed'
import ActivityChart from '../components/charts/ActivityChart'
import DetectionTable from '../components/ui/DetectionTable'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'
import useDashboardData from '../hooks/useDashboardData'
import { inferThreatType } from '../services/api'

export default function DashboardPage() {
  const { stats, detections, loading, isConnected } = useDashboardData()
  const [riskFilter, setRiskFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('24h')
  const [selectedDetection, setSelectedDetection] = useState(null)

  // 🔥 FILTER LOGIC (FIXED SAFE CHECKS)
  const filteredDetections = useMemo(() => {
    const now = Date.now()

    const maxAgeMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    }

    const maxAge = maxAgeMap[timeFilter]

    return (detections || []).filter((d) => {
      const ts = d.timestamp ? new Date(d.timestamp).getTime() : now
      const ageMatches = now - ts <= maxAge

      const riskMatches =
        riskFilter === 'all' || (d.status || '').toLowerCase() === riskFilter

      const typeMatches =
        typeFilter === 'all' || inferThreatType(d) === typeFilter

      return ageMatches && riskMatches && typeMatches
    })
  }, [detections, riskFilter, timeFilter, typeFilter])

  // 🔥 TREND DETECTION (SAFE VERSION)
  const duplicateInsight = useMemo(() => {
    const counts = {}

    for (const item of filteredDetections) {
      const key =
        (item.reasons?.[0] || inferThreatType(item) || 'Unknown').slice(0, 60)

      counts[key] = (counts[key] || 0) + 1
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

    const [title, count] = sorted[0] || ['No trending campaign yet', 0]

    return { title, count }
  }, [filteredDetections])

  return (
    <div className="space-y-5">

      {/* 🔵 HEADER */}
      <div className="vx-card flex items-center justify-between p-3">
        <div>
          <p className="text-sm font-semibold text-primary-text">
            Threat Command Center
          </p>
          <p className="text-xs text-muted-text">
            Realtime intelligence stream for scam detection.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/35 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          <Radio className="h-3.5 w-3.5" />
          {isConnected ? 'LIVE CONNECTED' : 'SYNCING...'}
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Scans" value={stats?.total || 0} icon={ShieldCheck} />
        <StatCard title="Safe" value={stats?.safe || 0} icon={CheckCircle2} />
        <StatCard title="Suspicious" value={stats?.suspicious || 0} icon={AlertTriangle} />
        <StatCard title="Danger" value={stats?.danger || 0} icon={ShieldAlert} />
      </div>

      {/* 🎛 FILTERS */}
      <div className="vx-card p-4">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-primary-text">
            Filters
          </h3>

          <div className="flex items-center gap-2 text-xs text-muted-text">
            <Filter className="h-3.5 w-3.5" />
            {filteredDetections.length} results
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <select className="vx-input" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
            <option value="30d">Last 30d</option>
            <option value="all">All time</option>
          </select>

          <select className="vx-input" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="all">All risk</option>
            <option value="suspicious">Suspicious</option>
            <option value="danger">Danger</option>
          </select>

          <select className="vx-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="url">URL</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* 📈 CHART + INSIGHTS */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <ActivityChart detections={filteredDetections} />

        <div className="vx-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-primary-text">
            Threat Insights
          </h3>

          <div>
            <p className="text-xs text-muted-text">Avg Confidence</p>
            <p className="text-xl font-bold text-cyan-300">
              {filteredDetections.length
                ? Math.round(
                    filteredDetections.reduce(
                      (sum, d) => sum + (d.confidence || 0),
                      0
                    ) / filteredDetections.length
                  )
                : 0}
              %
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-text">Trending Scam</p>
            <p className="text-sm font-semibold text-primary-text">
              {duplicateInsight.title}
            </p>
            <p className="text-amber-300 text-sm">
              {duplicateInsight.count > 0
                ? `${duplicateInsight.count}+ occurrences`
                : 'No trend yet'}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-text">Realtime Status</p>
            <p className="text-emerald-300 font-semibold">
              {loading
                ? 'Connecting...'
                : isConnected
                ? 'Live Stream Active'
                : 'Reconnecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* 📡 FEED + TABLE */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <ThreatFeed detections={filteredDetections} onSelect={setSelectedDetection} />
        <DetectionTable detections={filteredDetections} />
      </div>

      {/* 📦 MODAL */}
      <Modal
        open={Boolean(selectedDetection)}
        title="Detection Details"
        onClose={() => setSelectedDetection(null)}
      >
        {selectedDetection && (
          <div className="space-y-3 text-sm">
            <p><b>URL:</b> {selectedDetection.url || 'N/A'}</p>
            <p><b>Status:</b> {selectedDetection.status}</p>
            <p><b>Score:</b> {Math.round(selectedDetection.risk_score || 0)}</p>
            <p><b>Confidence:</b> {Math.round(selectedDetection.confidence || 0)}%</p>

            <div>
              <p className="text-muted-text mb-1">Reasons</p>
              <ul>
                {(selectedDetection.reasons || []).map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}