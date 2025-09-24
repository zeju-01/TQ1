// 响应格式化工具
const createResponse = (success, message, data = null, code = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  };

  if (data !== null) {
    response.data = data;
  }

  if (code !== null) {
    response.code = code;
  }

  return response;
};

// 成功响应
const successResponse = (message, data = null) => {
  return createResponse(true, message, data);
};

// 错误响应
const errorResponse = (message, code = null) => {
  return createResponse(false, message, null, code);
};

// 分页响应
const paginatedResponse = (message, data, pagination) => {
  return {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  };
};

// 分页参数解析
const parsePaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

// 排序参数解析
const parseSortParams = (req, allowedFields = []) => {
  const sortBy = req.query.sortBy || 'id';
  const sortOrder = (req.query.sortOrder || 'asc').toLowerCase();

  // 验证排序字段
  const field = allowedFields.includes(sortBy) ? sortBy : 'id';
  const order = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc';

  return { field, order };
};

// 搜索参数解析
const parseSearchParams = (req, searchableFields = []) => {
  const search = req.query.search || '';
  const conditions = [];
  const params = [];

  if (search && searchableFields.length > 0) {
    const searchConditions = searchableFields.map(field => `${field} LIKE ?`);
    conditions.push(`(${searchConditions.join(' OR ')})`);
    
    // 为每个搜索字段添加参数
    searchableFields.forEach(() => {
      params.push(`%${search}%`);
    });
  }

  return { conditions, params };
};

// 日期范围参数解析
const parseDateRangeParams = (req, dateField = 'created_at') => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push(`${dateField} >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    conditions.push(`${dateField} <= ?`);
    params.push(endDate + ' 23:59:59');
  }

  return { conditions, params };
};

// 计算分页信息
const calculatePagination = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePaginationParams,
  parseSortParams,
  parseSearchParams,
  parseDateRangeParams,
  calculatePagination
};