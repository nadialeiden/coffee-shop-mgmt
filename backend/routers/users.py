from fastapi import APIRouter
from database import get_connection

router = APIRouter()

# Get all user information
@router.get("/")
def get_users():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, username, name, email, phone FROM users")
    users = [
        {"id": row[0], "username": row[1], "name": row[2], "email": row[3], "phone": row[4]}
        for row in c.fetchall()
    ]
    conn.close()
    return users

# Create new user through post
@router.post("/")
def add_user(user: dict):
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT id FROM users WHERE username = ?", (user["username"],))
    existing = c.fetchone()
    if existing:
        conn.close()
        return {"error": "Username already exists!"}

    c.execute(
        "INSERT INTO users (username, name, email, phone) VALUES (?, ?, ?, ?)",
        (user["username"], user["name"], user["email"], user["phone"]),
    )
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    return {"id": user_id, **user}

# Update user through put
@router.put("/{user_id}")
def update_user(user_id: int, user: dict):
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT id FROM users WHERE username = ? AND id != ?", (user["username"], user_id))
    existing = c.fetchone()
    if existing:
        conn.close()
        return {"error": "Username already exists!"}

    c.execute(
        """UPDATE users 
           SET username = ?, name = ?, email = ?, phone = ? 
           WHERE id = ?""",
        (user["username"], user["name"], user["email"], user["phone"], user_id),
    )
    conn.commit()
    conn.close()
    return {"id": user_id, **user}

# Delete user
@router.delete("/{user_id}")
def delete_user(user_id: int):
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    existing = c.fetchone()
    if not existing:
        conn.close()
        return {"error": "User does not exist!"}

    c.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"message": "User deleted successfully"}
