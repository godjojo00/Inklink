from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Change YOUR_POSTGRESQL_USERNAME to your own username (default shoud be postgres)
# Change YOUR_POSTGRESQL_PASSWORD to your own password
URL_DATABASE = 'postgresql://postgres:m2lD0DiPSsCUHP@localhost:5432/inklink'

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()