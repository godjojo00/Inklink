from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from database import db_dependency
import models

router = APIRouter(
    prefix="/requests",
    tags=["requests"]
)

class SellRequestBase(BaseModel):
    user_id: int
    price: int

@router.post("/sell", status_code=status.HTTP_201_CREATED)
async def create_sell_request(sell_req: SellRequestBase, db: db_dependency):
    new_sell_req = models.Request(
        status = "Pending",
        posting_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        poster_id = sell_req.user_id,
        is_type = "Sell"
    )
    #db_username_exist = db.query(models.User).filter(new_user.username == models.User.username).first()
    #if db_username_exist is not None:
        #raise HTTPException(status_code=404, detail="Username already exists")
    #else:
        #db.add(new_sell_req)
        #db.commit()
        #return new_sell_req.request_id