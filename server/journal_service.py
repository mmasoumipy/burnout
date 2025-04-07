from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Journal
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

router = APIRouter()

class JournalEntryCreate(BaseModel):
    user_id: int
    title: str
    content: str
    analysis: Optional[str] = None

class JournalEntryResponse(BaseModel):
    id: int
    title: str
    content: str
    analysis: Optional[str]
    created_at: datetime

@router.post("/journal", response_model=JournalEntryResponse)
def create_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == entry.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_entry = Journal(
        user_id=entry.user_id,
        title=entry.title,
        content=entry.content,
        analysis=entry.analysis
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return new_entry

@router.get("/journal/{user_id}", response_model=List[JournalEntryResponse])
def get_journal_entries(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    entries = db.query(Journal).filter(Journal.user_id == user_id).order_by(Journal.created_at.desc()).all()
    return entries

@router.get("/journal/entry/{entry_id}", response_model=JournalEntryResponse)
def get_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(Journal).filter(Journal.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    return entry

@router.delete("/journal/{entry_id}")
def delete_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(Journal).filter(Journal.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    db.delete(entry)
    db.commit()
    
    return {"message": "Journal entry deleted successfully"}