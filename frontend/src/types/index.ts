// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
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

// 用户相关类型
export interface User {
  id: number;
  username: string;
  role: 'superadmin' | 'warehouse_manager' | 'operator' | 'viewer';
  full_name?: string;
  abbreviation?: string;
  permission: 'all' | 'manage' | 'operate' | 'view';
  remarks?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// 产品相关类型
export interface Product {
  id: number;
  name?: string;
  model?: string;
  description?: string;
  abbreviation?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: number;
  name: string;
  model: string;
  abbreviation: string;
}

// 供应商相关类型
export interface Supplier {
  id: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_info?: string;
  other_info?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  stats?: {
    product_count: number;
    inventory_count: number;
    stock_in_count: number;
    stock_out_count: number;
  };
}

export interface SupplierOption {
  id: number;
  company_name: string;
}

// 业务人员相关类型
export interface BusinessStaff {
  id: number;
  staff_name: string;
  nickname?: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  contact_info?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  stats?: {
    product_count: number;
  };
}

export interface BusinessStaffOption {
  id: number;
  staff_name: string;
  nickname?: string;
}

// 库存相关类型
export interface Inventory {
  id: number;
  product_id?: number;
  product_name?: string;
  product_model?: string;
  product_description?: string;
  operator?: string;
  imei: string;
  batch_number?: string;
  
  // 入库相关
  stock_in_quantity?: number;
  stock_in_status?: string;
  return_status?: string;
  after_sales_status?: string;
  other_status?: string;
  stock_in_number?: string;
  stock_in_auto_number: string;
  supplier?: string;
  factory_name?: string;
  factory_order?: string;
  stock_in_date?: string;
  stock_in_contract_number?: string;
  stock_in_document?: string;
  stock_in_document_path?: string;
  stock_in_time?: string;
  stock_in_by?: string;
  stock_in_notes?: string;
  
  // 退库相关
  return_time?: string;
  returned_by?: number;
  return_reason?: string;
  return_type?: string;
  return_notes?: string;
  after_sales_time?: string;
  after_sales_by?: number;
  
  // 出库相关
  stock_out_number?: string;
  stock_out_document?: string;
  stock_out_document_path?: string;
  stock_out_date?: string;
  stock_out_quantity?: number;
  stock_out_contract_number?: string;
  sales_order_number?: string;
  recipient?: string;
  delivery_info?: string;
  courier_company?: string;
  tracking_number?: string;
  stock_out_time?: string;
  stock_out_by?: number;
  stock_out_notes?: string;
  stock_out_status?: string;
  
  // 其他
  quantity?: number;
  transaction_type: 'in' | 'out' | 'return';
  customer?: string;
  created_at: string;
  updated_at: string;
}

export interface StockInRequest {
  product_id?: number;
  product_name?: string;
  product_model?: string;
  product_description?: string;
  operator?: string;
  imei: string;
  batch_number?: string;
  stock_in_quantity?: number;
  supplier?: string;
  factory_name?: string;
  factory_order?: string;
  stock_in_date?: string;
  stock_in_contract_number?: string;
  stock_in_document?: string;
  stock_in_notes?: string;
}

export interface StockOutRequest {
  imei: string;
  stock_out_quantity?: number;
  stock_out_contract_number?: string;
  sales_order_number?: string;
  recipient?: string;
  delivery_info?: string;
  courier_company?: string;
  tracking_number?: string;
  stock_out_notes?: string;
  customer?: string;
}

export interface ReturnRequest {
  imei: string;
  return_reason: string;
  return_type: string;
  return_notes?: string;
}

export interface InventoryStats {
  total: number;
  stockIn: number;
  stockOut: number;
  available: number;
  returned: number;
}

// 表格查询参数
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// 文件上传相关
export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  response?: any;
}