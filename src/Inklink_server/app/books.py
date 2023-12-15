from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional

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
    
    try:
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
            db.flush()
        new_isbn.edition_id=new_book.edition_id
        db.add(new_isbn)
        for author_name in book.author_list:
            db_book_author = models.BookAuthors(
                edition_id = new_book.edition_id,
                author_name = author_name
            )
            db_book_author_exist = db.query(models.BookAuthors).filter(
                db_book_author.edition_id == models.BookAuthors.edition_id,
                db_book_author.author_name == models.BookAuthors.author_name
            ).first()
            if db_book_author_exist is None:
                db.add(db_book_author)
                
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"isbn": new_isbn.isbn}
    
@router.get("/book", status_code=status.HTTP_200_OK)
async def get_book_info(isbn: str, db: db_dependency):
    result = db.query(models.BookIsbns, models.Book).join(models.Book, models.BookIsbns.edition_id == models.Book.edition_id).filter(models.BookIsbns.isbn == isbn).first()
    if result is None:
        raise HTTPException(status_code=404, detail="ISBN not found in database")
    book_isbn, book_info = result
    merged_result = {**book_isbn.__dict__, **book_info.__dict__}
    merged_result.pop('_sa_instance_state', None)
    authors = db.query(models.BookAuthors).filter(models.BookAuthors.edition_id == book_isbn.edition_id).all()
    author_list = [author.author_name for author in authors]
    merged_result["author_list"] = author_list
    return merged_result

@router.get("/books", status_code=status.HTTP_200_OK)
async def search_books(
    db: db_dependency,
    book_title: Optional[str] = None,
    author: Optional[str] = None,
    isbn: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1)
):
    sql_query = """
    SELECT bi.isbn, b.title, b.edition_name, ba.author_name 
    FROM book_editions AS b 
    JOIN book_isbns AS bi ON bi.edition_id = b.edition_id 
    JOIN book_authors AS ba ON ba.edition_id = b.edition_id
    """
    conditions = []
    if book_title:
        conditions.append("b.title ILIKE :book_title")
    if author:
        conditions.append("ba.author_name ILIKE :author")
    if isbn:
        conditions.append("bi.isbn LIKE :isbn")
    if conditions:
        sql_query += " WHERE " + " AND ".join(conditions)
    sql_query += " ORDER BY bi.isbn"
    sql_query += " OFFSET :offset LIMIT :limit"

    params = {
        "book_title": f"%{book_title.lower()}%" if book_title else None,
        "author": f"%{author.lower()}%" if author else None,
        "isbn": f"%{isbn}%" if isbn else None,
        "offset": (page - 1) * limit,
        "limit": limit
    }
    result = db.execute(text(sql_query), params).fetchall()
    books_list = [
        {"isbn": book[0], "title": book[1], "edition_name": book[2], "author_name": book[3]}
        for book in result
    ]

    count_query = """
    SELECT COUNT(DISTINCT bi.isbn) 
    FROM book_isbns AS bi 
    JOIN book_editions AS b ON bi.edition_id = b.edition_id 
    JOIN book_authors AS ba ON bi.edition_id = ba.edition_id
    """
    if conditions:
        count_query += " WHERE " + " AND ".join(conditions)
    total_count = db.execute(text(count_query), params).scalar()

    return {"books": books_list, "total": total_count}