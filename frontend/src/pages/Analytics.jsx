import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"

export default function Analytics() {
  const [data, setData] = useState(null)

  // 🔁 FETCH FUNCTION (REUSABLE)
  const loadAnalytics = () => {
    fetch("http://127.0.0.1:8000/api/analytics")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.analytics)
        }
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    // initial load
    loadAnalytics()

    // 🔥 CONNECT WEBSOCKET
    const ws = new WebSocket("ws://127.0.0.1:8000/ws")

    ws.onopen = () => {
      console.log("🟢 WebSocket connected")
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      // 🔥 ONLY UPDATE ON NEW DETECTION
      if (msg.type === "detection") {
        console.log("⚡ New detection received")

        // re-fetch updated analytics
        loadAnalytics()
      }
    }

    ws.onerror = (err) => {
      console.error("WebSocket error:", err)
    }

    ws.onclose = () => {
      console.log("🔴 WebSocket disconnected")
    }

    return () => ws.close()
  }, [])

  if (!data) {
    return <div className="p-6">Loading analytics...</div>
  }

  const pieData = [
    { name: "Safe", value: data.safe_count },
    { name: "Danger", value: data.danger_count },
  ]

  const barData = Object.entries(data.scam_types || {}).map(
    ([type, count]) => ({
      type,
      count,
    })
  )

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-xl font-bold">Analytics Dashboard</h1>

      {/* 🔢 CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-panel rounded">
          <p>Total</p>
          <h2>{data.total_scans}</h2>
        </div>

        <div className="p-4 bg-red-500/20 rounded">
          <p>Danger</p>
          <h2>{data.danger_count}</h2>
        </div>

        <div className="p-4 bg-green-500/20 rounded">
          <p>Safe</p>
          <h2>{data.safe_count}</h2>
        </div>

        <div className="p-4 bg-yellow-500/20 rounded">
          <p>Avg Score</p>
          <h2>{data.average_score}</h2>
        </div>
      </div>

      {/* 📊 CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        {/* PIE */}
        <div className="bg-panel p-4 rounded">
          <h2 className="mb-3">Safe vs Danger</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80} label>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="bg-panel p-4 rounded">
          <h2 className="mb-3">Scam Types</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  )
}