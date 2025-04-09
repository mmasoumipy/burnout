from models.base import Base
from models.user import User
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean, func
from sqlalchemy.orm import relationship


class Test(Base):
    __tablename__ = "tests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    emotional_exhaustion_score = Column(Integer, nullable=True)
    depersonalization_score = Column(Integer, nullable=True)
    personal_accomplishment_score = Column(Integer, nullable=True)
    emotional_exhaustion_level = Column(String, nullable=True)
    depersonalization_level = Column(String, nullable=True)
    personal_accomplishment_level = Column(String, nullable=True)
    burnout_level = Column(String, nullable=True)
    completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="tests")
    responses = relationship("Response", back_populates="test")