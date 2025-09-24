import api from './api';
import type { BusinessStaff } from '../types';
import type { PaginatedResponse } from '../types'; // 导入分页响应类型

// 更新业务人员列表响应类型，使用与供应商、运营商和快递公司相同的分页结构
export interface BusinessStaffListResponse extends PaginatedResponse<BusinessStaff> {}

export interface CreateBusinessStaffRequest {
  staff_name: string;
  nickname?: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  contact_info?: string;
}

export interface UpdateBusinessStaffRequest extends CreateBusinessStaffRequest {
  id: number;
  status?: 'active' | 'inactive';
}

export const businessStaffService = {
  // 获取业务人员列表
  async getList(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<BusinessStaffListResponse> {
    const response = await api.get('/business-staff', { params });
    return response.data;
  },

  // 获取单个业务人员
  async getById(id: number): Promise<BusinessStaff> {
    const response = await api.get(`/business-staff/${id}`);
    return response.data;
  },

  // 创建业务人员
  async create(data: CreateBusinessStaffRequest): Promise<BusinessStaff> {
    const response = await api.post('/business-staff', data);
    return response.data;
  },

  // 更新业务人员
  async update(id: number, data: CreateBusinessStaffRequest): Promise<BusinessStaff> {
    const response = await api.put(`/business-staff/${id}`, data);
    return response.data;
  },

  // 删除业务人员
  async delete(id: number): Promise<void> {
    await api.delete(`/business-staff/${id}`);
  },

  // 获取业务人员选项（用于下拉框）
  async getOptions(): Promise<Array<{ label: string; value: number }>> {
    try {
      const response = await api.get('/business-staff/options');
      return response.data;
    } catch (error: any) {
      // 如果是频率限制错误，显示更友好的提示
      if (error.response && error.response.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      }
      throw error;
    }
  },

  // 获取职务列表
  async getPositions(): Promise<string[]> {
    try {
      const response = await api.get('/business-staff/positions');
      return response.data;
    } catch (error: any) {
      // 如果是频率限制错误，显示更友好的提示
      if (error.response && error.response.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      }
      throw error;
    }
  },

  // 根据职务获取业务人员
  async getByPosition(position: string): Promise<BusinessStaff[]> {
    try {
      const response = await api.get(`/business-staff/position/${position}`);
      return response.data;
    } catch (error: any) {
      // 如果是频率限制错误，显示更友好的提示
      if (error.response && error.response.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      }
      throw error;
    }
  }
};