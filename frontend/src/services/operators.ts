// 运营商相关API
import api from './api';
import { ApiResponse, PaginationParams, PaginationResponse } from '../types/api';

export interface Operator {
  id?: number;
  name: string;
  code?: string;
  description?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface OperatorListResponse extends PaginationResponse {
  data: Operator[];
}

export const operatorService = {
  // 获取运营商列表
  async getList(params?: PaginationParams): Promise<OperatorListResponse> {
    const response = await api.get('/operators', { params });
    return response.data;
  },

  // 获取运营商选项
  async getOptions(): Promise<ApiResponse<Operator[]>> {
    const response = await api.get('/operators/options');
    return response.data;
  },

  // 获取运营商详情
  async getById(id: number): Promise<ApiResponse<Operator>> {
    const response = await api.get(`/operators/${id}`);
    return response.data;
  },

  // 创建运营商
  async create(operator: Omit<Operator, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Operator>> {
    const response = await api.post('/operators', operator);
    return response.data;
  },

  // 更新运营商
  async update(id: number, operator: Partial<Operator>): Promise<ApiResponse<Operator>> {
    const response = await api.put(`/operators/${id}`, operator);
    return response.data;
  },

  // 删除运营商
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/operators/${id}`);
    return response.data;
  },

  // 根据运营商获取产品（兼容旧接口）
  async getProductsByOperator(operator: string): Promise<any[]> {
    const response = await api.get(`/products/operator/${operator}`);
    return response.data.data;
  }
};