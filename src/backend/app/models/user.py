from sqlalchemy import Column, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    __tablename__ = "User"
    
    userID = Column(String(50), primary_key = True, index = True)
    userName = Column(String(100), nullable = False)
    email = Column(String(255), True, nullable = False)
    phoneNumber = Column(String(20))
    password = Column(String(255), nullable= False)
    
    tenants = relationship("Tenant", back_poplates = "owner")
    staff_roles = relationship("Staff", back_populates = "user")
    
class Tenant(Base):
    __tablename__ = "Tenant"

    tenantID = Column(String(50), primary_key=True)
    userID = Column(String(50), ForeignKey("User.userID"), nullable=False)

    owner = relationship("User", back_populates="tenants")
    restaurants = relationship("Restaurant", back_populates="tenant")