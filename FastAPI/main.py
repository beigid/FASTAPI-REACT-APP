from fastapi import FastAPI, HTTPException, Depends
from typing import Annotated, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from models import TransactionCategory
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
  category: TransactionCategory
  description: str
  is_income: bool
  date: str

  model_config = {
    "use_enum_values": True
  }

  @field_validator('category', mode='before')
  @classmethod
  def ensure_lowercase(cls, v):
    if isinstance(v, str):
      return v.lower()
    return v

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

class BudgetBase(BaseModel):
  amount: float
  month: int
  year: int

class BudgetModel(BudgetBase):
  user_id: int
  id: int
  class Config:
    from_attributes = True

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(get_current_user)]

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

@app.delete("/transactions/{transaction_id}")
async def delete_transaction(db: db_dependency, transaction_id: int, current_user: user_dependency):
  transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id, models.Transaction.user_id == current_user.id).first()
  if not transaction:
    raise HTTPException(status_code=404, detail="Transaction cannot be found")
  db.delete(transaction)
  db.commit()
  return {"message": "Transaction deleted successfully"}

@app.get("/transactions/", response_model=List[TransactionModel])
async def read_transactions(db: db_dependency, current_user: user_dependency, skip: int = 0, limit: int = 100):
  transactions = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id).offset(skip).limit(limit).all()
  return transactions

@app.post("/budget/", response_model=BudgetModel)
async def create_budget(budget: BudgetBase, db: db_dependency, current_user: user_dependency):
  existing = db.query(models.Budget).filter(
    models.Budget.user_id == current_user.id,
    models.Budget.month == budget.month,
    models.Budget.year == budget.year
  ).first()
  if existing:
    raise HTTPException(status_code=400, detail="Budget already exists for this month")
  db_budget = models.Budget(**budget.dict(), user_id=current_user.id)
  db.add(db_budget)
  db.commit()
  db.refresh(db_budget)
  return db_budget

@app.delete("/budget/{budget_id}")
async def delete_budget(db: db_dependency, current_user: user_dependency, budget_id: int):
  budget = db.query(models.Budget).filter(models.Budget.user_id == current_user.id, models.Budget.id ==
                                          budget_id).first()
  if not budget:
    raise HTTPException(status_code=404, detail="Transaction cannot be found")
  db.delete(budget)
  db.commit()
  return {"message": "Budget deleted successfully"}

@app.get("/budget/", response_model=BudgetModel | None)
async def get_budget(db: db_dependency, current_user: user_dependency, month: int, year: int):
  budget = db.query(models.Budget).filter(models.Budget.user_id == current_user.id, models.Budget.year == year,
                                          models.Budget.month == month).first()
  return budget



