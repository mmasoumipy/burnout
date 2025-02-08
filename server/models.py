from database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from database import engine, get_db

Base.metadata.create_all(bind=engine)


# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

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

class Response(Base):
    __tablename__ = "responses"
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    question_id = Column(Integer)
    score = Column(Integer)

    test = relationship("Test")
