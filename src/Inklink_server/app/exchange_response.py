from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

from database import db_dependency
import models, utils

router = APIRouter(
    prefix="/responses",
    tags=["responses"]
)

class ResponseBase(BaseModel):
    request_id: int
    responder_id: int
    isbn_list: List[str]
    no_of_copies_list: List[int]
    book_condition_list: List[str]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_exchange_response(exchange_res: ResponseBase, db: db_dependency):
    query = db.query(models.Request).filter(models.Request.request_id == exchange_res.request_id).first()
    if (not query) or (query.is_type != "Exchange"):
        raise HTTPException(status_code=404, detail="Exchange request not found")
    if not query.status == "Remained":
        raise HTTPException(status_code=400, detail="Exchange request is not available for proposals")
    if query.poster_id == exchange_res.responder_id:
        raise HTTPException(status_code=400, detail="Cannot respond to your own exchange request")
    first_res = db.query(models.ExchangeResponse).filter(models.ExchangeResponse.request_id == exchange_res.request_id, models.ExchangeResponse.responder_id == exchange_res.responder_id).first()
    if first_res is not None:
        raise HTTPException(status_code=400, detail="The user has already responded to this exchange request")
    
    have_enough_books = utils.check_enough_books(exchange_res.responder_id, exchange_res.isbn_list, exchange_res.no_of_copies_list, db)
    if not have_enough_books:
        raise HTTPException(status_code=404, detail="The user does not have enough books")
    else:
        new_res = models.ExchangeResponse(
            status = "Available",
            response_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            responder_id = exchange_res.responder_id,
            request_id = exchange_res.request_id
        )
        db.add(new_res)
        db.commit()

        for i in range(len(exchange_res.isbn_list)):
            new_propose_ex = models.ProposeToExchange(
                response_id = new_res.response_id,
                isbn = exchange_res.isbn_list[i],
                no_of_copies = exchange_res.no_of_copies_list[i],
                book_condition = exchange_res.book_condition_list[i],
                request_id = exchange_res.request_id
            )
            db.add(new_propose_ex)
            db.commit()
            utils.reduce_copies_owned(exchange_res.responder_id, exchange_res.isbn_list[i], exchange_res.no_of_copies_list[i], db)
    return new_res.response_id


@router.get("/{request_id}", status_code=status.HTTP_200_OK)
async def get_exchange_response(request_id: int, db: db_dependency):
    db_res = db.query(models.ExchangeResponse).filter(models.ExchangeResponse.request_id == request_id, models.ExchangeResponse.status == 'Available').all()
    return db_res