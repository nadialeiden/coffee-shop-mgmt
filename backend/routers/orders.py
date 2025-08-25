from fastapi import APIRouter, HTTPException
from database import get_connection
from datetime import datetime

router = APIRouter()

# Get all of the order data
@router.get("/")
def get_orders():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT 
            o.id AS order_id,
            o.customer_name,
            o.created_at,
            o.status,
            i.id AS item_id,
            i.name,
            i.origin,
            oi.qty,
            i.price
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN items i ON oi.item_id = i.id
        ORDER BY o.id DESC
    """)
    
    rows = c.fetchall()
    conn.close()

    orders = {}
    for row in rows:
        order_id = row[0]
        if order_id not in orders:
            orders[order_id] = {
                "order_id": row[0],
                "customer_name": row[1],
                "created_at": row[2],
                "status": row[3],
                "items": []
            }
        orders[order_id]["items"].append({
            "item_id": row[4],
            "name": row[5],
            "origin": row[6],
            "qty": row[7],
            "price": row[8]
        })

    return list(orders.values())

# Creating new order data through post
@router.post("/")
def create_order(order: dict):
    print(order)
    customer_name = order.get("customer_name")
    created_at_str = order.get("created_at")
    dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
    created_at = dt.strftime("%Y-%m-%d %H:%M")
    status = order.get("status")
    items = order.get("order_items", [])

    if not customer_name or not items:
        return {"error": "customer_name and items are required"}


    conn = get_connection()
    c = conn.cursor()

    try:
        c.execute(
            "INSERT INTO orders (customer_name, created_at, status) VALUES (?, ?, ?)",
            (customer_name, created_at, status)
        )
        order_id = c.lastrowid

        for item in items:
            item_id = item.get("item_id")
            qty = int(item.get("qty"))

            if item_id is None or qty is None:
                return {"error": "Each item must have item_id and qty"}

            c.execute("SELECT stock FROM items WHERE id = ?", (item_id,))
            stock_data = c.fetchone()
            if not stock_data:
                return {"error": f"Item {item_id} not found"}
            if stock_data[0] < qty:
                return {"error": f"Not enough stock for item {item_id}"}

            c.execute(
                "INSERT INTO order_items (order_id, item_id, qty) VALUES (?, ?, ?)",
                (order_id, item_id, qty)
            )

            c.execute(
                "UPDATE items SET stock = stock - ? WHERE id = ? AND stock >= ?",
                (qty, item_id, qty)
            )

        conn.commit()
        return {
            "order_id": order_id,
            "customer_name": customer_name,
            "created_at": created_at,
            "status": status,
            "items": items
        }

    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:
        conn.close()

# Update order data
@router.put("/{order_id}")
def update_order(order: dict, order_id: int):
    try:
        customer_name = order.get("customer_name")
        created_at_str = order.get("created_at")
        dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        created_at = dt.strftime("%Y-%m-%d %H:%M")
        status = order.get("status")
        items = order.get("order_items", [])

        if not customer_name or not items:
            return {"error": "customer_name and items are required"}

        conn = get_connection()
        c = conn.cursor()

        c.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
        if not c.fetchone():
            return {"error": f"Order {order_id} not found"}

        c.execute("SELECT item_id, qty FROM order_items WHERE order_id = ?", (order_id,))
        old_items = c.fetchall()
        for old_item_id, old_qty in old_items:
            c.execute("UPDATE items SET stock = stock + ? WHERE id = ?", (old_qty, old_item_id))

        c.execute("DELETE FROM order_items WHERE order_id = ?", (order_id,))

        c.execute(
            "UPDATE orders SET customer_name = ?, created_at = ?, status = ? WHERE id = ?",
            (customer_name, created_at, status, order_id)
        )

        for item in items:
            item_id = item.get("item_id")
            qty = int(item.get("qty"))

            if item_id is None or qty is None:
                return {"error": "Each item must have item_id and qty"}

            c.execute("SELECT stock FROM items WHERE id = ?", (item_id,))
            stock_data = c.fetchone()
            if not stock_data:
                return {"error": f"Item {item_id} not found"}
            if stock_data[0] < qty:
                return {"error": f"Not enough stock for item {item_id}"}

            c.execute(
                "INSERT INTO order_items (order_id, item_id, qty) VALUES (?, ?, ?)",
                (order_id, item_id, qty)
            )

            c.execute(
                "UPDATE items SET stock = stock - ? WHERE id = ? AND stock >= ?",
                (qty, item_id, qty)
            )

        conn.commit()
        return {
            "message": "Order updated",
            "order_id": order_id,
            "customer_name": customer_name,
            "created_at": created_at,
            "status": status,
            "items": items
        }

    except Exception as e:
        conn.rollback()
        return {"error": str(e)}

    finally:
        conn.close()

# Delete order data
@router.delete("/{order_id}")
def delete_user(order_id: int):
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    existing = c.fetchone()
    if not existing:
        conn.close()
        return {"error": "Order does not exist!"}

    c.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    conn.commit()
    conn.close()
    return {"message": "Order deleted successfully"}