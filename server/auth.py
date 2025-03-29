from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import User
from utils import hash_password, verify_password

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(name=user.name, email=user.email, password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered", "user_id": new_user.id}

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful", 
            "user": {
                "id": db_user.id, 
                "name": db_user.name, 
                "email": db_user.email
                }
            }


class PasswordUpdateRequest(BaseModel):
    user_id: int
    current_password: str
    new_password: str

@router.put("/update-password")
def update_password(data: PasswordUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.current_password, user.password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
