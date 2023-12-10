from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
from datetime import datetime

from database import db_dependency
import models, utils

router = APIRouter(
    prefix="/admins",
    tags=["admins"]
)

class RequestBase(BaseModel):
    poster_id: int
    isbn_list: List[str]
    no_of_copies_list: List[int]
    book_condition_list: List[str]

class SellRequestBase(BaseModel):
    request_info: RequestBase
    price: int

class ExchangeRequestBase(BaseModel):
    request_info: RequestBase
    wishlist_description: str


@router.get("/sell-analysis/books", status_code=status.HTTP_200_OK)
async def analyze_sell_requests(db: db_dependency, 
                                book_title: Optional[str] = None,
                                seller_name: Optional[str] = None, 
                                price_limit: Optional[float] = None,
                                status: Optional[str] = "All", 
                                post_before: Optional[datetime] = None,
                                post_after: Optional[datetime] = None,
                                descending: Optional[bool] = True):
    result = db.query(
            models.SellExchange.isbn,
            func.avg(models.SellingRequest.price).label('avg_price'),
            func.sum(models.SellExchange.no_of_copies).label('total_quantity')
        )
    result = result.join(models.SellingRequest, models.SellExchange.request_id == models.SellingRequest.request_id)
    result = result.join(models.Request, models.SellExchange.request_id == models.Request.request_id)
    if book_title is not None:
        result = result.join(models.BookIsbns, models.SellExchange.isbn == models.BookIsbns.isbn)
        result = result.join(models.Book, models.BookIsbns.edition_id == models.Book.edition_id)
        result = result.filter(models.Book.title.ilike(f"%{book_title}%"))
    if seller_name is not None:
        result = result.join(models.User, models.Request.poster_id == models.User.user_id).filter(models.User.username == seller_name)
    if price_limit is not None:
        result = result.filter(models.SellingRequest.price <= price_limit)
    if status != "All":
        result = result.filter(models.Request.status == status)
    if post_before is not None:
        result = result.filter(models.Request.posting_time <= post_before)
    if post_after is not None:
        result = result.filter(models.Request.posting_time >= post_after)
    result = result.group_by(models.SellExchange.isbn)
    if descending:
        result = result.order_by(func.sum(models.SellExchange.no_of_copies).desc())
    else: 
        result = result.order_by(func.sum(models.SellExchange.no_of_copies))
    result = result.all()
    result = [{
            "isbn": row.isbn,
            "avg_price": row.avg_price,
            "total_quantity": row.total_quantity
        } for row in result]
    return result


@router.get("/exchange-analysis/books", status_code=status.HTTP_200_OK)
async def analyze_exchange_requests(db: db_dependency, 
                                    book_title: Optional[str] = None,
                                    seller_name: Optional[str] = None, 
                                    description: Optional[str] = None,
                                    status: Optional[str] = "All", 
                                    post_before: Optional[datetime] = None,
                                    post_after: Optional[datetime] = None,
                                    descending: Optional[bool] = True):
    result = db.query(
            models.SellExchange.isbn,
            func.sum(models.SellExchange.no_of_copies).label('total_quantity')
        )
    result = result.join(models.ExchangeRequest, models.SellExchange.request_id == models.ExchangeRequest.request_id)
    result = result.join(models.Request, models.SellExchange.request_id == models.Request.request_id)
    if book_title is not None:
        result = result.join(models.BookIsbns, models.SellExchange.isbn == models.BookIsbns.isbn)
        result = result.join(models.Book, models.BookIsbns.edition_id == models.Book.edition_id)
        result = result.filter(models.Book.title.ilike(f"%{book_title}%"))
    if seller_name is not None:
        result = result.join(models.User, models.Request.poster_id == models.User.user_id).filter(models.User.username == seller_name)
    if description is not None:
        result = result.filter(func.lower(models.ExchangeRequest.wishlist_description).contains(func.lower(description)))
    if status != "All":
        result = result.filter(models.Request.status == status)
    if post_before is not None:
        result = result.filter(models.Request.posting_time <= post_before)
    if post_after is not None:
        result = result.filter(models.Request.posting_time >= post_after)
    result = result.group_by(models.SellExchange.isbn)
    if descending:
        result = result.order_by(func.sum(models.SellExchange.no_of_copies).desc())
    else: 
        result = result.order_by(func.sum(models.SellExchange.no_of_copies))
    result = result.all()
    result = [{
            "isbn": row.isbn,
            "total_quantity": row.total_quantity
        } for row in result]
    return result

