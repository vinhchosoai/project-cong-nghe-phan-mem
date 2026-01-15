import re
from typing import Any
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import as_declarative, declared_attr

@as_declarative()
class Base:
    id: Any
    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        return re.sub(r'(?<!^)(?=[A-Z])', '_', cls.__name__).lower() + "s"

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)