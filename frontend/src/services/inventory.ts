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
export const stockIn = async (stockInData: Partial<StockInRequest> & { receipt_documents?: any[] }): Promise<StockInResponse> => {
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
    
    // 如果没有提供 stock_in_document，则处理收货单据信息
    let stockInDocument = stockInData.stock_in_document || '';
    if (!stockInDocument && stockInData.receipt_documents && stockInData.receipt_documents.length > 0) {
      // 检查文件对象的多种可能格式
      stockInDocument = stockInData.receipt_documents.map((file: any) => {
        // 如果已经有response.filename，使用它
        if (file.response && file.response.filename) {
          return file.response.filename;
        }
        // 否则使用文件名
        return file.name || file.fileName || '收货单据';
      }).join(', ');
    }
    
    // 添加收货单据信息到请求数据
    const requestData = {
      ...stockInData,
      stock_in_document: stockInDocument
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
      
      // 验证IMEI格式（如果提供了IMEI号）
      if (item.imei && !/^\d{15}$/.test(item.imei)) {
        throw new Error(`IMEI号 ${item.imei} 格式不正确，应为15位数字`);
      }
    }
    
    // 转换前端数据为后端需要的格式
    const backendStockInList = stockInList.map(item => {
      // 处理收货单据信息，使用新生成的文件名格式
      let stockInDocument = '';
      if (item.receipt_documents && item.receipt_documents.length > 0) {
        const stockInNumber = item.stock_in_number || 'SI';
        // 生成新的文件名格式：[入库单号]_[序号].[扩展名]
        stockInDocument = item.receipt_documents.map((file: any, index: number) => {
          // 如果文件已经上传并有响应，使用响应中的文件名
          if (file.response && file.response.filename) {
            return file.response.filename;
          }
          
          // 否则生成新的文件名
          const backendFileName = file.name || file.fileName || `document_${index + 1}`;
          const fileExtension = backendFileName.split('.').pop();
          return `${stockInNumber}_${index + 1}.${fileExtension}`;
        }).join(', ');
      } else if (item.stock_in_document) {
        // 如果已经有stock_in_document字段，直接使用它
        stockInDocument = item.stock_in_document;
      }
      
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
        // 修复字段名不匹配的问题：前端使用 stock_in_date，后端需要 stock_in_date
        stock_in_date: item.stock_in_date || new Date().toISOString(),
        stock_in_by: 'current_user', // 这里应该从认证信息中获取当前用户
        // 添加收货单据信息，使用新生成的文件名格式
        stock_in_document: stockInDocument || undefined
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
