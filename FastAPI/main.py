from fastapi import FastAPI, HTTPException, Depends
from typing import Annotated, List
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, engine
import models
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user, create_access_token, hash_password, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta


app = FastAPI()
origins = [
  'http://localhost:3001',
  'https://your-own-finance-app.netlify.app'
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials = True,
  allow_methods = ['*'],
  allow_headers=['*']
)

class TransactionBase(BaseModel):
  amount: float
  category: str
  description: str
  is_income: bool
  date: str

class TransactionModel(TransactionBase):
  id: int
  user_id: int
  class Config:
    from_attributes = True

class UserCreate(BaseModel):
  username: str
  password: str

class Token(BaseModel):
  access_token: str
  token_type: str

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(get_current_user)]

models.Base.metadata.create_all(bind=engine)

@app.post("/auth/register")
async def register(user: UserCreate, db: db_dependency):
  existing_user = db.query(models.User).filter(models.User.username == user.username).first()
  if existing_user:
    raise HTTPException(status_code=400, detail="Username already registered")
  db_user = models.User(
    username=user.username,
    hashed_password=hash_password(user.password)
  )
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return {"message": "User created successfully"}

@app.post("/auth/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: db_dependency = None):
  user = db.query(models.User).filter(models.User.username == form_data.username).first()
  if not user or not verify_password(form_data.password, user.hashed_password):
    raise HTTPException(status_code=401, detail="Incorrect username or password")
  access_token = create_access_token(
    data={"sub": user.username},
    expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  )
  return {"access_token": access_token, "token_type": "bearer"}

@app.post("/transactions/", response_model=TransactionModel)
async def create_transaction(transaction: TransactionBase, db: db_dependency, current_user: user_dependency):
  db_transaction = models.Transaction(**transaction.dict(), user_id=current_user.id)
  db.add(db_transaction)
  db.commit()
  db.refresh(db_transaction)
  return db_transaction

@app.get("/transactions/", response_model=List[TransactionModel])
async def read_transactions(db: db_dependency, current_user: user_dependency, skip: int = 0, limit: int = 100):
  transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).offset(skip).limit(limit).all()
  return transactions
