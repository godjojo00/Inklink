from sqlalchemy import Column, Float, ForeignKey, Integer, String, text
from database import Base

class User(Base):
    __tablename__ = 'user'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(20), nullable=False, unique=True)
    password = Column(String(15), nullable=False)
    email = Column(String(50), nullable=False)
    phone_number = Column(String(10), nullable=False)
    agg_rating = Column(Float)
    role = Column(String(10), nullable=False, server_default="user")