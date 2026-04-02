# FastAPI Personal Finance Project 

## A full-stack application backend for tracking transactions and managing budgets.

### Tech Stack:
* Backend: FastAPI (Python), SQLAlchemy ORM
* Frontend: React
* Database: PostgreSQL
* Migrations: Alembic

### Key Features: 
* JWT Authentication for secure user access.
* Relational database schema for categorizing income vs. expenses.
* Automated database migrations via Alembic.

### How to Run Backend:

### Navigate to the /FastAPI directory:

#### Install dependencies
```sh
pip install -r requirements.txt
```

#### Run migrations
```sh
alembic upgrade head
```

#### Start the server
```sh
uvicorn main:app --reload
```
Note: Ensure your database connection string is configured in your .env file

### How to Run Frontend:

Navigate to `/React/finance-app` directory

#### Install dependencies
```sh
npm install
```

##### Start the development server
```sh
npm start
```

