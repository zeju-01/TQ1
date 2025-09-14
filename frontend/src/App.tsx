// 主应用组件
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useAuthStore } from '@/store/auth';

// 页面组件 (稍后实现)
import LoginPage from '@/pages/auth/LoginPage';
import DashboardLayout from '@/components/layout/DashboardLayout';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Routes>
        {/* 登录页面 */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
        />
        
        {/* 受保护的路由 */}
        <Route 
          path="/*" 
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Layout>
  );
};

export default App;