from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models

from database import engine
import users, books

app = FastAPI()
app.include_router(users.router)
app.include_router(books.router)
origins = [
    'http://localhost:3000',
    "http://localhost"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Hello Router"}