from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

from database import db_dependency
import models

router = APIRouter(
    prefix="/ratings",
    tags=["ratings"]
)

@router.post("/{request_id}", status_code=status.HTTP_201_CREATED)
async def create_rating(request_id: int, rating_user_id: int, score: float, db: db_dependency):
    db_req = db.query(models.Request).filter(models.Request.request_id == request_id).first()
    if db_req is None:
        raise HTTPException(status_code=404, detail="Request not found")
    db_rating_exist = db.query(models.Rating).filter(models.Rating.rating_user_id == rating_user_id, models.Rating.request_id == request_id).first()
    if db_rating_exist:
        raise HTTPException(status_code=400, detail="The user has already rated this request")
    seller = db_req.poster_id
    buyer = None
    if db_req.is_type == "Sell":
        db_sell_req = db.query(models.SellingRequest).filter(models.SellingRequest.request_id == request_id).first()
        buyer = db_sell_req.buyer_id
    elif db_req.is_type == "Exchange":
        db_ex_res = db.query(models.ExchangeResponse).filter(models.ExchangeResponse.request_id == request_id, models.ExchangeResponse.status == "Accepted").first()
        buyer = db_ex_res.responder_id

    rated_user_id = None
    if seller == rating_user_id:
        rated_user_id = buyer
    elif buyer == rating_user_id:
        rated_user_id = seller
    else:
        raise HTTPException(status_code=400, detail="The user is not the seller or the buyer (or the exchanger) of this request")

    try:
        new_rating = models.Rating(
            rating_user_id = rating_user_id,
            rated_user_id = rated_user_id,
            request_id = request_id,
            rating_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            score = score
        )
        db.add(new_rating)

        all_ratings = db.query(models.Rating).filter(models.Rating.rated_user_id == rated_user_id).all()
        db_rated_user = db.query(models.User).filter(models.User.user_id == rated_user_id).first()
        db_rated_user.agg_rating = (sum([rating.score for rating in all_ratings]) + score) / (len(all_ratings) + 1)

        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return