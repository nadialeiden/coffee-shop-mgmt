import React, { useEffect, useState } from "react";
import { Typography, Table, Button, Modal, Form, Input, message } from "antd";

const UserTable = () => {
  const [users, setUsers] = useState([{}]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { Title } = Typography;

  // Fetch user data from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/users");
      const data = await res.json();
      const keyedUsers = {};
      data.forEach(user => {
        keyedUsers[user.id] = user;
      });
      setUsers(keyedUsers);
    } catch (err) {
      message.error("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to handle form submission through modal
  const onFinish = async (values) => {
    try {
      let res;
      if(editingUser) {
        res = await fetch(`http://127.0.0.1:8000/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch("http://127.0.0.1:8000/users", {
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

      setUsers(prev => ({
          ...prev,               
          [newData.id]: newData  
      }));


      form.resetFields();
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      message.error("Failed to add user");
    }
  };

  // onEdit is to mark user is currently editing before submitting to backend
  const onEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // Functions to handle deletion of record. OnDelete will trigger modal then followed by handleDelete after click "OK" on modal
  const onDelete = (record) => {
    setSelectedRecord(record);
    setDeleteModal(true);
  }

  const handleDelete = async (record) => {
    const res = await fetch(`http://127.0.0.1:8000/users/${record.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const msg = await res.json();

    if (msg.error){
      message.error(data.error);
      return;
    } else {
      const newUsers = { ...users };
      delete newUsers[record.id];
      setUsers(newUsers)
      setSelectedRecord(null);
    }
  }

  // Columns to be rendered on the table
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Username", dataIndex: "username", key: "username"},
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
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
      <Title level={3} style={{ margin: 0, color: "#000000ff"}}> All Customer Data </Title>
      
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
          // padding: "1vh 3vw",
          fontSize: "2vh",
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginTop: "3vh",
          minWidth: "1vw",        
          maxWidth: "300px",
        }}
      >
        Add Customer ✨
      </Button>

      <Table 
        dataSource={Object.values(users)}
        columns={columns} 
        rowKey="id" 
        loading={loading} 
        style={{ 
          marginTop: 16}}
        pagination={{ pageSize: 5, position: ["bottomCenter"] }} 
      />
      
      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
          }
        }
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true },
              {
                pattern: /^\+?\d{9,15}$/,
                message: "Invalid phone number format!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add
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

export default UserTable;
