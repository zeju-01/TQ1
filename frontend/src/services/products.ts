import api from './api';
import type { Product } from '../types';

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
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
    pageSize?: number;
    search?: string;
  }): Promise<ProductListResponse> {
    const response = await api.get('/products', { params });
    return response.data;
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