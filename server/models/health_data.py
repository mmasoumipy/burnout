from sqlalchemy import Column, Integer, DateTime, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
import enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class HealthData(Base):
    __tablename__ = "health_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    heart_rate = Column(Integer, nullable=True)
    sleep_duration = Column(Float, nullable=True)  # hours
    sleep_quality = Column(Float, nullable=True)  # score 0-1
    steps = Column(Integer, nullable=True)
    stress_level = Column(Float, nullable=True)  # score 0-1
    hrv = Column(Float, nullable=True)  # heart rate variability
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="health_data")