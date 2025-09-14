// Axios配置和拦截器
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    if (response) {
      const { status, data } = response;
      
      // 对于删除操作，不自动显示错误消息，让业务逻辑处理
      const isDeleteOperation = config.method === 'delete';
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (!isDeleteOperation) {
            message.error('登录已过期，请重新登录');
          }
          window.location.href = '/login';
          break;
        case 403:
          if (!isDeleteOperation) {
            message.error('权限不足');
          }
          break;
        case 404:
          // 对于删除操作，404可能是正常的业务逻辑，不显示错误
          if (!isDeleteOperation) {
            message.error('请求的资源不存在');
          }
          break;
        case 400:
          // 对于删除操作，400可能是业务约束（如数据被引用），不显示通用错误
          if (!isDeleteOperation) {
            message.error(data.message || '请求参数错误');
          }
          break;
        case 500:
          // 对于删除操作，让业务逻辑处理具体的500错误
          if (!isDeleteOperation) {
            message.error('服务器内部错误');
          }
          break;
        default:
          if (!isDeleteOperation) {
            message.error(data.message || '请求失败');
          }
      }
    } else {
      message.error('网络连接失败');
    }
    
    return Promise.reject(error);
  }
);

export default api;