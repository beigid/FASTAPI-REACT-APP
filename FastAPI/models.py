from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

class Transaction(Base):
  __tablename__ = 'transactions'

  id = Column(Integer, primary_key=True, index=True)
  amount = Column(Float)
  category = Column(String)
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

