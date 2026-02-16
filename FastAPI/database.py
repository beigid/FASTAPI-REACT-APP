from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

URL_DATABASE = os.getenv('DATABASE_URL', 'sqlite:///./finance.db')

if URL_DATABASE.startswith('postgres://'):
  URL_DATABASE = URL_DATABASE.replace('postgres://', 'postgresql://', 1)

connect_args = {"check_same_thread": False} if URL_DATABASE.startswith('sqlite') else {}

engine = create_engine(URL_DATABASE, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()