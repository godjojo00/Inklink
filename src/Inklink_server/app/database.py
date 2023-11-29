from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from typing import Annotated

# Change YOUR_POSTGRESQL_USERNAME to your own username (default shoud be postgres)
# Change YOUR_POSTGRESQL_PASSWORD to your own password
URL_DATABASE = 'postgresql://postgres:910430@localhost:5432/inklink'

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]