import api from './api';
import type { Product } from '../types';

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

export interface CreateProductRequest {
  name: string;
  model: string;
  description?: string;
  abbreviation?: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: number;
}

export const productService = {
  // 获取产品列表
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Product[]; total: number }> {
    // 将前端的pageSize转换为后端的limit
    const backendParams = {
      page: params?.page,
      limit: params?.limit,
      search: params?.search
    };
    
    const response = await api.get('/products', { params: backendParams });
    return {
      data: response.data.data,
      total: response.data.pagination.total
    };
  },

  // 获取单个产品
  async getById(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 创建产品
  async create(data: CreateProductRequest): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  // 更新产品
  async update(id: number, data: CreateProductRequest): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // 删除产品
  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  // 获取产品选项（用于下拉框）
  async getOptions(): Promise<Array<{ label: string; value: number }>> {
    const response = await api.get('/products/options');
    return response.data;
  }
};