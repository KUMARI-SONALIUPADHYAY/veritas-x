// ===============================
// VERITAS X CONTENT SCRIPT (FULL)
// ===============================

if (!window.__vx_loaded) {
  console.log('[VERITAS X] Loaded')
  window.__vx_loaded = true
}

// ===============================
// 🔥 MAIN MESSAGE HANDLER
// ===============================
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  try {
    if (!msg?.type) return

    // ===============================
    // 📄 SCAN FULL PAGE
    // ===============================
    if (msg.type === "VX_SCAN_PAGE") {
      const text = document.body.innerText || ""

      const res = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })

      const data = await res.json()
      console.log("[VERITAS X] Scan result:", data)

      const result = data?.result || {}

      handleResult(result)

      sendResponse({ result })
      return true
    }

    // ===============================
    // ✂️ SCAN SELECTED TEXT
    // ===============================
    if (msg.type === "VX_SCAN_SELECTION") {
      const selection = window.getSelection().toString()

      const res = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selection })
      })

      const data = await res.json()
      const result = data?.result || {}

      handleResult(result)

      sendResponse({ result })
      return true
    }

  } catch (err) {
    console.error("[VERITAS X] ERROR:", err)
    sendResponse({ error: err.message })
  }
})

// ===============================
// 🎯 RESULT HANDLER
// ===============================
function handleResult(result) {
  if (!result) return

  if (result.status === "DANGER") {
    showDangerOverlay(result)
  } else {
    showToast(result)
  }
}

// ===============================
// ⚠️ DANGER OVERLAY
// ===============================
function showDangerOverlay(result) {
  try {
    document.getElementById('vx-danger-overlay')?.remove()

    const reasons = result?.reasons || []
    const scamType = result?.type || 'Threat Detected'
    const score = Math.round(result?.risk_score || 0)

    const overlay = document.createElement('div')
    overlay.id = 'vx-danger-overlay'

    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
     background: rgba(0,0,0,0.8);
     backdrop-filter: blur(8px);
      color: white;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
    `

    overlay.innerHTML = `
      <div style="max-width: 520px; text-align: center; padding: 30px;">
        <div style="font-size: 50px;">⚠️</div>

        <h1 style="font-size: 26px; margin-top: 10px; color: #fecaca;">
          HIGH RISK SCAM DETECTED
        </h1>

        <h2 style="color:#f87171; margin-top:10px;">
         ⚠️ DO NOT ENTER ANY INFORMATION
        </h2>
    

        <p>Type: <strong style="color:#f87171;">${scamType}</strong></p>
        <p>Risk Score: ${score}/100</p>

        <div style="margin-top: 18px; text-align: left;">
          ${reasons.map(r => `<p>• ${r}</p>`).join('')}
        </div>

        <button id="vx-close-btn" style="
          margin-top: 25px;
          padding: 10px 18px;
          background: #dc2626;
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        ">
          Continue Anyway
        </button>
      </div>
    `

    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg')
    audio.play().catch(() => {})

    document.body.appendChild(overlay)

    document.getElementById('vx-close-btn').onclick = () => {
      overlay.remove()
    }

  } catch (e) {
    console.error('Overlay error:', e)
  }
}

// ===============================
// 🔔 TOAST
// ===============================
function showToast(result) {
  try {
    const node = document.createElement('div')

    node.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #111827;
      color: white;
      padding: 12px 16px;
      border-radius: 10px;
      z-index: 999999;
      font-size: 13px;
      box-shadow: 0 0 10px rgba(0,0,0,0.4);
    `

    node.innerHTML = `
      <strong>${result.status?.toUpperCase()}</strong> | Risk ${result.risk_score ?? 0}<br>
      ${(result.reasons || []).slice(0,2).join('<br>')}
    `

    document.body.appendChild(node)

    setTimeout(() => node.remove(), 4000)

  } catch (e) {
    console.error('Toast error:', e)
  }
}
setTimeout(() => {
  chrome.runtime.sendMessage({ type: "VX_SCAN_PAGE" })
}, 1500)

setTimeout(() => {
  try {
    const text = document.body.innerText.slice(0, 2000)

    fetch('http://127.0.0.1:8000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    .then(res => res.json())
    .then(data => {
      if (data?.result?.status === 'DANGER') {
        showDangerOverlay(data.result)
      }
    })
  } catch (e) {
    console.error('Auto scan error:', e)
  }
}, 2000)