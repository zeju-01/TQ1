// 认证相关API
import api from './api';
import { ApiResponse, LoginRequest, LoginResponse, User } from '@/types';

export const authApi = {
  // 用户登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/login', data)
      .then(res => res.data)
      .catch((error: any) => {
        // 如果是频率限制错误，显示更友好的提示
        if (error.response && error.response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        }
        throw error;
      });
  },

  // 用户注册
  register: (data: any): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/register', data)
      .then(res => res.data)
      .catch((error: any) => {
        // 如果是频率限制错误，显示更友好的提示
        if (error.response && error.response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        }
        throw error;
      });
  },

  // 刷新令牌
  refreshToken: (refreshToken: string): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    })
      .then(res => res.data)
      .catch((error: any) => {
        // 如果是频率限制错误，显示更友好的提示
        if (error.response && error.response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        }
        throw error;
      });
  },

  // 用户登出
  logout: (): Promise<ApiResponse> => {
    return api.post('/auth/logout')
      .then(res => res.data)
      .catch((error: any) => {
        // 如果是频率限制错误，显示更友好的提示
        if (error.response && error.response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        }
        throw error;
      });
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<{ user: User }>> => {
    return api.get('/auth/me')
      .then(res => res.data)
      .catch((error: any) => {
        // 如果是频率限制错误，显示更友好的提示
        if (error.response && error.response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        }
        throw error;
      });
  },

  // 修改密码
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    return api.post('/auth/change-password', data)
      .then(res => res.data)
      .catch((error: any) => {
        // 如果是频率限制错误，显示更友好的提示
        if (error.response && error.response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        }
        throw error;
      });
  },

  // 验证令牌
  verifyToken: (): Promise<ApiResponse<{
    user: User;
    isExpiringSoon: boolean;
    expiresIn: number;
  }>> => {
    return api.get('/auth/verify')
      .then(res => res.data)
      .catch((error: any) => {
        // 如果是频率限制错误，显示更友好的提示
        if (error.response && error.response.status === 429) {
          throw new Error('请求过于频繁，请稍后再试');
        }
        throw error;
      });
  },
};