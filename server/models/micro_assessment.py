from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base


class MicroAssessment(Base):
    __tablename__ = "micro_assessments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    fatigue_level = Column(Integer)  # 1-5 scale
    stress_level = Column(Integer)   # 1-5 scale
    work_satisfaction = Column(Integer)  # 1-5 scale
    sleep_quality = Column(Integer)  # 1-5 scale
    support_feeling = Column(Integer)  # 1-5 scale
    comments = Column(Text, nullable=True)
    burnout_risk_score = Column(Float)  # Calculated risk score
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")