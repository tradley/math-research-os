from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, hash_password, verify_password, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserRead

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(
        email=body.email,
        display_name=body.display_name or body.email.split("@")[0],
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token({"sub": user.id}))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return TokenResponse(access_token=create_access_token({"sub": user.id}))


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return user
