from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base

class Response(Base):
    __tablename__ = "responses"
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    question_id = Column(Integer)
    score = Column(Integer)

    test = relationship("Test", back_populates="responses")