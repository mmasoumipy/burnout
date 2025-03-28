from sqlalchemy import Column, Integer, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from models.base import Base


class MoodType(PyEnum):
    FRUSTRATED = "frustrated"
    SAD = "sad"
    CALM = "calm"
    HAPPY = "happy"
    EXCITED = "excited"

class Mood(Base):
    __tablename__ = "moods"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(Enum(MoodType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="moods")