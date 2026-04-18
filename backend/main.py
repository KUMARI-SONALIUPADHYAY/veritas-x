from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ✅ ALWAYS use backend.*
from backend.database.mongo import get_store
from backend.routers.analyze import router as analyze_router
from backend.routers.analytics import router as analytics_router


# ===============================
# 🔌 WebSocket Manager
# ===============================
class WebSocketHub:
    def __init__(self) -> None:
        self._clients: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._clients.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._clients.discard(websocket)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        async with self._lock:
            clients = list(self._clients)

        for client in clients:
            try:
                await client.send_json(payload)
            except Exception:
                pass


# ===============================
# ⚙️ App Lifecycle
# ===============================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting VERITAS X backend...")

    app.state.store = get_store()
    app.state.hub = WebSocketHub()

    yield

    print("🛑 Shutting down VERITAS X backend...")


# ===============================
# 🚀 FastAPI App
# ===============================
app = FastAPI(
    title="VERITAS X Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===============================
# 📡 ROUTES
# ===============================
app.include_router(analyze_router, prefix="/api", tags=["analysis"])
app.include_router(analytics_router, prefix="/api", tags=["analytics"])


# ===============================
# ❤️ Health Check
# ===============================
@app.get("/")
async def root():
    return {"message": "VERITAS X Backend Running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


# ===============================
# 🔌 WebSocket Endpoint
# ===============================
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    hub: WebSocketHub = app.state.hub
    store = app.state.store

    await hub.connect(websocket)

    try:
        # send initial stats
        await websocket.send_json({
            "type": "stats",
            "stats": store.get_stats()
        })

        # send recent detections
        await websocket.send_json({
            "type": "recent",
            "detections": store.get_recent(limit=20)
        })

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        await hub.disconnect(websocket)

    except Exception:
        await hub.disconnect(websocket)