from fastapi import FastAPI, Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from models import User, Test, Mood, create_tables
from pydantic import BaseModel
from datetime import datetime
from models.mood import MoodType 

router = APIRouter()

create_tables()

class MoodSubmission(BaseModel):
    user_id: int
    mood: MoodType


@router.post("/mood")
def save_mood(mood_data: MoodSubmission, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == mood_data.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    
    # Check if the mood is already recorded for today
    today = datetime.utcnow().date()
    existing_mood = db.query(Mood).filter(
        Mood.user_id == mood_data.user_id,
        Mood.created_at >= datetime.combine(today, datetime.min.time()),
        Mood.created_at < datetime.combine(today, datetime.max.time())
    ).first()
    if existing_mood:
        today_mood = existing_mood.mood
        mood_update = db.query(Mood).filter(Mood.id == existing_mood.id).first()
        mood_update.mood = mood_data.mood
        db.commit()
        db.refresh(mood_update)
        return {"message": "Mood updated successfully", "previous_mood": today_mood}
    # If no mood recorded for today, create a new entry
    else:
        mood_entry = Mood(user_id=user.id, mood=mood_data.mood, created_at=datetime.utcnow())
        db.add(mood_entry)
        db.commit()
        db.refresh(mood_entry)
        return {"message": "Mood saved successfully"}

@router.get("/mood/{user_id}")
def get_latest_moods(user_id: int, db: Session = Depends(get_db)):
    moods = (
        db.query(Mood)
        .filter(Mood.user_id == user_id)
        .order_by(Mood.created_at.asc())
        .limit(10)
        .all()
    )
    return [
        {"mood": mood.mood, "timestamp": mood.created_at.isoformat()}
        for mood in moods
    ]



@router.get("/tests/{user_id}")
def get_tests_by_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tests = db.query(Test).filter(Test.user_id == user_id).order_by(Test.created_at.desc()).all()

    return [
        {
            "id": test.id,
            "created_at": test.created_at,
            "emotional_exhaustion_score": test.emotional_exhaustion_score,
            "emotional_exhaustion_level": test.emotional_exhaustion_level,
            "depersonalization_score": test.depersonalization_score,
            "depersonalization_level": test.depersonalization_level,
            "personal_accomplishment_score": test.personal_accomplishment_score,
            "personal_accomplishment_level": test.personal_accomplishment_level,
            "burnout_level": test.burnout_level,
        }
        for test in tests
    ]

class NameUpdateRequest(BaseModel):
    user_id: int
    new_name: str

@router.put("/update-name")
def update_name(data: NameUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.name = data.new_name
    db.commit()
    return {"message": "Name updated successfully"}
