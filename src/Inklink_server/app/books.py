from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

from database import db_dependency
import models

router = APIRouter(
    prefix="/books",
    tags=["books"]
)

class BookBase(BaseModel):
    isbn: str
    title: str
    subtitle: str
    edition_name: str
    author_list: List[str]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(book: BookBase, db: db_dependency):
    new_isbn = models.BookIsbns(isbn = book.isbn)
    db_isbn_exist = db.query(models.BookIsbns).filter(new_isbn.isbn == models.BookIsbns.isbn).first()
    if db_isbn_exist is not None:
        raise HTTPException(status_code=404, detail="ISBN already exists")
    else:
        new_book = models.Book(
            title = book.title,
            subtitle = book.subtitle,
            edition_name = book.edition_name,
        )
        db_book_exist = db.query(models.Book).filter(
            new_book.title == models.Book.title, 
            new_book.subtitle == models.Book.subtitle, 
            new_book.edition_name == models.Book.edition_name
            ).first()
        if db_book_exist is not None: # if book already exists
            new_book.edition_id = db_book_exist.__dict__['edition_id']
        else:
            db.add(new_book)
            db.commit()
        new_isbn.edition_id=new_book.edition_id
        db.add(new_isbn)
        db.commit()
        for author_name in book.author_list:
            db_book_author = models.BookAuthors(
                edition_id = new_book.edition_id,
                author_name = author_name
            )
            db.add(db_book_author)
            db.commit()
        print(new_book.edition_id)
        return new_book.isbns