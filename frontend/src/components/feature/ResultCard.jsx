import { ShieldCheck, ShieldAlert } from 'lucide-react'

export default function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="vx-glass p-6 rounded-xl text-center text-muted-text">
        Run a scan to see results
      </div>
    )
  }

  // 🎯 Risk level
  const level =
    result.risk_score > 80 ? "CRITICAL" :
    result.risk_score > 50 ? "HIGH" :
    result.risk_score > 20 ? "MEDIUM" : "LOW"

  const isSafe = result.status?.toLowerCase() === 'safe'

  // 📄 Download JSON
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "report.json"
    a.click()
  }

  // 🔗 Share link
  const share = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied!")
  }

  return (
    <div className="vx-glass p-6 rounded-xl space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSafe ? (
            <ShieldCheck className="text-green-400" />
          ) : (
            <ShieldAlert className="text-red-400" />
          )}

          <div>
            <p className="text-sm text-muted-text">Scan Verdict</p>

            <h2 className="text-lg font-semibold">
              {result.type || 'Analysis'}
            </h2>

            {/* 🌐 DOMAIN */}
            <p className="text-xs text-yellow-400">
              Domain: {result.domain || "unknown"}
            </p>

            {/* 🔥 BADGES */}
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-[10px] rounded ${
                level === 'CRITICAL'
                  ? 'bg-red-600/20 text-red-400'
                  : level === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-400'
                  : level === 'MEDIUM'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {level}
              </span>

              <span className="text-xs text-purple-400">
                AI Confidence Model v1.2
              </span>

              <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 rounded">
                ML Powered
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted-text">Score</p>
          <p className="text-xl font-bold">{result.risk_score || 0}</p>
        </div>
      </div>

      {/* STATUS */}
      <div
        className={`p-3 rounded-lg text-sm font-medium ${
          isSafe
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        }`}
      >
        {isSafe
          ? 'No suspicious patterns detected'
          : 'HIGH RISK SCAM DETECTED — DO NOT PROCEED'}
      </div>

      {/* CONFIDENCE BAR */}
      <div>
        <p className="text-xs text-muted-text mb-1">Confidence</p>
        <div className="w-full h-2 bg-gray-700 rounded">
          <div
            className="h-2 rounded bg-gradient-to-r from-green-400 to-red-500"
            style={{ width: `${result.confidence || result.risk_score || 0}%` }}
          />
        </div>
      </div>

      {/* REASONS */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-text mb-1">WHY FLAGGED?</p>
          <ul className="space-y-1">
            {(result.reasons || []).map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-muted-text mb-1">SOURCES</p>
          <p className="text-muted-text">No source links available.</p>
        </div>
      </div>

      {/* 🔥 ACTION BUTTONS */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => window.print()}
          className="px-3 py-1 text-xs bg-blue-500/20 rounded"
        >
          Download PDF
        </button>

        <button
          onClick={downloadJSON}
          className="px-3 py-1 text-xs bg-green-500/20 rounded"
        >
          Export JSON
        </button>

        <button
          onClick={share}
          className="px-3 py-1 text-xs bg-purple-500/20 rounded"
        >
          Share
        </button>
      </div>

    </div>
  )
}