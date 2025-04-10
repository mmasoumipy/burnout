from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, GenderEnum, MaritalStatusEnum
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from models import User, Test, Mood, create_tables
from models.mood import MoodType 

router = APIRouter()

# Schema for saving/updating user profile
class UserProfileUpdate(BaseModel):
    user_id: int
    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    has_children: Optional[bool] = None
    specialty: Optional[str] = None
    work_setting: Optional[str] = None
    career_stage: Optional[str] = None
    work_hours: Optional[int] = None
    on_call_frequency: Optional[str] = None
    years_experience: Optional[int] = None
    previous_burnout: Optional[int] = None

# Schema for saving user reasons
class UserReasonsUpdate(BaseModel):
    user_id: int
    reasons: List[int]

# Schema for updating single field
class UserFieldUpdate(BaseModel):
    user_id: int
    field: str
    value: Optional[str] = None


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




















@router.post("/save-profile")
def save_user_profile(profile: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == profile.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields if they exist in the request
    if profile.age is not None:
        user.age = profile.age
    if profile.gender is not None:
        try:
            user.gender = GenderEnum(profile.gender)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid gender value")
    if profile.marital_status is not None:
        try:
            user.marital_status = MaritalStatusEnum(profile.marital_status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid marital status value")
    if profile.has_children is not None:
        user.has_children = profile.has_children
    if profile.specialty is not None:
        user.specialty = profile.specialty
    if profile.work_setting is not None:
        user.work_setting = profile.work_setting
    if profile.career_stage is not None:
        user.career_stage = profile.career_stage
    if profile.work_hours is not None:
        user.work_hours = profile.work_hours
    if profile.on_call_frequency is not None:
        user.on_call_frequency = profile.on_call_frequency
    if profile.years_experience is not None:
        user.years_experience = profile.years_experience
    if profile.previous_burnout is not None:
        user.previous_burnout = profile.previous_burnout
    
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Profile updated successfully"}

@router.post("/save-reasons")
def save_user_reasons(data: UserReasonsUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert list of reason IDs to comma-separated string
    user.reasons = ",".join(map(str, data.reasons))
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Reasons saved successfully"}

@router.get("/user-profile/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert reasons string back to list of integers if it exists
    reasons_list = []
    if user.reasons:
        reasons_list = [int(r) for r in user.reasons.split(",")]
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "age": user.age if user.age else None,
        "gender": user.gender if user.gender else None,
        "marital_status": user.marital_status if user.marital_status else None,
        "has_children": user.has_children if user.has_children else None,
        "specialty": user.specialty if user.specialty else None,
        "work_setting": user.work_setting if user.work_setting else None,
        "career_stage": user.career_stage if user.career_stage else None,
        "work_hours": user.work_hours if user.work_hours else None,
        "on_call_frequency": user.on_call_frequency if user.on_call_frequency else None,
        "years_experience": user.years_experience if user.years_experience else None,
        "previous_burnout": user.previous_burnout if user.previous_burnout else None,
        "reasons": reasons_list if reasons_list else None,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

@router.put("/update-profile")
def update_user_field(data: UserFieldUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if the field exists in the User model
    if not hasattr(user, data.field):
        raise HTTPException(status_code=400, detail=f"Field '{data.field}' does not exist in User model")
    
    # Special handling for enum fields
    if data.field == "gender":
        try:
            setattr(user, data.field, GenderEnum(data.value) if data.value else None)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid gender value")
    elif data.field == "marital_status":
        try:
            setattr(user, data.field, MaritalStatusEnum(data.value) if data.value else None)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid marital status value")
    else:
        # Regular field update
        setattr(user, data.field, data.value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": f"Field '{data.field}' updated successfully"}