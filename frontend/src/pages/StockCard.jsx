import React, { useEffect, useState } from "react";
import { Typography, Card, Button, Modal, Form, Input, message, Row, Col, Pagination } from "antd";



const StockCards = () => {
    
    const [items, setItems] = useState([{}]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { Title } = Typography;
    const [form] = Form.useForm();
    const [editingCoffee, setEditingCoffee] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [deleteModal, setDeleteModal] = useState(false)

    // Pagination Section
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    const convertedItems = Object.values(items)
    const paginatedItems = convertedItems.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Fetching all items
    const fetchItems = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/stocks");
            const data = await res.json();
            const keyedItems = {};
            data.forEach(item => {
                keyedItems[item.id] = item;
            });
            setItems(keyedItems);
        } catch (err) {
            message.error("Failed to fetch items");
        }
    };

    // Functions to handle form submission to backend
    const onFinish = async (values) => {
        try {
            let res;
            if(editingCoffee) {
                res = await fetch(`http://127.0.0.1:8000/stocks/${editingCoffee.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });
            } else {
                res = await fetch("http://127.0.0.1:8000/stocks", {
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

            setItems(prev => ({
                ...prev,               
                [newData.id]: newData  
            }));


            form.resetFields();
            setIsModalOpen(false);
            setEditingCoffee(false);
        } catch (err) {
            message.error("Failed to add/modify coffee");
        }
    };

    // Function to mark user is currently editing a specific record and get record id
    const onEdit = (record) => {
        setEditingCoffee(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    // Functions to handle deletion of record. OnDelete will trigger modal then followed by handleDelete after click "OK" on modal
    const onDelete = (record) => {
        setSelectedRecord(record);
        setDeleteModal(true);
    }

    const handleDelete = async (record) => {
        const res = await fetch(`http://127.0.0.1:8000/stocks/${record.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        const msg = await res.json();

        if (msg.error){
            message.error(data.error);
            return;
        } else {
            const newItems = { ...items };
            delete newItems[record.id];
            setItems(newItems)
            setSelectedRecord(null);
        }
    }

    // Fetching items on initial page loading
    useEffect(() => {
        fetchItems();
    }, []);

    // Fetch data dari backend
    return (
        <div>
            <Title level={3} style={{ margin: 0, color: "#000000ff"}}> Available Coffee Beans 🍵 </Title>
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
                Add New Item ✨
            </Button>

            <Row gutter={[16, 16]}>
                {paginatedItems.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                        <Card 
                            title={item.name}
                            className="custom-card"
                            bordered
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                marginTop: "3vh",
                            }}
                        > 

                            <p><strong>Origin:</strong> {item.origin}</p>
                            <p>
                                <strong>Stock:</strong>{" "}
                                {item.stock > 0 ? (
                                    `${item.stock} bags`
                                ) : (
                                    <span style={{ color: "red", fontWeight: "bold" }}>SOLD OUT</span>
                                )}
                            </p>
                            <p><strong>Price:</strong> Rp.{item.price} / bag</p>

                            <div style={{ display: "flex", gap: "8px", marginTop: 15, justifyContent: "flex-end" }}>
                                <Button 
                                    onClick={() => onEdit(item)}
                                    style={{
                                        color: "#ffffffff",
                                        background: "linear-gradient(90deg, #a0977eff 0%, #897872ff 100%)"
                                    }}
                                    >
                                    Edit
                                </Button>
                                <Button 
                                    onClick={() => onDelete(item)}
                                    style={{
                                    color: "#ffffffff",
                                    background: "linear-gradient(90deg, #a36a66ff 0%, #772d12ff 100%)"
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>

                        </Card>
                    </Col>
                ))}
            </Row>
            

            <Modal
                title={editingCoffee ? "Edit Coffee" : "Add New Coffee"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingCoffee(false);
                    form.resetFields();
                    }
                }
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Coffee Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="origin" label="Coffee Origin" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="stock" label="Available Stock Qty (bags)" rules={[{ required: true}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="Price per Bag" rules={[{ required: true}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Add Coffee!
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={convertedItems.length}
                    onChange={(page) => setCurrentPage(page)}
                />
            </div>

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

export default StockCards;
