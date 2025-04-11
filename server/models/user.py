from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class GenderEnum(enum.Enum):
    Male = "Male"
    Female = "Female"
    Other = "Other"

class MaritalStatusEnum(enum.Enum):
    Married = "Married"
    Single = "Single"
    Other = "Other"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    
    # Personal Information
    age = Column(Integer, nullable=True)
    gender = Column(Enum(GenderEnum), nullable=True)
    marital_status = Column(Enum(MaritalStatusEnum), nullable=True)
    has_children = Column(Boolean, nullable=True)
    
    # Professional Information
    specialty = Column(String, nullable=True)
    work_setting = Column(String, nullable=True)
    career_stage = Column(String, nullable=True)
    work_hours = Column(Integer, nullable=True)
    on_call_frequency = Column(String, nullable=True)
    years_experience = Column(Integer, nullable=True)
    previous_burnout = Column(Integer, nullable=True)
    
    # Reasons for Using App (stored as comma-separated IDs)
    reasons = Column(String, nullable=True)  
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    moods = relationship("Mood", back_populates="user")
    tests = relationship("Test", back_populates="user")
    journals = relationship("Journal", back_populates="user")
    micro_assessments = relationship("MicroAssessment", back_populates="user")
    health_data = relationship("HealthData", back_populates="user")