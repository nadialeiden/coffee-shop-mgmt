from fastapi import APIRouter
from database import get_connection

router = APIRouter()

@router.get("/")
def get_items():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, name, origin, stock, price FROM items")
    stocks = [
        {"id": row[0], "name": row[1], "origin": row[2], "stock": row[3], "price": row[4]}
        for row in c.fetchall()
    ]
    conn.close()
    return stocks



@router.post("/")
def add_items(item: dict):
    conn = get_connection()
    c = conn.cursor()

    c.execute(
        "INSERT INTO items (name, origin, stock, price) VALUES (?, ?, ?, ?)",
        (item["name"], item["origin"], item["stock"], item["price"]),
    )
    conn.commit()
    item_id = c.lastrowid
    conn.close()
    return {"id": item_id, **item}

@router.delete("/{item_id}")
def delete_item(item_id: int):
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM items WHERE id = ?", (item_id,))
    existing = c.fetchone()
    if not existing:
        conn.close()
        return {"error": "Item does not exist!"}

    c.execute("DELETE FROM items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"message": "Items deleted successfully"}


@router.put("/{item_id}")
def update_item(item_id: int, item: dict):
    conn = get_connection()
    c = conn.cursor()

    c.execute(
        """UPDATE items
           SET name = ?, origin = ?, stock = ?, price = ?
           WHERE id = ?""",
        (item["name"], item["origin"], item["stock"], item["price"], item_id),
    )

    conn.commit()
    conn.close()
    return {"id": item_id, **item}