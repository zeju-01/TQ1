// 用户管理相关API
import api from './api';
import { ApiResponse, PaginatedResponse, User } from '@/types';

export interface CreateUserRequest {
  username: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  abbreviation?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  permission: 'admin' | 'manage' | 'operate' | 'view';
  remarks?: string;
}

export interface UpdateUserRequest {
  full_name: string;
  abbreviation?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  permission: 'admin' | 'manage' | 'operate' | 'view';
  remarks?: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmNewPassword: string;
}

export const usersApi = {
  // 获取用户列表（分页）
  getList: (params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResponse<User>> => {
    return api.get('/users', { params }).then(res => res.data);
  },

  // 获取单个用户详情
  getById: (id: number): Promise<ApiResponse<User>> => {
    return api.get(`/users/${id}`).then(res => res.data);
  },

  // 创建用户
  create: (data: CreateUserRequest): Promise<ApiResponse<User>> => {
    return api.post('/users', data).then(res => res.data);
  },

  // 更新用户
  update: (id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    return api.put(`/users/${id}`, data).then(res => res.data);
  },

  // 删除用户
  delete: (id: number): Promise<ApiResponse> => {
    return api.delete(`/users/${id}`).then(res => res.data);
  },

  // 重置用户密码（管理员功能）
  resetPassword: (id: number, data: ResetPasswordRequest): Promise<ApiResponse> => {
    return api.post(`/users/${id}/reset-password`, data).then(res => res.data);
  },

  // 切换用户状态（启用/禁用）
  toggleStatus: (id: number, status: 'active' | 'inactive'): Promise<ApiResponse<User>> => {
    return api.patch(`/users/${id}/status`, { status }).then(res => res.data);
  },
};