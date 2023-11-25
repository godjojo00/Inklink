from sqlalchemy import Column, Float, ForeignKey, Integer, String, DateTime, Text, ForeignKeyConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = 'user'

    user_id: int = Column(Integer, primary_key=True, autoincrement=True)
    username: str = Column(String(20), nullable=False, unique=True)
    password: str = Column(String(15), nullable=False)
    email: str = Column(String(50), nullable=False)
    phone_number: str = Column(String(10), nullable=False)
    agg_rating: float = Column(Float)
    role: str = Column(String(10), nullable=False, server_default="user")
    
    __table_args__ = (
        CheckConstraint(role.in_(['user', 'admin']), name='role_check'),
    )

class Book(Base):
    __tablename__ = 'book_editions'

    title: str = Column(Text, nullable=False)
    edition_name: str = Column(Text)
    subtitle: str = Column(Text)
    edition_id: int = Column(Integer, primary_key=True, autoincrement=True)

    authors = relationship("BookAuthors", back_populates="book")
    isbns = relationship("BookIsbns", back_populates="book")

class BookAuthors(Base):
    __tablename__ = 'book_authors'

    edition_id: int = Column(Integer, ForeignKey('book_editions.edition_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    author_name: str = Column(Text, primary_key=True)

    book = relationship("Book", back_populates="authors")

class BookIsbns(Base):
    __tablename__ = 'book_isbns'

    edition_id: int = Column(Integer, ForeignKey('book_editions.edition_id', ondelete='CASCADE', onupdate='CASCADE'))
    isbn: str = Column(String(13), primary_key=True)

    book = relationship("Book", back_populates="isbns")


class Request(Base):
    __tablename__ = 'request'

    request_id: int = Column(Integer, primary_key=True, autoincrement=True)
    status: str = Column(String(15), nullable=False)
    posting_time: datetime = Column(DateTime, nullable=False)
    poster_id: int = Column(Integer, ForeignKey('user.user_id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    is_type: str = Column(String(10), nullable=False)

    selling_requests = relationship("SellingRequest", back_populates="request")
    exchange_requests = relationship("ExchangeRequest", back_populates="request")
    
    __table_args__ = (
        CheckConstraint(status.in_(['Accepted', 'Deleted', 'Remained']), name='status_check'),
        CheckConstraint(is_type.in_(['Exchange', 'Sell']), name='is_type_check'),
    )

class SellingRequest(Base):
    __tablename__ = 'selling_request'

    request_id: int = Column(Integer, ForeignKey('request.request_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    price: int = Column(Integer, nullable=False)
    buyer_id: int = Column(Integer, ForeignKey('user.user_id', ondelete='CASCADE', onupdate='CASCADE'))
    buying_time: datetime = Column(DateTime)

    request = relationship("Request", back_populates="selling_requests")

class ExchangeRequest(Base):
    __tablename__ = 'exchange_request'

    request_id: int = Column(Integer, ForeignKey('request.request_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    wishlist_description: str = Column(String())

    request = relationship("Request", back_populates="exchange_requests")

class ExchangeResponse(Base):
    __tablename__ = 'exchange_response'

    response_id: int = Column(Integer, primary_key=True, autoincrement=True)
    status: str = Column(String(15), nullable=False)
    response_time: datetime = Column(DateTime, nullable=False)
    responder_id: int = Column(Integer, ForeignKey('user.user_id', ondelete='CASCADE', onupdate='CASCADE'))
    request_id: int = Column(Integer, ForeignKey('request.request_id', ondelete='CASCADE', onupdate='CASCADE'))
    
    __table_args__ = (
        CheckConstraint(status.in_(['Accepted', 'Deleted', 'Rejected', 'Available']), name='status_check'),
    )

class ProposeToExchange(Base):
    __tablename__ = 'propose_to_exchange'

    response_id: int = Column(Integer, ForeignKey('ExchangeResponse.response_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    isbn: str = Column(String(13), ForeignKey('book_isbns.isbn', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    no_of_copies: int = Column(Integer, nullable=False)
    book_condition: str = Column(String(10), nullable=False)

class SellExchange(Base):
    __tablename__ = 'sell_exchange'

    request_id: int = Column(Integer, ForeignKey('request.request_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    isbn: str = Column(String(13), ForeignKey('book_isbns.isbn', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    no_of_copies: int = Column(Integer, nullable=False)
    book_condition: str = Column(String(10), nullable=False)

    request = relationship("Request")
    book = relationship("BookIsbns")

class Owns(Base):
    __tablename__ = 'owns'

    owner_id: int = Column(Integer, ForeignKey('user.user_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    isbn: str = Column(String(13), ForeignKey('book_isbns.isbn', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    no_of_copies: int = Column(Integer, nullable=False)

class Rating(Base):
    __tablename__ = 'rating'

    rating_user_id: int = Column(Integer, ForeignKey('user.user_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    rated_user_id: int = Column(Integer, ForeignKey('user.user_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    request_id: int = Column(Integer, ForeignKey('request.request_id', ondelete='CASCADE', onupdate='CASCADE'), primary_key=True)
    rating_time: datetime = Column(DateTime, nullable=False)
    score: int = Column(Integer, nullable=False)

    rated_user = relationship("User", foreign_keys=[rated_user_id])
    rating_user = relationship("User", foreign_keys=[rating_user_id])
    request = relationship("Request", foreign_keys=[request_id])
