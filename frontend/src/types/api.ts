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

// 分页响应 - 更新字段名以匹配实际API响应
export interface PaginationResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;          // 更新字段名：total_items -> total
    page: number;           // 更新字段名：current_page -> page
    limit: number;          // 更新字段名：per_page -> limit
    totalPages: number;     // 更新字段名：total_pages -> totalPages
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 列表响应类型
export interface ListResponse<T> extends PaginationResponse {
  data: T[];
}