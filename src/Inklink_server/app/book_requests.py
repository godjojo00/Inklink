from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

from database import db_dependency
import models

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

@router.post("/sell", status_code=status.HTTP_201_CREATED)
async def create_sell_request(sell_req: SellRequestBase, db: db_dependency):
    have_enough_books = check_enough_books(sell_req.request_info.poster_id, sell_req.request_info.isbn_list, sell_req.request_info.no_of_copies_list, db)
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
            reduce_copies_owned(sell_req.request_info.poster_id, sell_req.request_info.isbn_list[i], sell_req.request_info.no_of_copies_list[i], db)
    return new_req.request_id

def check_enough_books(user_id, isbn_list, no_of_copies_list, db):
    for i in range(len(isbn_list)):
        db_own = db.query(models.Owns).filter(user_id == models.Owns.owner_id, isbn_list[i] == models.Owns.isbn).first()
        if db_own is None or db_own.no_of_copies < no_of_copies_list[i]:
            return False
    return True

def reduce_copies_owned(user_id, isbn, reduced_no_of_copies, db):
    query = db.query(models.Owns).filter(user_id == models.Owns.owner_id, isbn == models.Owns.isbn)
    db_own = query.first()
    if db_own is None:
        return False
    else:
        db_own.no_of_copies -= reduced_no_of_copies
        if db_own.no_of_copies == 0:
            query.delete()
        db.commit()
        return True
