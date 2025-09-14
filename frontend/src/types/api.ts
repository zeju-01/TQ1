// API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// 分页响应
export interface PaginationResponse {
  success: boolean;
  message: string;
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

// 列表响应类型
export interface ListResponse<T> extends PaginationResponse {
  data: T[];
}