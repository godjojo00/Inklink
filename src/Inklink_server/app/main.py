from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models

from database import engine
import books, book_requests, users

app = FastAPI()
app.include_router(books.router)
app.include_router(book_requests.router)
app.include_router(users.router)
origins = [
    'http://localhost:3000',
    "http://localhost"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Hello Router"}