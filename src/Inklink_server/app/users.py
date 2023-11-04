from fastapi import APIRouter, HTTPException, status
import models
from pydantic import BaseModel

from database import SessionLocal

db = SessionLocal()

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

class UserBase(BaseModel):
    username: str
    password: str
    email: str
    phone_number: str

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_new_user(user: UserBase):
    new_user = models.User(
        username = user.username,
        password = user.password,
        email = user.email,
        phone_number = user.phone_number,
        role = "user"
    )
    db_username_exist = db.query(models.User).filter(new_user.username == models.User.username).first()
    if db_username_exist is not None:
        raise HTTPException(status_code=404, detail="Username already exists")
    else:
        db.add(new_user)
        db.commit()
        return new_user.user_id