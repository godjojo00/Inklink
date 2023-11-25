from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

from database import db_dependency
import models, utils

router = APIRouter(
    prefix="/requests",
    tags=["requests"]
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

@router.post("/sell", status_code=status.HTTP_201_CREATED)
async def create_sell_request(sell_req: SellRequestBase, db: db_dependency):
    have_enough_books = utils.check_enough_books(sell_req.request_info.poster_id, sell_req.request_info.isbn_list, sell_req.request_info.no_of_copies_list, db)
    if not have_enough_books:
        raise HTTPException(status_code=404, detail="The user does not have enough books")
    else:
        new_req = models.Request(
            status = "Remained",
            posting_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            poster_id = sell_req.request_info.poster_id,
            is_type = "Sell"
        )
        db.add(new_req)
        db.commit()

        new_sell_req = models.SellingRequest(
            request_id = new_req.request_id,
            price = sell_req.price
        )
        db.add(new_sell_req)
        db.commit()

        for i in range(len(sell_req.request_info.isbn_list)):
            new_sell_exchange = models.SellExchange(
                request_id = new_req.request_id,
                isbn = sell_req.request_info.isbn_list[i],
                no_of_copies = sell_req.request_info.no_of_copies_list[i],
                book_condition = sell_req.request_info.book_condition_list[i]
            )
            db.add(new_sell_exchange)
            db.commit()
            utils.reduce_copies_owned(sell_req.request_info.poster_id, sell_req.request_info.isbn_list[i], sell_req.request_info.no_of_copies_list[i], db)
    return new_req.request_id

@router.get("/sell/{request_id}", status_code=status.HTTP_200_OK)
async def get_sell_request(request_id: int, db: db_dependency):
    result = db.query(models.SellingRequest, models.Request).join(models.Request, models.SellingRequest.request_id == models.Request.request_id).filter(models.SellingRequest.request_id == request_id).first()
    if result:
        selling_request, request = result
        merged_result = {**selling_request.__dict__, **request.__dict__}
        # Optionally, remove SQLAlchemy internal attribute '_sa_instance_state'
        merged_result.pop('_sa_instance_state', None)
        return merged_result
    else:
        raise HTTPException(status_code=404, detail="Request id not found in selling requests")

@router.patch("/sell/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def buy_sell_request(request_id: int, buyer_id: int, db:db_dependency):
    db_req = db.query(models.Request).filter(models.Request.request_id == request_id).first()
    db_sell_req = db.query(models.SellingRequest).filter(models.SellingRequest.request_id == request_id).first()
    if db_sell_req is None:
        raise HTTPException(status_code=404, detail="Selling request not found")
    if not db_req.status == "Remained":
        raise HTTPException(status_code=400, detail="Selling request is not available")
    if db_req.poster_id == buyer_id:
        raise HTTPException(status_code=400, detail="Cannot buy sell requests posted by yourself")
    db_sell_req.buyer_id = buyer_id
    db_sell_req.buying_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db_req.status = "Accepted"
    db.commit()
    utils.add_copies_owned(buyer_id, request_id, db)
    return

@router.post("/exchange", status_code=status.HTTP_201_CREATED)
async def create_exchange_request(exchange_req: ExchangeRequestBase, db: db_dependency):
    have_enough_books = utils.check_enough_books(exchange_req.request_info.poster_id, exchange_req.request_info.isbn_list, exchange_req.request_info.no_of_copies_list, db)
    if not have_enough_books:
        raise HTTPException(status_code=404, detail="The user does not have enough books")
    else:
        new_req = models.Request(
            status = "Remained",
            posting_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            poster_id = exchange_req.request_info.poster_id,
            is_type = "Exchange"
        )
        db.add(new_req)
        db.commit()

        new_ex_req = models.ExchangeRequest(
            request_id = new_req.request_id,
            wishlist_description = exchange_req.wishlist_description
        )
        db.add(new_ex_req)
        db.commit()

        for i in range(len(exchange_req.request_info.isbn_list)):
            new_sell_exchange = models.SellExchange(
                request_id = new_req.request_id,
                isbn = exchange_req.request_info.isbn_list[i],
                no_of_copies = exchange_req.request_info.no_of_copies_list[i],
                book_condition = exchange_req.request_info.book_condition_list[i]
            )
            db.add(new_sell_exchange)
            db.commit()
            utils.reduce_copies_owned(exchange_req.request_info.poster_id, exchange_req.request_info.isbn_list[i], exchange_req.request_info.no_of_copies_list[i], db)
    return new_req.request_id


@router.get("/exchange/{request_id}", status_code=status.HTTP_200_OK)
async def get_exchange_request(request_id: int, db: db_dependency):
    result = db.query(models.ExchangeRequest, models.Request).join(models.Request, models.ExchangeRequest.request_id == models.Request.request_id).filter(models.ExchangeRequest.request_id == request_id).first()
    if result:
        exchange_request, request = result
        merged_result = {**exchange_request.__dict__, **request.__dict__}
        # Optionally, remove SQLAlchemy internal attribute '_sa_instance_state'
        merged_result.pop('_sa_instance_state', None)
        return merged_result
    else:
        raise HTTPException(status_code=404, detail="Request id not found in exchange requests")