from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/analytics")
async def get_analytics(request: Request):
    store = request.app.state.store

    data = store.get_recent(limit=200)

    total = len(data)
    danger = sum(1 for d in data if d.get("status") == "danger")
    safe = sum(1 for d in data if d.get("status") == "safe")

    avg_score = (
        sum(d.get("risk_score", 0) for d in data) / total
        if total else 0
    )

    scam_types = {}
    for d in data:
        t = d.get("type", "unknown")
        scam_types[t] = scam_types.get(t, 0) + 1

    return {
        "success": True,
        "analytics": {
            "total_scans": total,
            "danger_count": danger,
            "safe_count": safe,
            "average_score": round(avg_score, 2),
            "scam_types": scam_types
        }
    }