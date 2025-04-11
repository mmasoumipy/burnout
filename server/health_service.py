from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, HealthData
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

router = APIRouter()

class HealthPermissionUpdate(BaseModel):
    user_id: int
    enabled: bool

@router.put("/update-health-permission")
def update_health_permission(data: HealthPermissionUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.health_permission = data.enabled
    db.commit()
    return {"message": "Health permission updated successfully"}

class HealthDataSync(BaseModel):
    user_id: int
    health_data: Dict[str, Any]

@router.post("/sync-health-data")
def sync_health_data(data: HealthDataSync, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.health_permission:
        raise HTTPException(status_code=403, detail="Health data permission not granted")
    
    # Process and store the health data
    new_health_data = HealthData(
        user_id=data.user_id,
        heart_rate=data.health_data.get('heart_rate'),
        sleep_duration=data.health_data.get('sleep_duration'),
        sleep_quality=data.health_data.get('sleep_quality'),
        steps=data.health_data.get('steps'),
        stress_level=data.health_data.get('stress_level'),
        hrv=data.health_data.get('hrv'),
        recorded_at=data.health_data.get('timestamp', datetime.utcnow())
    )
    
    db.add(new_health_data)
    db.commit()
    db.refresh(new_health_data)
    
    return {"message": "Health data synced successfully"}

@router.get("/health-metrics/{user_id}")
def get_health_metrics(user_id: int, timeRange: str = '7d', db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert timeRange to actual date filter
    time_delta = {
        '1d': timedelta(days=1),
        '7d': timedelta(days=7),
        '30d': timedelta(days=30),
        '90d': timedelta(days=90)
    }.get(timeRange, timedelta(days=7))
    
    start_date = datetime.utcnow() - time_delta
    
    # Get the health data for the time range
    health_data = db.query(HealthData).filter(
        HealthData.user_id == user_id,
        HealthData.recorded_at >= start_date
    ).order_by(HealthData.recorded_at.asc()).all()
    
    # Process data for trends and insights
    def safe_average(values):
        filtered = [v for v in values if v is not None]
        return sum(filtered) / len(filtered) if filtered else None
    
    heart_rates = [d.heart_rate for d in health_data]
    sleep_durations = [d.sleep_duration for d in health_data]
    stress_levels = [d.stress_level for d in health_data]
    hrvs = [d.hrv for d in health_data]
    
    # Calculate resting heart rate (average of lowest 5 readings per day)
    daily_heart_rates = {}
    for data in health_data:
        if data.heart_rate is None:
            continue
        
        day = data.recorded_at.date()
        if day not in daily_heart_rates:
            daily_heart_rates[day] = []
        
        daily_heart_rates[day].append(data.heart_rate)
    
    resting_heart_rates = []
    for day, rates in daily_heart_rates.items():
        rates.sort()
        resting_hr = sum(rates[:min(5, len(rates))]) / min(5, len(rates)) if rates else None
        if resting_hr:
            resting_heart_rates.append(resting_hr)
    
    avg_resting_hr = sum(resting_heart_rates) / len(resting_heart_rates) if resting_heart_rates else None
    
    # Calculate sleep consistency score
    sleep_consistency = None
    if len(sleep_durations) > 3:
        non_none_durations = [d for d in sleep_durations if d is not None]
        if non_none_durations:
            avg_sleep = sum(non_none_durations) / len(non_none_durations)
            variance = sum((d - avg_sleep) ** 2 for d in non_none_durations) / len(non_none_durations)
            # Lower variance = higher consistency, scale to 0-100
            sleep_consistency = max(0, 100 - (variance * 10))
    
    # Calculate burnout risk score based on health data
    # Higher resting HR, lower HRV, poor sleep = higher risk
    burnout_risk = None
    if avg_resting_hr and safe_average(hrvs) and safe_average(sleep_durations):
        hr_factor = min(100, max(0, (avg_resting_hr - 50) * 2)) / 100  # Normalize: higher HR = higher risk
        hrv_factor = min(100, max(0, 100 - safe_average(hrvs))) / 100  # Normalize: lower HRV = higher risk
        sleep_factor = min(100, max(0, (8 - safe_average(sleep_durations)) * 20)) / 100  # Normalize: less sleep = higher risk
        
        # Weighted formula
        burnout_risk = (hr_factor * 0.3 + hrv_factor * 0.4 + sleep_factor * 0.3) * 10  # Scale to 0-10
    
    return {
        "data": [
            {
                "timestamp": data.recorded_at,
                "heart_rate": data.heart_rate,
                "sleep_duration": data.sleep_duration,
                "sleep_quality": data.sleep_quality,
                "steps": data.steps,
                "stress_level": data.stress_level,
                "hrv": data.hrv
            }
            for data in health_data
        ],
        "insights": {
            "average_heart_rate": safe_average(heart_rates),
            "average_resting_heart_rate": avg_resting_hr,
            "average_sleep": safe_average(sleep_durations),
            "average_stress": safe_average(stress_levels),
            "average_hrv": safe_average(hrvs),
            "sleep_consistency": sleep_consistency,
            "burnout_risk_from_health_data": burnout_risk,
            "data_quality": len(health_data) / time_delta.days if time_delta.days > 0 else 0,
        },
        "recommendations": get_health_recommendations(
            avg_resting_hr, 
            safe_average(hrvs), 
            safe_average(sleep_durations),
            safe_average(stress_levels)
        )
    }

def get_health_recommendations(heart_rate, hrv, sleep, stress):
    """Generate personalized health recommendations based on metrics"""
    recommendations = []
    
    if heart_rate and heart_rate > 75:
        recommendations.append({
            "category": "heart_rate",
            "title": "Your resting heart rate is elevated",
            "description": "A resting heart rate above 75 bpm may indicate higher stress levels.",
            "action": "Try daily deep breathing exercises for 5 minutes to help lower your heart rate."
        })
    
    if hrv and hrv < 40:
        recommendations.append({
            "category": "stress",
            "title": "Your heart rate variability is low",
            "description": "Low HRV is associated with increased stress and burnout.",
            "action": "Consider adding 20 minutes of meditation to your daily routine."
        })
    
    if sleep and sleep < 7:
        recommendations.append({
            "category": "sleep",
            "title": "You're not getting enough sleep",
            "description": f"Your average of {sleep:.1f} hours is below the recommended 7-9 hours.",
            "action": "Try establishing a consistent sleep schedule, even on weekends."
        })
    
    if stress and stress > 0.7:  # Assuming stress is normalized 0-1
        recommendations.append({
            "category": "stress",
            "title": "Your stress levels are high",
            "description": "Continuous high stress can contribute to burnout over time.",
            "action": "Schedule regular breaks during your workday, even if just for 5 minutes."
        })
    
    # Add general recommendations if the list is empty
    if not recommendations:
        recommendations.append({
            "category": "general",
            "title": "Maintain your wellness routine",
            "description": "Your health metrics look good. Keep up your current practices.",
            "action": "Continue monitoring your health data to catch any changes early."
        })
    
    return recommendations