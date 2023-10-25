from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# 連接 PostgreSQL 資料庫
DATABASE_URL = "postgresql://postgres:910430@localhost:5432/secondhand_books"
engine = create_engine(DATABASE_URL)

# 創建資料庫會話
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()