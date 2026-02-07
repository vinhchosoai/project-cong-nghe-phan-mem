import json
from typing import Callable, List, Dict
import redis.asyncio as redis
from app.core.config import settings
from app.core.context import get_tenant_id
class OrderBroadcaster:
    def __init__(self):
        self.redis_client: redis.Redis = None
        self.subscribers: Dict[str, List[Callable]] = {}
    async def connect(self):
        self.redis_client = await redis.from_url(settings.redis_url, decode_responses=True)
    async def disconnect(self):
        if self.redis_client:
            await self.redis_client.close()
    async def publish_order_created(self, order_data: dict):
        tenant_id = get_tenant_id()
        channel = f"orders:{tenant_id}"
        message = {
            "event": "order_created",
            "data": order_data
        }
        await self.redis_client.publish(channel, json.dumps(message))
    async def publish_order_updated(self, order_id: str, update_data: dict):
        tenant_id = get_tenant_id()
        channel = f"orders:{tenant_id}"
        message = {
            "event": "order_updated",
            "order_id": order_id,
            "data": update_data
        }
        await self.redis_client.publish(channel, json.dumps(message))
    async def publish_order_status_changed(self, order_id: str, status: str):
        tenant_id = get_tenant_id()
        channel = f"orders:{tenant_id}"
        message = {
            "event": "order_status_changed",
            "order_id": order_id,
            "status": status
        }
        await self.redis_client.publish(channel, json.dumps(message))
    async def publish_table_request(self, request_data: dict):
        tenant_id = get_tenant_id()
        channel = f"orders:{tenant_id}"
        message = {
            "event": "table_request",
            "data": request_data
        }
        await self.redis_client.publish(channel, json.dumps(message))
    async def subscribe(self, tenant_id: str, callback: Callable):
        channel = f"orders:{tenant_id}"
        if channel not in self.subscribers:
            self.subscribers[channel] = []
        self.subscribers[channel].append(callback)
    async def unsubscribe(self, tenant_id: str, callback: Callable):
        channel = f"orders:{tenant_id}"
        if channel in self.subscribers:
            self.subscribers[channel].remove(callback)
    async def listen(self, tenant_id: str):
        pubsub = self.redis_client.pubsub()
        channel = f"orders:{tenant_id}"
        await pubsub.subscribe(channel)
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                callbacks = self.subscribers.get(channel, [])
                for callback in callbacks:
                    await callback(data)
broadcaster = OrderBroadcaster()