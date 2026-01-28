from fastapi import status

class TestGuestOrderAPI:
    def test_create_order_success(self, client, mock_order_service):
        order_payload = {
            "table_id": 5,
            "items": [
                {"menu_item_id": 101, "quantity": 2, "notes": "No spicy"},
                {"menu_item_id": 102, "quantity": 1, "notes": ""}
            ]
        }
        
        mock_service_instance = mock_order_service.return_value
        mock_service_instance.place_order.return_value = {
            "id": "ord_123",
            "status": "PENDING",
            "total_amount": 150000
        }

        headers = {"X-Tenant-ID": "restaurant_abc"}
        response = client.post("/api/v1/guest/orders", json=order_payload, headers=headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["id"] == "ord_123"
        assert data["status"] == "PENDING"
        mock_service_instance.place_order.assert_called_once()

    def test_create_order_empty_items(self, client, mock_order_service):
        order_payload = {
            "table_id": 5,
            "items": []
        }

        headers = {"X-Tenant-ID": "restaurant_abc"}
        response = client.post("/api/v1/guest/orders", json=order_payload, headers=headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_order_status_success(self, client, mock_order_service):
        order_id = "ord_123"
        mock_service_instance = mock_order_service.return_value
        mock_service_instance.get_order_status.return_value = {
            "id": order_id,
            "status": "CONFIRMED",
            "estimated_time": "15 mins"
        }

        headers = {"X-Tenant-ID": "restaurant_abc"}
        response = client.get(f"/api/v1/guest/orders/{order_id}", headers=headers)

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "CONFIRMED"

    def test_create_order_invalid_tenant(self, client):
        order_payload = {
            "table_id": 5,
            "items": [{"menu_item_id": 101, "quantity": 1}]
        }
        
        response = client.post("/api/v1/guest/orders", json=order_payload)

        assert response.status_code == status.HTTP_400_BAD_REQUEST