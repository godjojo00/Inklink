from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import app.models
from app.database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.models.Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173",
    "http://localhost/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChoiceBase(BaseModel):
    choice_text: str
    is_correct: bool

class QuestionBase(BaseModel):
    question_text: str
    choices: List[ChoiceBase]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.get("/questions/{question_id}")
async def read_question(question_id: int, db: db_dependency):
    result = db.query(app.models.Questions).filter(app.models.Questions.id == question_id).first()
    if not result:
        raise HTTPException(status_code=404, detail='Question is not found.')
    return result

@app.get("/choices/{question_id}")
async def read_choices(question_id: int, db: db_dependency):
    result = db.query(app.models.Choices).filter(app.models.Choices.question_id == question_id).all()
    if not result:
        raise HTTPException(status_code=404, detail='Choices are not found.')
    return result

@app.post("/questions/")
async def create_questions(question: QuestionBase, db:db_dependency):
    db_question = app.models.Questions(question_text=question.question_text)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    for choice in question.choices:
        db_choice = app.models.Choices(choice_text=choice.choice_text, is_correct = choice.is_correct, question_id = db_question.id)
        db.add(db_choice)
    db.commit()
    return {"message": "Question created successfully"}
