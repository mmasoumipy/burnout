from models.base import Base
from models.user import User
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship


class Test(Base):
    __tablename__ = "tests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=func.now())
    emotional_exhaustion_score = Column(Integer)
    depersonalization_score = Column(Integer)
    personal_accomplishment_score = Column(Integer)
    emotional_exhaustion_level = Column(String)
    depersonalization_level = Column(String)
    personal_accomplishment_level = Column(String)
    burnout_level = Column(String)

    user = relationship("User")
