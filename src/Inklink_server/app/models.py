from sqlalchemy import Column, Float, ForeignKey, Integer, String, DateTime, Text, ForeignKeyConstraint, CheckConstraint
from sqlalchemy.orm import relationship
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
    
    __table_args__ = (
        CheckConstraint(role.in_(['user', 'admin']), name='role_check'),
    )

class Book(Base):
    __tablename__ = 'book'

    isbn = Column(String(13), primary_key=True)
    title = Column(String(255), nullable=False)
    edition = Column(Integer, nullable=False)

    authors = relationship("BookAuthors", back_populates="book")
    categories = relationship("BookCategories", back_populates="book")

class BookAuthors(Base):
    __tablename__ = 'book_authors'

    isbn = Column(String(13), ForeignKey('book.isbn'), primary_key=True)
    author = Column(String(50), primary_key=True)

    book = relationship("Book", back_populates="authors")

class BookCategories(Base):
    __tablename__ = 'book_categories'

    isbn = Column(String(13), ForeignKey('book.isbn'), primary_key=True)
    category = Column(String(10), primary_key=True)

    book = relationship("Book", back_populates="categories")
    
    __table_args__ = (
        CheckConstraint(category.in_(['textbook', 'others']), name='category_check'), 
    )

class Request(Base):
    __tablename__ = 'request'

    request_id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(String(15), nullable=False)
    posting_time = Column(DateTime, nullable=False)
    poster_id = Column(Integer, ForeignKey('user.user_id'), nullable=False)
    is_type = Column(String(10), nullable=False)

    selling_requests = relationship("SellingRequest", back_populates="request")
    exchange_requests = relationship("ExchangeRequest", back_populates="request")
    
    __table_args__ = (
        CheckConstraint(status.in_(['Accepted', 'Deleted', 'Remained']), name='status_check'),
        CheckConstraint(is_type.in_(['Exchange', 'Sell']), name='is_type_check'),
    )

class SellingRequest(Base):
    __tablename__ = 'selling_request'

    request_id = Column(Integer, ForeignKey('request.request_id'), primary_key=True)
    price = Column(Integer, nullable=False)
    buyer_id = Column(Integer, ForeignKey('user.user_id'))
    buying_time = Column(DateTime)

    request = relationship("Request", back_populates="selling_requests")

class ExchangeRequest(Base):
    __tablename__ = 'exchange_request'

    request_id = Column(Integer, ForeignKey('request.request_id'), primary_key=True)
    isbn = Column(String(13), ForeignKey('book.isbn'), primary_key=True)
    no_of_copies = Column(Integer, nullable=False)
    book_condition = Column(String(10), nullable=False)

    request = relationship("Request", back_populates="exchange_requests")

class ExchangeResponse(Base):
    __tablename__ = 'exchange_response'

    response_id = Column(Integer, primary_key=True)
    status = Column(String(15), nullable=False)
    response_time = Column(DateTime, nullable=False)
    responder_id = Column(Integer, ForeignKey('user.user_id'))
    request_id = Column(Integer, ForeignKey('request.request_id'), primary_key=True)
    
    __table_args__ = (
        CheckConstraint(status.in_(['Accepted', 'Deleted', 'Rejected', 'Available']), name='status_check'),
    )

class ProposeToExchange(Base):
    __tablename__ = 'propose_to_exchange'

    response_id = Column(Integer, primary_key=True)
    isbn = Column(String(13), ForeignKey('book.isbn'), primary_key=True)
    no_of_copies = Column(Integer, nullable=False)
    book_condition = Column(String(10), nullable=False)
    request_id = Column(Integer, primary_key=True)

    __table_args__ = (
        ForeignKeyConstraint([response_id, request_id], [ExchangeResponse.response_id, ExchangeResponse.request_id]),
    )

class SellExchange(Base):
    __tablename__ = 'sell_exchange'

    request_id = Column(Integer, ForeignKey('request.request_id'), primary_key=True)
    isbn = Column(String(13), ForeignKey('book.isbn'), primary_key=True)
    no_of_copies = Column(Integer, nullable=False)
    book_condition = Column(String(10), nullable=False)

    request = relationship("Request")
    book = relationship("Book")

class Owns(Base):
    __tablename__ = 'owns'

    owner_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True)
    isbn = Column(String(13), ForeignKey('book.isbn'), primary_key=True)
    no_of_copies = Column(Integer, nullable=False)

class Rating(Base):
    __tablename__ = 'rating'

    rating_user_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True)
    rated_user_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True)
    request_id = Column(Integer, ForeignKey('request.request_id'), primary_key=True)
    rating_time = Column(DateTime, nullable=False)
    score = Column(Integer, nullable=False)

    rated_user = relationship("User", foreign_keys=[rated_user_id])
    rating_user = relationship("User", foreign_keys=[rating_user_id])
    request = relationship("Request", foreign_keys=[request_id])
