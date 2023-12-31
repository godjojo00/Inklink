from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from typing import List, Optional

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
    
    try:
        new_res = models.ExchangeResponse(
            status = "Available",
            response_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            responder_id = exchange_res.responder_id,
            request_id = exchange_res.request_id
        )
        db.add(new_res)
        db.flush()

        for i in range(len(exchange_res.isbn_list)):
            new_propose_ex = models.ProposeToExchange(
                response_id = new_res.response_id,
                isbn = exchange_res.isbn_list[i],
                no_of_copies = exchange_res.no_of_copies_list[i],
                book_condition = exchange_res.book_condition_list[i],
            )
            db.add(new_propose_ex)
            utils.reduce_copies_owned(exchange_res.responder_id, exchange_res.isbn_list[i], exchange_res.no_of_copies_list[i], db)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"response_id": new_res.response_id}

@router.get("/{response_id}", status_code=status.HTTP_200_OK)
async def get_exchange_response(response_id: int, db: db_dependency):
    db_res = db.query(models.ExchangeResponse, models.User.username).filter(models.ExchangeResponse.response_id == response_id)\
               .join(models.User, models.ExchangeResponse.responder_id == models.User.user_id).first()
    if db_res is None:
        raise HTTPException(status_code=404, detail="Exchange response not found")

    exchange_response, username = db_res
    db_res_dict = {c.key: getattr(exchange_response, c.key) for c in inspect(exchange_response).mapper.column_attrs}
    db_res_dict["username"] = username
    
    exchange_list = db.query(models.ProposeToExchange).filter(models.ProposeToExchange.response_id == response_id).all()
    isbn_list = [record.isbn for record in exchange_list]
    no_of_copies_list = [record.no_of_copies for record in exchange_list]
    book_condition_list = [record.book_condition for record in exchange_list]
    
    db_res_dict["isbn_list"] = isbn_list
    db_res_dict["no_of_copies_list"] = no_of_copies_list
    db_res_dict["book_condition_list"] = book_condition_list

    return db_res_dict

@router.get("/user/{user_id}", status_code=status.HTTP_200_OK)
async def get_user_exchange_response(user_id: int, 
                                     db: db_dependency, 
                                     status: Optional[str]="All",
                                     page: int = Query(1, description="Page number", ge=1),
                                     limit: int = Query(10, description="Number of items per page", ge=1)):
    db_res = db.query(models.ExchangeResponse.response_id).filter(models.ExchangeResponse.responder_id == user_id)
    if status != "All":
        db_res = db_res.filter(models.ExchangeResponse.status == status)

    result = db_res.order_by(models.ExchangeResponse.response_id)
    total_count = result.count()
    result = result.offset((page - 1) * limit).limit(limit)
    ex_res_list = [item[0] for item in result.all()]
    return {"total_count": total_count, "response_list": ex_res_list}

@router.patch("/delete/{response_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_response(response_id: int, user_id: int, db:db_dependency):
    db_ex_res = db.query(models.ExchangeResponse).filter(models.ExchangeResponse.response_id == response_id).first()
    if db_ex_res is None:
        raise HTTPException(status_code=404, detail="Exchange response not found")
    if db_ex_res.status != "Available":
        raise HTTPException(status_code=400, detail="Exchange response is not available")
    if db_ex_res.responder_id != user_id:
        raise HTTPException(status_code=400, detail="Exchange response is posted by some other user")
    
    try:
        db_ex_res.status = "Deleted"
        utils.add_copies_owned("response", db_ex_res.responder_id, db_ex_res.response_id, db)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return