// 仪表板布局组件
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  InboxOutlined,
  ShoppingOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

// 导入页面组件
import DashboardPage from '@/pages/dashboard/DashboardPage';
import InventoryListPage from '@/pages/inventory/InventoryListPage';
import StockInPage from '@/pages/inventory/StockInPage';
import StockOutPage from '@/pages/inventory/StockOutPage';
import ReturnPage from '@/pages/inventory/ReturnPage';
import ProductListPage from '@/pages/products/ProductListPage';
import SupplierListPage from '@/pages/suppliers/SupplierListPage';
import BusinessStaffListPage from '@/pages/business-staff/BusinessStaffListPage';
import UserManagementPage from '@/pages/users/UserManagementPage';
import ReportsPage from '@/pages/reports/ReportsPage';
// 移除了对StockUpdatePage的导入

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人资料',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '设置',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ]
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: '库存管理',
      children: [
        { key: '/inventory/list', label: '库存列表' },
        { key: '/inventory/stock-in', label: '入库管理' },
        { key: '/inventory/stock-out', label: '出库管理' },
        { key: '/inventory/return', label: '退库管理' },
        // 移除了对'入库更新'的菜单项
      ],
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '基础数据',
      children: [
        { key: '/products/list', label: '产品管理' },
        { key: '/suppliers/list', label: '供应商管理' },
        { key: '/business-staff/list', label: '业务人员管理' },
      ],
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '报表管理',
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ 
          height: 64, 
          padding: '16px', 
          color: 'white', 
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '1px solid #001529'
        }}>
          {collapsed ? 'IOT' : '库存管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Space style={{ marginRight: 24 }}>
            <span>欢迎，{user?.full_name || user?.username}</span>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar 
                style={{ backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory/list" element={<InventoryListPage />} />
            <Route path="/inventory/stock-in" element={<StockInPage />} />
            <Route path="/inventory/stock-out" element={<StockOutPage />} />
            <Route path="/inventory/return" element={<ReturnPage />} />
            {/* 移除了对StockUpdatePage的路由 */}
            <Route path="/products/list" element={<ProductListPage />} />
            <Route path="/suppliers/list" element={<SupplierListPage />} />
            <Route path="/business-staff/list" element={<BusinessStaffListPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;