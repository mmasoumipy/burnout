from typing import List, Optional

from database import engine, get_db
from fastapi import Depends, FastAPI, HTTPException, APIRouter
from models import Response, Test, User, create_tables
from pydantic import BaseModel
from sqlalchemy.orm import Session

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
    {"id": 9, "text": "I feel I'm positively influencing other people's lives through my work.", "category": "personal_accomplishment"},
    {"id": 10, "text": "I've become more callous toward people since I took this job.", "category": "depersonalization"},
    {"id": 11, "text": "I worry that this job is hardening me emotionally.", "category": "depersonalization"},
    {"id": 12, "text": "I feel very energetic.", "category": "personal_accomplishment"},
    {"id": 13, "text": "I feel frustrated by my job.", "category": "emotional_exhaustion"},
    {"id": 14, "text": "I feel I'm working too hard on my job.", "category": "emotional_exhaustion"},
    {"id": 15, "text": "I don't really care what happens to some of my patients.", "category": "depersonalization"},
    {"id": 16, "text": "Working with people directly puts too much stress on me.", "category": "emotional_exhaustion"},
    {"id": 17, "text": "I can easily create a relaxed atmosphere with my patients.", "category": "personal_accomplishment"},
    {"id": 18, "text": "I feel exhilarated after working closely with my patients.", "category": "personal_accomplishment"},
    {"id": 19, "text": "I have accomplished many worthwhile things in this job.", "category": "personal_accomplishment"},
    {"id": 20, "text": "I feel like I'm at the end of my rope.", "category": "emotional_exhaustion"},
    {"id": 21, "text": "In my work, I deal with emotional problems very calmly.", "category": "personal_accomplishment"},
    {"id": 22, "text": "I feel patients blame me for some of their problems.", "category": "depersonalization"},
]

class StartTestRequest(BaseModel):
    user_id: int

class SaveResponseRequest(BaseModel):
    test_id: int
    question_id: int
    score: int

class ResponseSchema(BaseModel):
    question_id: int
    score: int

class TestSubmission(BaseModel):
    user_id: int
    responses: List[ResponseSchema]
    test_id: Optional[int] = None

@router.get("/test")
def get_test():
    return {"questions": MBI_QUESTIONS}

@router.post("/start-test")
def start_test(request: StartTestRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    
    # Check if user already has an incomplete test
    existing_test = db.query(Test).filter(
        Test.user_id == request.user_id,
        Test.completed == False
    ).first()
    
    if existing_test:
        return {"test_id": existing_test.id}
    
    # Create a new incomplete test
    new_test = Test(
        user_id=request.user_id,
        completed=False
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    
    return {"test_id": new_test.id}

@router.post("/save-response")
def save_response(request: SaveResponseRequest, db: Session = Depends(get_db)):
    # Check if test exists and is not completed
    test = db.query(Test).filter(Test.id == request.test_id, Test.completed == False).first()
    if not test:
        raise HTTPException(status_code=400, detail="Test not found or already completed")
    
    # Check if response already exists
    existing_response = db.query(Response).filter(
        Response.test_id == request.test_id,
        Response.question_id == request.question_id
    ).first()
    
    if existing_response:
        # Update existing response
        existing_response.score = request.score
    else:
        # Create new response
        response = Response(test_id=request.test_id, question_id=request.question_id, score=request.score)
        db.add(response)
    
    db.commit()
    return {"message": "Response saved successfully"}

@router.get("/test-progress/{test_id}")
def get_test_progress(test_id: int, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    responses = db.query(Response).filter(Response.test_id == test_id).all()
    
    return {
        "test_id": test_id,
        "completed": test.completed,
        "responses": {str(r.question_id): r.score for r in responses}
    }

@router.get("/in-progress-test/{user_id}")
def get_in_progress_test(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    in_progress_test = db.query(Test).filter(
        Test.user_id == user_id,
        Test.completed == False
    ).first()
    
    if not in_progress_test:
        return {"message": "No in-progress test found", "test_id": None}
    
    return {"test_id": in_progress_test.id}

@router.post("/submit")
def submit_test(submission: TestSubmission, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")

    # Check if we're completing an existing test or creating a new one
    test_entry = None
    if submission.test_id:
        test_entry = db.query(Test).filter(
            Test.id == submission.test_id,
            Test.user_id == submission.user_id,
            Test.completed == False
        ).first()
    
    # If no existing test was found, create a new one
    if not test_entry:
        test_entry = Test(user_id=submission.user_id, completed=False)
        db.add(test_entry)
        db.commit()
        db.refresh(test_entry)
    
    categories = {"emotional_exhaustion": 0, "depersonalization": 0, "personal_accomplishment": 0}

    for response in submission.responses:
        # Categorizing responses
        question = next((q for q in MBI_QUESTIONS if q["id"] == response.question_id), None)
        if question:
            categories[question["category"]] += response.score
        else:
            raise HTTPException(status_code=400, detail="Invalid question ID")

        # Store response in database
        existing_response = db.query(Response).filter(
            Response.test_id == test_entry.id,
            Response.question_id == response.question_id
        ).first()
        
        if existing_response:
            existing_response.score = response.score
        else:
            response_entry = Response(test_id=test_entry.id, question_id=response.question_id, score=response.score)
            db.add(response_entry)

    # Calculate scores and levels
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

    # Update the test with scores and mark as completed
    test_entry.emotional_exhaustion_score = emotional_exhaustion_score
    test_entry.depersonalization_score = depersonalization_score
    test_entry.personal_accomplishment_score = personal_accomplishment_score
    test_entry.emotional_exhaustion_level = emotional_exhaustion_level
    test_entry.depersonalization_level = depersonalization_level
    test_entry.personal_accomplishment_level = personal_accomplishment_level
    test_entry.burnout_level = burnout_level
    test_entry.completed = True  # Mark as completed
    
    db.commit()
    db.refresh(test_entry)

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

@router.get("/tests/{user_id}")
def get_tests_by_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tests = db.query(Test).filter(
        Test.user_id == user_id,
        Test.completed == True  # Only return completed tests
    ).order_by(Test.created_at.desc()).all()

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