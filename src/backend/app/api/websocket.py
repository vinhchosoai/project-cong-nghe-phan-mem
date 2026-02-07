from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websockets.manager import manager
from app.websockets.broadcaster import broadcaster
from app.core.context import set_tenant_id
import asyncio
import json
router = APIRouter(prefix="/ws", tags=["WebSocket"])
@router.websocket("/orders/{tenant_id}")
async def websocket_orders(websocket: WebSocket, tenant_id: str):
    await manager.connect(tenant_id, websocket)
    set_tenant_id(tenant_id)
    listen_task = None
    try:
        async def broadcast_callback(message: dict):
            await manager.broadcast(tenant_id, message)
        listen_task = asyncio.create_task(broadcaster.listen(tenant_id))
        while True:
            data = await websocket.receive_text()
            if data:
                try:
                    message = json.loads(data)
                    await manager.broadcast(tenant_id, {
                        "type": "user_message",
                        "data": message
                    })
                except json.JSONDecodeError:
                    pass
    except WebSocketDisconnect:
        manager.disconnect(tenant_id, websocket)
    finally:
        if listen_task:
            listen_task.cancel()
            try:
                await listen_task
            except asyncio.CancelledError:
                pass