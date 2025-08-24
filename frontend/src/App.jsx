import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  CoffeeOutlined
} from "@ant-design/icons";
import UserTable from "./pages/UserTable";
import StockCards from "./pages/StockCard";
import OrderTable from "./pages/OrderTable";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
        {/* SIDER */}
        <Sider 
          breakpoint="lg" 
          collapsedWidth="0"
          style={{
            height: "100vh",
            position: "sticky",
            top: 0,
          }}
        >
          <div
            style={{
              height: 64,
              margin: 16,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              lineHeight: "70px",
            }}
          >
            <h2>Bean & Brews ☕</h2>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
          >
            <Menu.Item key="1" icon={<ShoppingCartOutlined />}>
              <Link to="/orders">Coffee Orders</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<CoffeeOutlined />}>
              <Link to="/stock">Coffee Stock</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<UserOutlined />}>
              <Link to="/customers">Customer Data</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        {/* MAIN LAYOUT */}
        <Layout>
          <Header
            style={{
              background: "#5c5e60ff",
              display: "flex",
              flexDirection: "row",
              padding: "0 24px",
              alignItems: "center",
              height: "8vh",
              position: "sticky",
              top: 0,
              zIndex: 10
            }}
          >
            <Title level={3} style={{ margin: 0, color: "#fff" }}>
              Coffee Shop Resource Management
            </Title>
          </Header>

          <Content style={{ margin: 24, padding: 24, background: "#fff", overflowY: "auto", height: "calc(100vh - 8vh)" }}>
            <Routes>
              <Route path="/" element={<Navigate to="/orders" />} />
              <Route path="/orders" element={<OrderTable />} />
              <Route path="/stock" element={<StockCards />} />
              <Route path="/customers" element={<UserTable />} />
              <Route path="*" element={<h2>Page Not Found</h2>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;