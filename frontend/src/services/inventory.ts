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
  // 将 stock_in_time 改为 stock_in_date 以与后端保持一致
  stock_in_date: string;
  stock_in_document?: string;
  supplier: string;
  remark: string;
  receipt_documents: any[];
  status: 'pending' | 'success' | 'error';
  error_message?: string;
  // 可选的后端字段
  transaction_type?: 'in' | 'out' | 'return';
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
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
export const stockIn = async (stockInData: Partial<StockInRequest> & { receipt_documents?: any[], stock_in_document?: string }): Promise<StockInResponse> => {
  try {
    console.log('库存服务接收到的数据:', stockInData);
    
    // 验证必填字段
    if (!stockInData.product_name) {
      throw new Error('产品名称不能为空');
    }
    
    // 修复字段名称不匹配问题：前端表单使用的是 stock_in_time，但后端期望的是 stock_in_date
    // 确保 stock_in_date 字段被正确传递
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
    
    // 处理收货单据信息 - 优先使用已有的 stock_in_document 字段
    let stockInDocument = stockInData.stock_in_document || '';
    console.log('初始 stockInDocument:', stockInDocument);
    
    // 如果 stock_in_document 为空但有 receipt_documents，则从文件名生成
    if (!stockInDocument && stockInData.receipt_documents && stockInData.receipt_documents.length > 0) {
      // 检查文件对象的多种可能格式
      const fileNames = stockInData.receipt_documents.map((file: any) => {
        console.log('处理文件对象:', file);
        // 如果已经有response.filename，使用它
        if (file.response && file.response.filename) {
          return file.response.filename;
        }
        // 否则使用文件名
        return file.name || file.fileName || '收货单据';
      });
      stockInDocument = fileNames.join(', ');
      console.log('从 receipt_documents 生成的 stockInDocument:', stockInDocument);
    }
    
    // 添加收货单据信息到请求数据
    const requestData = {
      ...stockInData,
      stock_in_document: stockInDocument || undefined
    };
    
    console.log('发送到后端的请求数据:', requestData);
    
    const response = await api.post('/inventory/stock-in', requestData);
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
      
      // 将 stock_in_time 改为 stock_in_date 以与后端保持一致
      if (!item.stock_in_date) {
        throw new Error('入库时间不能为空');
      }
      
      if (!item.quantity || item.quantity <= 0) {
        throw new Error('入库数量必须为正整数');
      }
      
      // 验证IMEI格式
      if (item.imei && !/^\d{15}$/.test(item.imei)) {
        throw new Error(`IMEI号 ${item.imei} 格式不正确，应为15位数字`);
      }
    }
    
    // 转换前端数据为后端需要的格式
    const backendStockInList = stockInList.map(item => {
      // 直接使用项目中的 stock_in_document 字段，不再重新生成
      const stockInDocument = item.stock_in_document || '';
      console.log('处理项目，stockInDocument:', stockInDocument);
      console.log('项目 receipt_documents:', item.receipt_documents);
      
      // 正确处理产品名称，确保无论是字符串还是数字都正确传递
      let productName: string | undefined;
      if (typeof item.product_name === 'string') {
        productName = item.product_name;
      } else if (typeof item.product_name === 'number') {
        // 如果是数字，可能是产品ID，我们需要将其转换为字符串
        productName = item.product_name.toString();
      }
      
      const result = {
        product_name: productName,
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
        // 修复字段名不匹配的问题：前端使用 stock_in_date，后端需要 stock_in_date
        stock_in_date: item.stock_in_date || new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-'), // YYYY-MM-DD (北京时间)
        stock_in_by: 'current_user', // 这里应该从认证信息中获取当前用户
        // 直接使用已有的收货单据信息
        stock_in_document: stockInDocument || undefined
      };
      
      console.log('转换后的后端数据:', result);
      return result;
    });
    
    console.log('发送到后端的批量入库数据:', backendStockInList);
    
    const response = await api.post('/inventory/stock-in/batch', { stockInList: backendStockInList });
    console.log('后端批量入库响应:', response);
    
    // 正确处理后端返回的数据结构
    const responseData = response.data;
    if (responseData.success) {
      return {
        success: true,
        message: responseData.message || '批量入库完成',
        data: responseData.data?.results || [],
        total: responseData.data?.total || stockInList.length,
        successCount: responseData.data?.success || 0,
        failedCount: responseData.data?.failed || 0,
        errors: responseData.data?.errors || []
      };
    } else {
      return {
        success: false,
        message: responseData.message || '批量入库失败',
        errors: responseData.data?.errors || []
      };
    }
  } catch (error: any) {
    console.error('批量入库服务错误:', error);
    console.error('错误响应:', error.response);
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
    // 处理后端返回的数据格式
    if (response.data.pagination) {
      return {
        data: response.data.data,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit
      };
    } else {
      // 如果是旧格式，保持兼容性
      return response.data;
    }
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

// 更新库存记录
export const updateInventoryRecord = async (id: number, updateData: Partial<Inventory>): Promise<Inventory> => {
  try {
    const response = await api.put(`/inventory/${id}`, updateData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '更新库存记录失败');
  }
};

// 删除库存记录
export const deleteInventoryRecord = async (id: number): Promise<void> => {
  try {
    await api.delete(`/inventory/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '删除库存记录失败');
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

// 获取最大的入库单号
export const getMaxStockInNumber = async (): Promise<string> => {
  try {
    const response = await api.get('/inventory/max-stock-in-number');
    return response.data.data.maxStockInNumber;
  } catch (error: any) {
    console.error('获取最大入库单号错误:', error);
    throw new Error(error.response?.data?.message || '获取最大入库单号失败');
  }
};

// 根据条件搜索入库单号
export const searchStockInNumbers = async (filterType: string, searchValue: string): Promise<string[]> => {
  try {
    const response = await api.get('/inventory/search-stock-in-numbers', {
      params: { filterType, searchValue }
    });
    return response.data.data.stockInNumbers;
  } catch (error: any) {
    console.error('搜索入库单号错误:', error);
    throw new Error(error.response?.data?.message || '搜索入库单号失败');
  }
};

// 根据入库单号获取入库记录
export const getStockInRecordsByNumber = async (stockInNumber: string): Promise<StockInItem[]> => {
  try {
    const response = await api.get('/inventory/stock-in-records', {
      params: { stockInNumber }
    });
    return response.data.data.records;
  } catch (error: any) {
    console.error('获取入库记录错误:', error);
    throw new Error(error.response?.data?.message || '获取入库记录失败');
  }
};

// 批量更新库存记录
export const batchUpdateInventory = async (updates: { id: number; data: Partial<Inventory> }[]): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/inventory/batch-update', updates);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '批量更新库存失败');
  }
};

// 批量恢复库存记录
export const batchRestoreInventory = async (restores: { id: number; data: Partial<Inventory> }[]): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/inventory/batch-restore', restores);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '批量恢复库存失败');
  }
};
