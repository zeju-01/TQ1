// 认证相关API
import api from './api';
import { ApiResponse, LoginRequest, LoginResponse, User } from '@/types';

export const authApi = {
  // 用户登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/login', data).then(res => res.data);
  },

  // 用户注册
  register: (data: any): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/register', data).then(res => res.data);
  },

  // 刷新令牌
  refreshToken: (refreshToken: string): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }).then(res => res.data);
  },

  // 用户登出
  logout: (): Promise<ApiResponse> => {
    return api.post('/auth/logout').then(res => res.data);
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<{ user: User }>> => {
    return api.get('/auth/me').then(res => res.data);
  },

  // 修改密码
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    return api.post('/auth/change-password', data).then(res => res.data);
  },

  // 验证令牌
  verifyToken: (): Promise<ApiResponse<{
    user: User;
    isExpiringSoon: boolean;
    expiresIn: number;
  }>> => {
    return api.get('/auth/verify').then(res => res.data);
  },
};