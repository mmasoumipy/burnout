from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Test, Mood
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import traceback

router = APIRouter()

class StreakResponse(BaseModel):
    currentStreak: int
    longestStreak: int
    weeklyCheckIns: int
    totalAssessments: int
    lastActivity: Optional[str] = None

@router.get("/streaks/{user_id}")
def get_user_streaks(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {
                "currentStreak": 0,
                "longestStreak": 0,
                "weeklyCheckIns": 0,
                "totalAssessments": 0,
                "lastActivity": None
            }
        
        # Get all user activity (moods, completed tests, and micro-assessments)
        try:
            moods = db.query(Mood).filter(Mood.user_id == user_id).all()
        except Exception as e:
            print(f"Error querying moods: {e}")
            moods = []
            
        try:
            # Try with completed filter first
            tests = db.query(Test).filter(
                Test.user_id == user_id,
                Test.completed == True
            ).all()
        except Exception as e:
            print(f"Error querying tests with completed filter: {e}")
            # If that fails (e.g., completed column doesn't exist), try without it
            try:
                tests = db.query(Test).filter(Test.user_id == user_id).all()
            except Exception as e2:
                print(f"Error querying tests without filter: {e2}")
                tests = []
        
        # Get micro-assessments if they exist (using try-except in case the table doesn't exist yet)
        micro_assessments = []
        try:
            from models import MicroAssessment
            micro_assessments = db.query(MicroAssessment).filter(
                MicroAssessment.user_id == user_id
            ).all()
        except Exception as e:
            print(f"No micro-assessments available: {e}")
            # This is ok - the table might not exist yet
        
        # Combine all activity and get unique dates
        activity_dates = set()
        
        for mood in moods:
            try:
                activity_dates.add(mood.created_at.date())
            except Exception as e:
                print(f"Error processing mood date: {e}")
        
        for test in tests:
            try:
                activity_dates.add(test.created_at.date())
            except Exception as e:
                print(f"Error processing test date: {e}")
        
        for assessment in micro_assessments:
            try:
                activity_dates.add(assessment.created_at.date())
            except Exception as e:
                print(f"Error processing micro-assessment date: {e}")
        
        if not activity_dates:
            return {
                "currentStreak": 0,
                "longestStreak": 0,
                "weeklyCheckIns": 0,
                "totalAssessments": len(tests),
                "lastActivity": None
            }
        
        # Sort dates
        sorted_dates = sorted(activity_dates)
        
        # Calculate current streak
        current_streak = 0
        today = datetime.utcnow().date()
        
        # If there was activity today, start streak at 1
        if today in sorted_dates:
            current_streak = 1
            check_date = today - timedelta(days=1)
        else:
            # If the most recent activity was yesterday, start streak at 1
            if sorted_dates and sorted_dates[-1] == today - timedelta(days=1):
                current_streak = 1
                check_date = today - timedelta(days=2)
            else:
                # No current streak
                try:
                    longest_streak = calculate_longest_streak(sorted_dates)
                    weekly_checkins = count_weekly_checkins(sorted_dates)
                    last_activity = sorted_dates[-1].isoformat() if sorted_dates else None
                except Exception as e:
                    print(f"Error calculating streak stats: {e}")
                    longest_streak = 0
                    weekly_checkins = 0
                    last_activity = None
                    
                return {
                    "currentStreak": 0,
                    "longestStreak": longest_streak,
                    "weeklyCheckIns": weekly_checkins,
                    "totalAssessments": len(tests),
                    "lastActivity": last_activity
                }
        
        # Continue checking previous days for streak
        try:
            while check_date in sorted_dates:
                current_streak += 1
                check_date = check_date - timedelta(days=1)
                
            longest_streak = calculate_longest_streak(sorted_dates)
            weekly_checkins = count_weekly_checkins(sorted_dates)
            last_activity = sorted_dates[-1].isoformat() if sorted_dates else None
        except Exception as e:
            print(f"Error in streak calculation loop: {e}")
            current_streak = 0
            longest_streak = 0
            weekly_checkins = 0
            last_activity = None
            
        return {
            "currentStreak": current_streak,
            "longestStreak": longest_streak,
            "weeklyCheckIns": weekly_checkins,
            "totalAssessments": len(tests),
            "lastActivity": last_activity
        }
            
    except Exception as e:
        print(f"Unhandled error in get_user_streaks: {e}")
        traceback.print_exc()
        # Return default values instead of throwing a 500 error
        return {
            "currentStreak": 0,
            "longestStreak": 0,
            "weeklyCheckIns": 0,
            "totalAssessments": 0,
            "lastActivity": None
        }

def calculate_longest_streak(dates):
    if not dates:
        return 0
    
    dates = sorted(dates)
    longest_streak = 1
    current_streak = 1
    
    for i in range(1, len(dates)):
        # If dates are consecutive
        if (dates[i] - dates[i-1]).days == 1:
            current_streak += 1
        else:
            longest_streak = max(longest_streak, current_streak)
            current_streak = 1
    
    return max(longest_streak, current_streak)

def count_weekly_checkins(dates):
    if not dates:
        return 0
    
    one_week_ago = datetime.utcnow().date() - timedelta(days=7)
    return sum(1 for date in dates if date >= one_week_ago)