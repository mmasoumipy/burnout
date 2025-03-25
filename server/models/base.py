from sqlalchemy.ext.declarative import declarative_base
from database import engine

Base = declarative_base()

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")