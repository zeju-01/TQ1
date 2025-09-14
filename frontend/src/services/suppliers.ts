import api from './api';
import type { Supplier } from '../types';

export interface SupplierListResponse {
  data: Supplier[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateSupplierRequest {
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_info?: string;
  other_info?: string;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  id: number;
  status?: 'active' | 'inactive';
}

export const supplierService = {
  // 获取供应商列表
  async getList(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<SupplierListResponse> {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  // 获取单个供应商
  async getById(id: number): Promise<Supplier> {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // 创建供应商
  async create(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await api.post('/suppliers', data);
    return response.data;
  },

  // 更新供应商
  async update(id: number, data: CreateSupplierRequest): Promise<Supplier> {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  // 删除供应商
  async delete(id: number): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },

  // 获取供应商选项（用于下拉框）
  async getOptions(): Promise<Array<{ label: string; value: number }>> {
    const response = await api.get('/suppliers/options');
    return response.data;
  }
};