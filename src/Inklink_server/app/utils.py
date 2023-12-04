from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

import models

def check_enough_books(user_id, isbn_list, no_of_copies_list, db):
    for i in range(len(isbn_list)):
        db_own = db.query(models.Owns).filter(user_id == models.Owns.owner_id, isbn_list[i] == models.Owns.isbn).first()
        if db_own is None or db_own.no_of_copies < no_of_copies_list[i]:
            return False
    return True

def reduce_copies_owned(user_id, isbn, reduced_no_of_copies, db):
    db_own = db.query(models.Owns).filter(user_id == models.Owns.owner_id, isbn == models.Owns.isbn).first()
    if db_own is None:
        return False
    try:
        db_own.no_of_copies -= reduced_no_of_copies
        if db_own.no_of_copies == 0:
            db_own.delete()
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return True
    
# type = "request" or "response"
def add_copies_owned(type, user_id, request_response__id, db):
    result = None
    if type == "request":
        result = db.query(models.SellExchange).filter(models.SellExchange.request_id == request_response__id).all()
    elif type == "response":
        result = db.query(models.ProposeToExchange).filter(models.ProposeToExchange.response_id == request_response__id).all()
    if not result:
        raise HTTPException(status_code=404, detail=f"No records found for request or response id {request_response__id}")
    try:
        for record in result:
            db_own = db.query(models.Owns).filter(models.Owns.owner_id == user_id, models.Owns.isbn == record.isbn).first()
            if db_own is None:
                db_new_own = models.Owns(
                    owner_id = user_id,
                    isbn = record.isbn,
                    no_of_copies = record.no_of_copies
                )
                db.add(db_new_own)
            else:
                db_own.no_of_copies += record.no_of_copies
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))