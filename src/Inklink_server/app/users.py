from fastapi import APIRouter, HTTPException, status
import models
from pydantic import BaseModel

from database import db_dependency

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
async def create_new_user(user: UserBase, db: db_dependency):
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

class LoginBase(BaseModel):
    username: str
    password: str

    
@router.post("/login", status_code=status.HTTP_200_OK)
async def login(account: LoginBase, db: db_dependency):
    _account = models.User(username=account.username, password=account.password)
    db_username = db.query(models.User).filter(_account.username == models.User.username).first()
    if db_username is None: # username wrong
        raise HTTPException(status_code=404, detail="Username doesn't exist")
    else:
        if (db_username.password == _account.password):
            return db_username.user_id
        else: 
            return {"login": "failed"}


@router.get("/users/{user_id}", status_code=status.HTTP_200_OK)
async def get_user(user_id: int, db: db_dependency):
    _user = models.User(user_id = user_id)
    db_user_id = db.query(models.User).filter(_user.user_id == models.User.user_id).first()
    if db_user_id is None:
        raise HTTPException(status_code=404, detail="User_id doesn't exist")
    else:
        return db_user_id.__dict__