from typing import Dict, List, Set
from fastapi import WebSocket
import json


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, tenant_id: str, websocket: WebSocket):
        await websocket.accept()
        if tenant_id not in self.active_connections:
            self.active_connections[tenant_id] = []
        self.active_connections[tenant_id].append(websocket)

    def disconnect(self, tenant_id: str, websocket: WebSocket):
        if tenant_id in self.active_connections:
            self.active_connections[tenant_id].remove(websocket)
            if not self.active_connections[tenant_id]:
                del self.active_connections[tenant_id]

    async def broadcast(self, tenant_id: str, message: dict):
        if tenant_id in self.active_connections:
            for connection in self.active_connections[tenant_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    pass

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    def get_active_connections(self, tenant_id: str) -> List[WebSocket]:
        return self.active_connections.get(tenant_id, [])

    def get_connection_count(self, tenant_id: str) -> int:
        return len(self.active_connections.get(tenant_id, []))


manager = ConnectionManager()
