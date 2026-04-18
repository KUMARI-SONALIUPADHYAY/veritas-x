from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Request

# ===============================
# IMPORTS
# ===============================
from backend.models.schemas import (
    AnalysisRequest,
    ImageAnalysisRequest,
    VideoAnalysisRequest,
)

from backend.services.image_engine import analyze_image_payload
from backend.services.reasoning_engine import build_final_result
from backend.services.text_engine import analyze_text_payload
from backend.services.video_engine import analyze_video_payload
from backend.services.web_engine import analyze_web_payload

from backend.utils.domain_utils import analyze_domain

router = APIRouter()


# ===============================
# STORE + BROADCAST
# ===============================
async def _store_and_broadcast(
    request: Request,
    result: dict[str, Any],
    payload: dict[str, Any],
    modality: str,
) -> dict[str, Any]:

    store = request.app.state.store
    hub = request.app.state.hub
    import uuid
    detection = {
        "id": str(uuid.uuid4()),
        **result,
        "modality": modality,
        "timestamp": result.get("timestamp")
        or datetime.now(timezone.utc).isoformat(),
        "url": payload.get("url")
        or payload.get("video_url")
        or payload.get("page_url")
        or payload.get("source_url")
        or "manual_input",
        "title": payload.get("title") or payload.get("page_title") or "",
        "source": payload.get("source") or "backend",
        "payload": payload,
    }


    saved = store.save_detection(detection)

    # 🔥 broadcast detection
    await hub.broadcast({"type": "detection", "detection": saved})

    return saved


# ===============================
# SMART REASONS + SCORING
# ===============================
def generate_reasons_and_score(text: str) -> tuple[list[str], int]:
    reasons = []
    score = 0
    text = (text or "").lower()

    if "otp" in text:
        reasons.append("Sensitive OTP request detected")
        score += 40

    if "urgent" in text or "now" in text:
        reasons.append("Urgent pressure language detected")
        score += 20

    if "click" in text or "verify" in text:
        reasons.append("Phishing behavior detected")
        score += 20

    if "upi" in text or "payment" in text:
        reasons.append("Suspicious payment request detected")
        score += 30

    if "winner" in text or "lottery" in text:
        reasons.append("Too-good-to-be-true offer detected")
        score += 30

    return reasons, min(score, 100)


def detect_scam_type(text: str) -> str:
    text = (text or "").lower()

    if "otp" in text:
        return "OTP Scam"
    if "upi" in text or "payment" in text:
        return "UPI Fraud"
    if "lottery" in text or "winner" in text:
        return "Lottery Scam"

    return "General Risk"


# ===============================
# MAIN ANALYZE
# ===============================
@router.post("/analyze")
async def analyze(payload: AnalysisRequest, request: Request):

    data = payload.model_dump(exclude_none=True)

    # Detect web vs text
    is_web = bool(
        data.get("links")
        or data.get("images")
        or data.get("forms")
        or data.get("html")
        or data.get("scripts")
    )

    engine_result = (
        analyze_web_payload(data)
        if is_web
        else analyze_text_payload(data)
    )

    final_result = await build_final_result(
        data,
        engine_result,
        modality="web" if is_web else "text",
    )

    # ===============================
    # 🔥 DOMAIN ANALYSIS (NEW)
    # ===============================
    url = data.get("url", "")
    domain_info = analyze_domain(url)

    # ===============================
    # 🔥 TEXT ANALYSIS
    # ===============================
    text = data.get("text", "")
    reasons, rule_score = generate_reasons_and_score(text)

    # ===============================
    # MERGE SCORES
    # ===============================
    base_score = final_result.get("risk_score", 0)
    risk_score = max(base_score, rule_score) + domain_info["domain_score"]
    risk_score = min(risk_score, 100)

    reasons.extend(domain_info["domain_reasons"])

    scam_type = detect_scam_type(text)

    # ===============================
    # STORE RESULT
    # ===============================
    final_result["risk_score"] = risk_score

    saved = await _store_and_broadcast(
        request,
        final_result,
        data,
        final_result.get("modality", "text"),
    )

    # broadcast stats
    await request.app.state.hub.broadcast(
        {
            "type": "stats",
            "stats": request.app.state.store.get_stats(),
        }
    )

    # ===============================
    # CLEAN RESPONSE FOR FRONTEND
    # ===============================
    return {
        "success": True,
        "result": {
            "status": saved.get("status", "safe").upper(),
            "risk_score": risk_score,
            "confidence": risk_score,
            "type": scam_type,
            "reasons": reasons
            if reasons
            else ["No suspicious patterns detected"],
        },
    }


# ===============================
# IMAGE
# ===============================
@router.post("/analyze-image")
async def analyze_image(payload: ImageAnalysisRequest, request: Request):
    data = payload.model_dump(exclude_none=True)

    engine_result = analyze_image_payload(data)
    final_result = await build_final_result(data, engine_result, modality="image")

    saved = await _store_and_broadcast(request, final_result, data, "image")

    await request.app.state.hub.broadcast(
        {"type": "stats", "stats": request.app.state.store.get_stats()}
    )

    return {"success": True, "result": saved}


# ===============================
# VIDEO
# ===============================
@router.post("/analyze-video")
async def analyze_video(payload: VideoAnalysisRequest, request: Request):
    data = payload.model_dump(exclude_none=True)

    engine_result = analyze_video_payload(data)
    final_result = await build_final_result(data, engine_result, modality="video")

    saved = await _store_and_broadcast(request, final_result, data, "video")

    await request.app.state.hub.broadcast(
        {"type": "stats", "stats": request.app.state.store.get_stats()}
    )

    return {"success": True, "result": saved}


# ===============================
# STATS
# ===============================
@router.get("/stats")
async def stats(request: Request):
    return {
        "success": True,
        "stats": request.app.state.store.get_stats(),
    }


# ===============================
# RECENT
# ===============================
@router.get("/recent")
async def recent(request: Request, limit: int = 80):
    return {
        "success": True,
        "detections": request.app.state.store.get_recent(limit=limit),
    }


# ===============================
# ANALYTICS (FINAL)
# ===============================
@router.get("/analytics")
async def analytics(request: Request):

    data = request.app.state.store.get_recent(limit=200)

    total = len(data)

    danger = sum(
        1 for d in data if str(d.get("status", "")).lower() == "danger"
    )
    safe = sum(
        1 for d in data if str(d.get("status", "")).lower() == "safe"
    )

    avg_score = (
        sum(d.get("risk_score", 0) for d in data) / total
        if total
        else 0
    )

    # 🔥 scam type distribution
    scam_types = {}
    for d in data:
        t = d.get("type", "unknown") or "unknown"
        scam_types[t] = scam_types.get(t, 0) + 1

    return {
        "success": True,
        "analytics": {
            "total_scans": total,
            "danger_count": danger,
            "safe_count": safe,
            "average_score": round(avg_score, 2),
            "scam_types": scam_types,
        },
    }