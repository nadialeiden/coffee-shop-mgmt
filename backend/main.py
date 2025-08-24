from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import users, stocks, orders

app = FastAPI()

# Allow frontend fetch (Vite default port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Init database
init_db()

# Include routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(stocks.router, prefix="/stocks", tags=["Stocks"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])

@app.get("/")
def root():
    return {"message": "API is running 🚀"}
