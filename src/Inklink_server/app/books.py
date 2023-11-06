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
    edition: int
    authors: List[str]
    categories: List[str]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(book: BookBase, db: db_dependency):
    new_book = models.Book(
        isbn = book.isbn,
        title = book.title,
        edition = book.edition,
    )
    db_isbn_exist = db.query(models.Book).filter(new_book.isbn == models.Book.isbn).first()
    if db_isbn_exist is not None:
        raise HTTPException(status_code=404, detail="ISBN already exists")
    else:
        db.add(new_book)
        db.commit()

        for author in book.authors:
            db_book_author = models.BookAuthors(
                isbn = book.isbn,
                author = author
            )
            db.add(db_book_author)
            db.commit()
        
        for category in book.categories:
            db_book_category = models.BookCategories(
                isbn = book.isbn,
                category = category
            )
            db.add(db_book_category)
            db.commit()
        return new_book.isbn