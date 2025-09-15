// 快递公司相关API
import api from './api';
import type { ApiResponse, PaginatedResponse } from '../types';

export interface Courier {
  id?: number;
  name: string;
  code?: string;
  description?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tracking_url?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CourierListResponse extends PaginatedResponse<Courier> {}

export const courierService = {
  // 获取快递公司列表
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CourierListResponse> {
    const response = await api.get('/couriers', { params });
    return response.data;
  },

  // 获取快递公司选项
  async getOptions(): Promise<ApiResponse<Courier[]>> {
    const response = await api.get('/couriers/options');
    return response.data;
  },

  // 获取快递公司详情
  async getById(id: number): Promise<ApiResponse<Courier>> {
    const response = await api.get(`/couriers/${id}`);
    return response.data;
  },

  // 创建快递公司
  async create(courier: Omit<Courier, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Courier>> {
    const response = await api.post('/couriers', courier);
    return response.data;
  },

  // 更新快递公司
  async update(id: number, courier: Partial<Courier>): Promise<ApiResponse<Courier>> {
    const response = await api.put(`/couriers/${id}`, courier);
    return response.data;
  },

  // 删除快递公司
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/couriers/${id}`);
    return response.data;
  },

  // 根据快递公司获取产品（兼容旧接口）
  async getProductsByCourier(courier: string): Promise<any[]> {
    const response = await api.get(`/products/courier/${courier}`);
    return response.data.data;
  }
};