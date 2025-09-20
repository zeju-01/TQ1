// 库存管理服务
import api from './api';
import { Inventory, StockInRequest } from '../types';

// 扩展库存接口以包含前端特定字段
export interface StockInItem {
  id: number;
  imei: string;
  product_name: string | number;
  product_model: string;
  operator: string;
  box_number: string;
  factory_order: string;
  quantity: number;
  contract_number: string;
  stock_in_number: string;
  stock_in_time: string;
  supplier: string;
  remark: string;
  receipt_documents: any[];
  status: 'pending' | 'success' | 'error';
  error_message?: string;
  // 可选的后端字段
  stock_in_auto_number?: string;
  transaction_type?: 'in' | 'out' | 'return';
  created_at?: string;
  updated_at?: string;
}

export interface BatchStockInRequest {
  stockInList: StockInItem[];
}

export interface StockInResponse {
  success: boolean;
  message: string;
  data?: Inventory | Inventory[];
  total?: number;
  successCount?: number;
  failedCount?: number;
  errors?: Array<{ index: number; imei: string; error: string }>;
}

// 单个入库
export const stockIn = async (stockInData: Partial<StockInRequest>): Promise<StockInResponse> => {
  try {
    console.log('库存服务接收到的数据:', stockInData);
    
    // 验证必填字段
    if (!stockInData.product_name) {
      throw new Error('产品名称不能为空');
    }
    
    // 注意：前端表单使用的是 stock_in_time，但后端期望的是 stock_in_date
    // 我们需要确保这个字段被正确传递
    if (!stockInData.stock_in_date) {
      throw new Error('入库时间不能为空');
    }
    
    if (!stockInData.stock_in_quantity || stockInData.stock_in_quantity <= 0) {
      throw new Error('入库数量必须为正整数');
    }
    
    // 验证IMEI格式（如果提供了IMEI号）
    if (stockInData.imei && !/^\d{15}$/.test(stockInData.imei)) {
      throw new Error('IMEI号格式不正确，应为15位数字');
    }
    
    const response = await api.post('/inventory/stock-in', stockInData);
    console.log('后端响应:', response);
    return response.data;
  } catch (error: any) {
    console.error('库存服务错误:', error);
    console.error('错误响应:', error.response);
    throw new Error(error.response?.data?.message || error.message || '入库失败');
  }
};

// 批量入库
export const batchStockIn = async (stockInList: StockInItem[]): Promise<StockInResponse> => {
  try {
    // 验证每个项目的数据
    for (const item of stockInList) {
      // 验证必填字段
      if (!item.product_name) {
        throw new Error('产品名称不能为空');
      }
      
      if (!item.stock_in_time) {
        throw new Error('入库时间不能为空');
      }
      
      if (!item.quantity || item.quantity <= 0) {
        throw new Error('入库数量必须为正整数');
      }
      
      // 验证IMEI格式（如果提供了IMEI号）
      if (item.imei && !/^\d{15}$/.test(item.imei)) {
        throw new Error(`IMEI号 ${item.imei} 格式不正确，应为15位数字`);
      }
    }
    
    // 转换前端数据为后端需要的格式
    const backendStockInList = stockInList.map(item => {
      return {
        product_id: typeof item.product_name === 'number' ? item.product_name : undefined,
        product_name: typeof item.product_name === 'string' ? item.product_name : undefined,
        product_model: item.product_model || '',
        operator: item.operator || '',
        imei: item.imei || '',
        batch_number: item.box_number || '',
        stock_in_quantity: item.quantity || 1,
        supplier: item.supplier || '',
        factory_order: item.factory_order || '',
        stock_in_contract_number: item.contract_number || '',
        stock_in_notes: item.remark || '',
        // 添加入库单号字段
        stock_in_number: item.stock_in_number || '',
        // 修复字段名不匹配的问题：前端使用 stock_in_time，后端需要 stock_in_date
        stock_in_date: item.stock_in_time || new Date().toISOString(),
        stock_in_by: 'current_user' // 这里应该从认证信息中获取当前用户
      };
    });
    
    const response = await api.post('/inventory/stock-in/batch', { stockInList: backendStockInList });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '批量入库失败');
  }
};

// 获取库存列表
export const getInventoryList = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    product_id?: number;
    operator?: string;
    supplier?: string;
    stock_in_status?: string;
    stock_out_status?: string;
    transaction_type?: string;
    start_date?: string;
    end_date?: string;
  } = {}
): Promise<{ data: Inventory[]; total: number; page: number; limit: number }> => {
  try {
    const response = await api.get('/inventory', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '获取库存列表失败');
  }
};

// 根据ID获取库存详情
export const getInventoryById = async (id: number): Promise<Inventory> => {
  try {
    const response = await api.get(`/inventory/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '获取库存详情失败');
  }
};

// 更新库存信息
export const updateInventory = async (id: number, updateData: Partial<Inventory>): Promise<Inventory> => {
  try {
    const response = await api.put(`/inventory/${id}`, updateData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '更新库存失败');
  }
};

// 删除库存记录
export const deleteInventory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/inventory/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '删除库存失败');
  }
};

// 检查IMEI是否已存在
export const checkIMEI = async (imei: string): Promise<{ available: boolean; existing?: any }> => {
  try {
    const response = await api.get(`/inventory/check-imei/${imei}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '检查IMEI失败');
  }
};