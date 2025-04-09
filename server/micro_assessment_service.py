from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, MicroAssessment
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter()

# Define Data Formats
class MicroAssessmentCreate(BaseModel):
    user_id: int
    fatigue_level: int
    stress_level: int
    work_satisfaction: int
    sleep_quality: int
    support_feeling: int
    comments: Optional[str] = None

class MicroAssessmentResponse(BaseModel):
    id: int
    fatigue_level: int
    stress_level: int
    work_satisfaction: int
    sleep_quality: int
    support_feeling: int
    comments: Optional[str]
    burnout_risk_score: float
    created_at: datetime

    class Config:
        orm_mode = True 

@router.post("/micro-assessment", response_model=MicroAssessmentResponse)
def create_micro_assessment(assessment: MicroAssessmentCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == assessment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate burnout risk score (1-10 scale)
    # Higher fatigue and stress increase the score
    # Higher work satisfaction, sleep quality, and support feeling decrease the score
    risk_score = (
        (assessment.fatigue_level + assessment.stress_level) * 0.6 +
        (6 - assessment.work_satisfaction) * 0.15 +
        (6 - assessment.sleep_quality) * 0.15 +
        (6 - assessment.support_feeling) * 0.1
    )
    
    # Normalize to 1-10 scale
    normalized_score = (risk_score / 5) * 10
    # Ensure the score stays within 1-10 range
    final_score = max(1, min(10, normalized_score))
    
    new_assessment = MicroAssessment(
        user_id=assessment.user_id,
        fatigue_level=assessment.fatigue_level,
        stress_level=assessment.stress_level,
        work_satisfaction=assessment.work_satisfaction,
        sleep_quality=assessment.sleep_quality,
        support_feeling=assessment.support_feeling,
        comments=assessment.comments,
        burnout_risk_score=round(final_score, 1)
    )
    
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    
    return new_assessment

@router.get("/micro-assessment/{user_id}", response_model=List[MicroAssessmentResponse])
def get_micro_assessments(user_id: int, limit: int = 10, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    assessments = db.query(MicroAssessment).filter(
        MicroAssessment.user_id == user_id
    ).order_by(MicroAssessment.created_at.desc()).limit(limit).all()
    
    return assessments

@router.get("/micro-assessment/latest/{user_id}", response_model=MicroAssessmentResponse)
def get_latest_micro_assessment(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    assessment = db.query(MicroAssessment).filter(
        MicroAssessment.user_id == user_id
    ).order_by(MicroAssessment.created_at.desc()).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="No micro-assessments found for this user")
    
    return assessment

@router.get("/micro-assessment/trend/{user_id}")
def get_micro_assessment_trend(user_id: int, days: int = 30, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get assessments for the specified number of days
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    assessments = db.query(MicroAssessment).filter(
        MicroAssessment.user_id == user_id,
        MicroAssessment.created_at >= start_date
    ).order_by(MicroAssessment.created_at.asc()).all()
    
    if not assessments:
        return {"message": "No data available for trend analysis"}
    
    # Calculate average scores for each metric
    avg_fatigue = sum(a.fatigue_level for a in assessments) / len(assessments)
    avg_stress = sum(a.stress_level for a in assessments) / len(assessments)
    avg_work_satisfaction = sum(a.work_satisfaction for a in assessments) / len(assessments)
    avg_sleep_quality = sum(a.sleep_quality for a in assessments) / len(assessments)
    avg_support = sum(a.support_feeling for a in assessments) / len(assessments)
    avg_risk_score = sum(a.burnout_risk_score for a in assessments) / len(assessments)
    
    # Check if risk score is increasing or decreasing
    if len(assessments) >= 2:
        first_week = assessments[:min(7, len(assessments)//2)]
        last_week = assessments[-min(7, len(assessments)//2):]
        
        first_week_avg = sum(a.burnout_risk_score for a in first_week) / len(first_week)
        last_week_avg = sum(a.burnout_risk_score for a in last_week) / len(last_week)
        
        trend = "increasing" if last_week_avg > first_week_avg else "decreasing" if last_week_avg < first_week_avg else "stable"
        trend_percentage = abs(last_week_avg - first_week_avg) / first_week_avg * 100 if first_week_avg > 0 else 0
    else:
        trend = "insufficient data"
        trend_percentage = 0
    
    return {
        "average_scores": {
            "fatigue_level": round(avg_fatigue, 1),
            "stress_level": round(avg_stress, 1),
            "work_satisfaction": round(avg_work_satisfaction, 1),
            "sleep_quality": round(avg_sleep_quality, 1),
            "support_feeling": round(avg_support, 1),
            "burnout_risk_score": round(avg_risk_score, 1)
        },
        "trend": {
            "direction": trend,
            "percentage_change": round(trend_percentage, 1)
        },
        "data_points": len(assessments),
        "highest_risk_score": max(a.burnout_risk_score for a in assessments),
        "lowest_risk_score": min(a.burnout_risk_score for a in assessments),
    }