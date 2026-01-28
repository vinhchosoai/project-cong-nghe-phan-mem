import pytest
from app.services.menu_service import MenuService
from app.schemas.menu import MenuItemCreate, MenuItemUpdate
from app.core.exceptions import BusinessLogicException

class TestMenuService:
    @pytest.fixture
    def menu_service(self, mock_db_session):
        return MenuService(db=mock_db_session)

    def test_create_menu_item_success(self, menu_service, mock_db_session):
        item_data = MenuItemCreate(
            name="Pho Bo",
            price=50000,
            description="Traditional Beef Noodle",
            category_id=1,
            is_available=True
        )
        
        mock_repo = MagicMock()
        menu_service.menu_repo = mock_repo
        mock_repo.create.return_value = item_data

        result = menu_service.create_menu_item(restaurant_id=1, item_in=item_data)

        assert result.name == "Pho Bo"
        assert result.price == 50000
        mock_repo.create.assert_called_once()

    def test_create_menu_item_negative_price(self, menu_service):
        item_data = MenuItemCreate(
            name="Pho Bo",
            price=-10000,
            description="Invalid Price",
            category_id=1
        )

        with pytest.raises(BusinessLogicException):
            menu_service.create_menu_item(restaurant_id=1, item_in=item_data)

    def test_update_menu_item_availability(self, menu_service):
        item_id = 10
        update_data = MenuItemUpdate(is_available=False)
        
        mock_repo = MagicMock()
        menu_service.menu_repo = mock_repo
        existing_item = MagicMock()
        existing_item.id = item_id
        existing_item.restaurant_id = 1
        mock_repo.get_by_id.return_value = existing_item
        mock_repo.update.return_value = MagicMock(id=item_id, is_available=False)

        result = menu_service.update_menu_item(restaurant_id=1, item_id=item_id, item_in=update_data)

        assert result.is_available is False
        mock_repo.update.assert_called_once()

    def test_delete_menu_item_not_found(self, menu_service):
        mock_repo = MagicMock()
        menu_service.menu_repo = mock_repo
        mock_repo.get_by_id.return_value = None

        with pytest.raises(BusinessLogicException):
            menu_service.delete_menu_item(restaurant_id=1, item_id=999)