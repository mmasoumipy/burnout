from typing import List

from database import engine, get_db
from fastapi import Depends, FastAPI, HTTPException, APIRouter
from models import Response, Test, User, create_tables
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import router as auth_router

# Base.metadata.create_all(bind=engine)
create_tables()

router = APIRouter()



MBI_QUESTIONS = [
    {"id": 1, "text": "I feel emotionally drained from my work.", "category": "emotional_exhaustion"},
    {"id": 2, "text": "I feel used up at the end of the workday.", "category": "emotional_exhaustion"},
    {"id": 3, "text": "I feel fatigued when I get up in the morning and have to face another day on the job.", "category": "emotional_exhaustion"},
    {"id": 4, "text": "I can easily understand how my patients feel about things.", "category": "personal_accomplishment"},
    {"id": 5, "text": "I feel I treat some patients as if they were impersonal objects.", "category": "depersonalization"},
    {"id": 6, "text": "Working with people all day is really a strain for me.", "category": "emotional_exhaustion"},
    {"id": 7, "text": "I deal very effectively with the problems of my patients.", "category": "personal_accomplishment"},
    {"id": 8, "text": "I feel burned out from my work.", "category": "emotional_exhaustion"},
    {"id": 9, "text": "I feel I’m positively influencing other people’s lives through my work.", "category": "personal_accomplishment"},
    {"id": 10, "text": "I’ve become more callous toward people since I took this job.", "category": "depersonalization"},
    {"id": 11, "text": "I worry that this job is hardening me emotionally.", "category": "depersonalization"},
    {"id": 12, "text": "I feel very energetic.", "category": "personal_accomplishment"},
    {"id": 13, "text": "I feel frustrated by my job.", "category": "emotional_exhaustion"},
    {"id": 14, "text": "I feel I’m working too hard on my job.", "category": "emotional_exhaustion"},
    {"id": 15, "text": "I don’t really care what happens to some of my patients.", "category": "depersonalization"},
    {"id": 16, "text": "Working with people directly puts too much stress on me.", "category": "emotional_exhaustion"},
    {"id": 17, "text": "I can easily create a relaxed atmosphere with my patients.", "category": "personal_accomplishment"},
    {"id": 18, "text": "I feel exhilarated after working closely with my patients.", "category": "personal_accomplishment"},
    {"id": 19, "text": "I have accomplished many worthwhile things in this job.", "category": "personal_accomplishment"},
    {"id": 20, "text": "I feel like I’m at the end of my rope.", "category": "emotional_exhaustion"},
    {"id": 21, "text": "In my work, I deal with emotional problems very calmly.", "category": "personal_accomplishment"},
    {"id": 22, "text": "I feel patients blame me for some of their problems.", "category": "depersonalization"},
]

class ResponseSchema(BaseModel):
    question_id: int
    score: int

class TestSubmission(BaseModel):
    user_id: int
    responses: List[ResponseSchema]

@router.get("/test")
def get_test():
    return {"questions": MBI_QUESTIONS}

@router.post("/submit")
def submit_test(submission: TestSubmission, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")

    categories = {"emotional_exhaustion": 0, "depersonalization": 0, "personal_accomplishment": 0}

    for response in submission.responses:
        # Categorizing responses
        question = next((q for q in MBI_QUESTIONS if q["id"] == response.question_id), None)
        if question:
            categories[question["category"]] += response.score
        else:
            raise HTTPException(status_code=400, detail="Invalid question ID")

    # Determine burnout level
    emotional_exhaustion_score = categories["emotional_exhaustion"]
    depersonalization_score = categories["depersonalization"]
    personal_accomplishment_score = categories["personal_accomplishment"]

    emotional_exhaustion_level = "Low" if emotional_exhaustion_score <= 18 else "Moderate" if emotional_exhaustion_score <= 33 else "High"
    depersonalization_level = "Low" if depersonalization_score <= 5 else "Moderate" if depersonalization_score <= 11 else "High"
    personal_accomplishment_level = "High" if personal_accomplishment_score >= 40 else "Moderate" if personal_accomplishment_score >= 31 else "Low"

    burnout_level = "Low"
    if emotional_exhaustion_score > 26 or depersonalization_score > 12:
        burnout_level = "High"
    elif emotional_exhaustion_score > 18 or depersonalization_score > 9:
        burnout_level = "Moderate"

    # Store in DB
    test_entry = Test(
        user_id=submission.user_id,
        emotional_exhaustion_score=emotional_exhaustion_score,
        depersonalization_score=depersonalization_score,
        personal_accomplishment_score=personal_accomplishment_score,
        emotional_exhaustion_level=emotional_exhaustion_level,
        depersonalization_level=depersonalization_level,
        personal_accomplishment_level=personal_accomplishment_level,
        burnout_level=burnout_level
    )
    db.add(test_entry)
    db.commit()
    db.refresh(test_entry)

    # Store responses
    for response in submission.responses:
        response_entry = Response(test_id=test_entry.id, question_id=response.question_id, score=response.score)
        db.add(response_entry)

    db.commit()

    return {
        "user_id": submission.user_id,
        "test_id": test_entry.id,
        "emotional_exhaustion_score": emotional_exhaustion_score,
        "depersonalization_score": depersonalization_score,
        "personal_accomplishment_score": personal_accomplishment_score,
        "emotional_exhaustion_level": emotional_exhaustion_level,
        "depersonalization_level": depersonalization_level,
        "personal_accomplishment_level": personal_accomplishment_level,
        "burnout_level": burnout_level
    }
