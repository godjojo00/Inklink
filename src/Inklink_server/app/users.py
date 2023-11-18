from fastapi import APIRouter, HTTPException, status
import models
from pydantic import BaseModel
from typing import List

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


@router.get("/{user_id}", status_code=status.HTTP_200_OK)
async def get_user(user_id: int, db: db_dependency):
    _user = models.User(user_id = user_id)
    db_user_id = db.query(models.User).filter(_user.user_id == models.User.user_id).first()
    if db_user_id is None:
        raise HTTPException(status_code=404, detail="User_id doesn't exist")
    else:
        return db_user_id.__dict__
    
class OwnBase(BaseModel):
    user_id: int
    isbn_list: List[str]
    no_of_copies_list: List[int]

@router.post("/own", status_code=status.HTTP_201_CREATED)
async def user_own(own: OwnBase, db: db_dependency):
    _user = models.User(user_id = own.user_id)
    db_user_id = db.query(models.User).filter(_user.user_id == models.User.user_id).first()
    if db_user_id is None:
        raise HTTPException(status_code=404, detail="User_id doesn't exist")
    else:
        for i in range(len(own.isbn_list)):
            _book = models.BookIsbns(isbn = own.isbn_list[i])
            db_book = db.query(models.BookIsbns).filter(_book.isbn == models.BookIsbns.isbn).first()
            if db_book is None:
                raise HTTPException(status_code=404, detail="Book with ISBN doesn't exist in the database")
            else:
                db_own = models.Owns(
                    owner_id = own.user_id,
                    isbn = own.isbn_list[i],
                    no_of_copies = own.no_of_copies_list[i]
                )
                db.add(db_own)
                db.commit()

@router.get("/own/{user_id}", status_code=status.HTTP_200_OK)
async def get_user_own(user_id: int, db: db_dependency):
    _user = models.User(user_id = user_id)
    db_user_id = db.query(models.User).filter(_user.user_id == models.User.user_id).first()
    if db_user_id is None:
        raise HTTPException(status_code=404, detail="User_id doesn't exist")
    else:
        return db.query(models.Owns).filter(user_id == models.Owns.owner_id).all()