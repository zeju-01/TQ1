// 文件上传服务
import api from './api';

// 上传单个文件
export const uploadFile = async (file: File, customFilename?: string): Promise<{ url: string; filename: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // 如果提供了自定义文件名，则添加到请求中
    if (customFilename) {
      formData.append('custom_filename', customFilename);
    }
    
    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      return {
        url: response.data.data.url,
        filename: response.data.data.filename,
      };
    } else {
      throw new Error(response.data.message || '文件上传失败');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '文件上传失败');
  }
};

// 上传多个文件
export const uploadMultipleFiles = async (files: File[], customFilenames?: string[]): Promise<Array<{ url: string; filename: string }>> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // 如果提供了自定义文件名，则添加到请求中
    if (customFilenames && customFilenames.length > 0) {
      customFilenames.forEach((filename, index) => {
        formData.append(`custom_filenames[${index}]`, filename);
      });
    }
    
    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      return response.data.data.map((fileInfo: any) => ({
        url: fileInfo.url,
        filename: fileInfo.filename,
      }));
    } else {
      throw new Error(response.data.message || '文件上传失败');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || '文件上传失败');
  }
};

export default {
  uploadFile,
  uploadMultipleFiles,
};