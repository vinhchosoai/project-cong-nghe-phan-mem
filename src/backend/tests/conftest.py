import pytest
import sys
import os
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

# Add backend app to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

@pytest.fixture
def mock_db_session():
    """Mock database session"""
    return MagicMock()

@pytest.fixture
def client():
    """TestClient fixture for API testing"""
    return TestClient(app)

@pytest.fixture
def mock_menu_service(mocker):
    """Mock MenuService"""
    return mocker.patch("app.services.menu_service.MenuService")

@pytest.fixture
def mock_order_service(mocker):
    """Mock OrderService"""
    return mocker.patch("app.services.order_service.OrderService")

@pytest.fixture
def mock_auth_service(mocker):
    """Mock AuthService"""
    return mocker.patch("app.services.auth_service.AuthService")

@pytest.fixture
def mock_restaurant_service(mocker):
    """Mock RestaurantService"""
    return mocker.patch("app.services.restaurant_service.RestaurantService")

@pytest.fixture
def sample_tenant_id():
    """Sample tenant ID for testing"""
    return "restaurant_abc"

@pytest.fixture
def sample_headers(sample_tenant_id):
    """Sample headers with tenant ID"""
    return {"X-Tenant-ID": sample_tenant_id}

@pytest.fixture
def sample_order_payload():
    """Sample order payload"""
    return {
        "table_id": 5,
        "items": [
            {"menu_item_id": 101, "quantity": 2, "notes": "No spicy"},
            {"menu_item_id": 102, "quantity": 1, "notes": ""}
        ]
    }

@pytest.fixture
def sample_menu_item():
    """Sample menu item"""
    return {
        "category_id": "cat_001",
        "name": "Phở Bò",
        "description": "Vietnamese beef noodle soup",
        "price": 75000,
        "is_available": True,
        "rating": 4.5
    }