from database import Base
from enum import Enum
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, UniqueConstraint, Enum as TypeEnum
from sqlalchemy.orm import relationship

class TransactionCategory(str, Enum):
  housing = "housing"
  utilities = "utilities"
  food = "food"
  transportation = "transportation"
  entertainment = "entertainment"
  shopping = "shopping"
  personal_care = "personal_care"
  health = "health"
  travel = "travel"
  subscriptions = "subscriptions"
  education = "education"
  financial = "financial"
  income = "income"
  other = "other"

class Transaction(Base):
  __tablename__ = 'transactions'

  id = Column(Integer, primary_key=True, index=True)
  amount = Column(Float)
  category = Column(TypeEnum(TransactionCategory), nullable=False, default=TransactionCategory.other)
  description = Column(String)
  is_income = Column(Boolean)
  date = Column(String)
  user_id = Column(Integer, ForeignKey("users.id"))

  owner = relationship("User", back_populates="transactions")

class User(Base):
  __tablename__ = 'users'

  id = Column(Integer, primary_key=True, index=True)
  username = Column(String, unique=True, index=True)
  hashed_password = Column(String)

  transactions = relationship("Transaction", back_populates="owner")

class Budget(Base):
  __tablename__ = 'budgets'

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"))
  amount = Column(Float)
  month = Column(Integer)
  year = Column(Integer)

  __table_args__ = (UniqueConstraint('user_id', 'month', 'year'),)

