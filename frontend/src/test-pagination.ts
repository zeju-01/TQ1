// 测试分页响应结构
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TestPaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationInfo;
}

// 模拟供应商数据
interface Supplier {
  id: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
}

// 测试响应数据
const testResponse: TestPaginatedResponse<Supplier> = {
  success: true,
  message: '获取供应商列表成功',
  data: [
    {
      id: 1,
      company_name: '测试供应商',
      contact_person: '联系人',
      phone: '13800138000',
      email: 'test@example.com',
      address: '测试地址',
      status: 'active'
    }
  ],
  pagination: {
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10,
    hasNext: true,
    hasPrev: false
  }
};

// 正确的访问方式
console.log('总数量:', testResponse.pagination.total); // 正确方式
// console.log('总数量:', testResponse.total); // 错误方式，会报类型错误

export { testResponse, type TestPaginatedResponse, type Supplier };