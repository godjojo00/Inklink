from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

from database import db_dependency
import models

router = APIRouter(
    prefix="/responses",
    tags=["responses"]
)

@router.get("/")
async def response_root():
    return {"message": "Hello Response"}