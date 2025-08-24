import React, { useEffect, useState } from "react";
import { Typography, Table, Button, Modal, Form, Input, message, Select, DatePicker} from "antd";
import dayjs from "dayjs";

const OrderTable = () => {
  const { Title } = Typography;
  const [orders, setOrders] = useState([{}])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [coffeeOptions, setCoffeeOptions] = useState([{}]);
  const [editingCoffee, setEditingCoffee] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false)

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/orders");
      const data = await res.json();
      const keyedOrders = {};

      data.forEach(order => {
        keyedOrders[order.order_id] = {
          ...order,
          items_list: order.items.map(i => `${i.name} (x${i.qty})`).join(", ")
        };
      });

      setOrders(keyedOrders);
    } catch (err) {
      message.error("Failed to fetch orders");
    }
    setLoading(false);
  };

  const fetchCoffees = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/stocks");
      const data = await res.json();
      const coffeeMap = {};
      data.forEach(item => {
        coffeeMap[item.id] = item;
      });
      setCoffeeOptions(coffeeMap)
    } catch {
      message.error("Failed to fetch coffee items");
    }
  };


  useEffect(() => {
    fetchOrders();
    fetchCoffees();
  }, []);

  const onFinish = async (values) => {
    try {
      let res;
      if (editingCoffee){
        res = await fetch(`http://127.0.0.1:8000/orders/${editingCoffee}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }else{
        res = await fetch("http://127.0.0.1:8000/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }

      const newData = await res.json();

      if (newData.error){
        message.error(newData.error);
        return;
      }
      
      setOrders(prev => ({
        ...prev,
        [newData.order_id]: {
          ...newData,
          items_list: (newData.items || [])
            .map(i => {
              const coffeeName = coffeeOptions[i.item_id]?.name || "Unknown";
              return `${coffeeName} (x${i.qty})`;
            })
            .join(", ")
        }
      }));
      
      setIsModalOpen(false);
      setEditingCoffee(null);
      form.resetFields();
    } catch (err) {
      message.error("Failed to create order");
    }
  };

  const onEdit = (record) => {
    const fullOrder = orders[record.order_id];

    form.setFieldsValue({
      customer_name: fullOrder.customer_name,
      created_at: fullOrder.created_at 
        ? dayjs(fullOrder.created_at, "YYYY-MM-DD HH:mm") 
        : null,
      status: fullOrder.status,
      order_items: (fullOrder.items || []).map(i => ({
        item_id: i.item_id,
        qty: i.qty
      }))
    });

    setIsModalOpen(true);
    setEditingCoffee(record.order_id);
    
  };

  const onDelete = (record) => {
    setSelectedRecord(record.order_id);
    setDeleteModal(true);
  }
  
  const handleDelete = async (order_id) => {
    const res = await fetch(`http://127.0.0.1:8000/orders/${order_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    const msg = await res.json();

    if (msg.error){
      message.error(data.error);
      return;
    } else {
      const newOrders = { ...orders };
      delete newOrders[order_id];
      setOrders(newOrders)
      setSelectedRecord(null);
    }
  }

  const columns = [
    { title: "Order ID", dataIndex: "order_id", key: "order_id" },
    { title: "Customer", dataIndex: "customer_name", key: "customer_name"},
    { title: "Created At", dataIndex: "created_at", key: "created_at" },
    {   
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "NOT STARTED": "red",
          "PENDING": "orange",
          "FINISHED": "green",
        };
        const color = colorMap[status] || "gray";

        return <span style={{ color, fontWeight: "bold" }}>{status}</span>;
      }
    },
    { title: "Items List", dataIndex: "items_list", key: "items_list" },
    {
      key: "action",
      render: (_, record) => (
        <Button 
          onClick={() => onEdit(record)}
          style={{
            color: "#ffffffff",
            background: "linear-gradient(90deg, #a0977eff 0%, #897872ff 100%)"
          }}
        >
          Edit
        </Button>
      ),
    },
    {
      key: "delete",
      render: (_, record) => (
        <Button 
          onClick={() => onDelete(record)}
          style={{
            color: "#ffffffff",
            background: "linear-gradient(90deg, #a36a66ff 0%, #772d12ff 100%)"
          }}
        >
          Delete
        </Button>
      ),
    },
  ];


  return (
    <div>
      <Title level={3} style={{ margin: 0, color: "#000000ff"}}> Coffee Orders 📦 </Title>

      <Button
        type="primary"
        onClick={() => setIsModalOpen(true)}
        style={{
          background: "linear-gradient(90deg, #5d5f71ff 0%, #4f403bff 100%)",
          border: "none",
          color: "#fff",
          fontWeight: "bold",
          boxShadow: "0 0.4vh 0.6vh rgba(0,0,0,0.1)",
          borderRadius: "1vh",
          fontSize: "2vh",
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginTop: "3vh",
          minWidth: "1vw",        
          maxWidth: "300px",
        }}
      >
        Add New Order ✨
      </Button>

      <Table
        loading={loading}
        dataSource={Object.values(orders)}
        rowKey="order_id"
        style={{ marginTop: 16}}
        pagination={{ pageSize: 5, position: ["bottomCenter"] }} 
        columns={columns}
      />

      <Modal
        title="Add New Order"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingCoffee(null)
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: true, message: "Please input customer name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="created_at"
            label="Order Date & Time"
            rules={[{ required: true, message: "Please select date and time!" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.List name="order_items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <Form.Item
                      {...restField}
                      name={[name, "item_id"]}
                      rules={[{ required: true, message: "Select a coffee" }]}
                    >
                      <Select placeholder="Select coffee" style={{ width: 200 }}>
                        {Object.values(coffeeOptions).map(item => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.name} ({item.stock}) 
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "qty"]}
                      rules={[
                        { required: true, message: "Quantity required" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const itemId = getFieldValue(["order_items", name, "item_id"]);
                            const selectedItem = coffeeOptions[itemId];

                            if (!value || value < 1) {
                              return Promise.reject("Qty must be at least 1");
                            }
                            if (selectedItem && value > selectedItem.stock) {
                              return Promise.reject(`Qty cannot exceed current stock (${selectedItem.stock})`);
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input type="number" min={1} placeholder="Qty" style={{ width: 100 }} />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>Remove</Button>
                  </div>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add another coffee
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Form.Item
            label="Order Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="NOT STARTED">NOT STARTED</Option>
              <Option value="PENDING">PENDING</Option>
              <Option value="FINISHED">FINISHED</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit Order
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    
      <Modal
          title="Attention!"
          open={deleteModal}
          onCancel={() => {
              setDeleteModal(false);
              setSelectedRecord(null)
              }
          }
          onOk={() => {
              handleDelete(selectedRecord)
              setDeleteModal(false);
          }}
      >
          Are you sure you want to delete? 

      </Modal>

    </div>
  );
};

export default OrderTable;
