import { useEffect, useState } from "react"

export default function useDashboardData() {
  const [stats, setStats] = useState({})
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    fetchInitial()
    connectWS()
  }, [])

  const fetchInitial = async () => {
    try {
      const resStats = await fetch("http://127.0.0.1:8000/api/analytics")
      const statsData = await resStats.json()

      const resRecent = await fetch("http://127.0.0.1:8000/api/recent")
      const recentData = await resRecent.json()

      setStats(statsData)
      setDetections(recentData.detections || [])
    } catch (e) {
      console.error("API error", e)
    } finally {
      setLoading(false)
    }
  }

  const connectWS = () => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws")

    ws.onopen = () => {
      setIsConnected(true)
    }

    ws.onclose = () => {
      setIsConnected(false)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "detection") {
        setDetections(prev => [data.detection, ...prev])
      }

      if (data.type === "stats") {
        setStats(data.stats)
      }
    }
  }

  return { stats, detections, loading, isConnected }
}