// 入库管理页面
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  message,
  Upload,
  Table,
  Space,
  Tag,
  Modal,
  Steps,
  Divider,
  DatePicker,
  InputNumber,
  Tooltip
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { productService } from '../../services/products';
import { operatorService } from '../../services/operators';
import { supplierService } from '../../services/suppliers';
import { stockIn, batchStockIn, getMaxStockInNumber } from '../../services/inventory';
import type { Product } from '../../types';
import type { Operator } from '../../services/operators';
import type { Supplier } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

// 入库数据接口
interface StockInItem {
  id: number;
  imei: string;
  product_name: string;
  product_model: string;
  operator: string;
  box_number: string;
  factory_order: string;
  quantity: number;
  contract_number: string;
  stock_in_number: string;
  // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
  stock_in_date: string;
  supplier: string;
  remark: string;
  receipt_documents: any[];
  status: 'pending' | 'success' | 'error';
  error_message?: string;
}

const StockInPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [singleForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [batchItems, setBatchItems] = useState<StockInItem[]>([]);
  const [searchResults, setSearchResults] = useState<StockInItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [products, setProducts] = useState<Product[]>([]);
  const [productOptions, setProductOptions] = useState<{ label: string; value: number; model?: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [operatorOptions, setOperatorOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [stockInCounter, setStockInCounter] = useState(1);
  const [currentStockInNumber, setCurrentStockInNumber] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<StockInItem | null>(null);
  const [editForm] = Form.useForm();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<StockInItem | null>(null);
  const [updateForm] = Form.useForm();
  
  // 入库更新页面：搜索条件表单状态
  const [filterType, setFilterType] = useState<string>('contract_number');
  const [searchValue, setSearchValue] = useState<string>('');
  const [stockInNumbers, setStockInNumbers] = useState<string[]>([]);
  const [selectedStockInNumber, setSelectedStockInNumber] = useState<string>('');
  const [replaceValue, setReplaceValue] = useState<string>('');
  
  const debounceTimers = useRef<Record<string, NodeJS.Timeout | null>>({});
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 防抖函数
  const debounce = (func: Function, wait: number, timerId: string) => {
    return function executedFunction(...args: any[]) {
      if (debounceTimers.current[timerId]) {
        clearTimeout(debounceTimers.current[timerId]!);
      }
      
      debounceTimers.current[timerId] = setTimeout(() => {
        func(...args);
      }, wait);
    };
  };

  // 搜索防抖
  const handleSearchDebounced = useRef(debounce((value: string) => {
    console.log('防抖搜索触发，值:', value);
    setSearchText(value);
    setCurrentPage(1);
  }, 300, 'search')).current;

  // 过滤批量入库项目
  const filteredBatchItems = useMemo(() => {
    console.log('搜索过滤执行，searchText:', searchText);
    console.log('原始数据 batchItems:', batchItems);
    
    // 如果搜索文本为空，返回所有项目
    if (!searchText || searchText.trim() === '') {
      console.log('搜索文本为空，返回所有项目');
      return batchItems;
    }
    
    // 否则根据搜索文本过滤项目
    try {
      const searchTextTrimmed = searchText.trim();
      const searchTextLower = searchTextTrimmed.toLowerCase();
      
      const filtered = batchItems.filter(item => {
        // 检查各个字段是否包含搜索文本
        // 确保所有字段都是字符串类型
        let productName = '';
        if (typeof item.product_name === 'number') {
          const productId = item.product_name;
          const product = products.find(p => p.id === productId);
          productName = product && product.name ? product.name : `产品ID: ${item.product_name}`;
        } else if (typeof item.product_name === 'string') {
          productName = item.product_name;
        } else {
          productName = '';
        }
        
        const productModel = item.product_model || '';
        const imei = item.imei || '';
        const operator = item.operator || '';
        const boxNumber = item.box_number || '';
        const stockInNumber = item.stock_in_number || '';
        const contractNumber = item.contract_number || '';
        const supplier = item.supplier || '';
        
        // 确保所有字段在调用 toLowerCase() 前都是字符串
        const matchesProductName = productName.toString().toLowerCase().includes(searchTextLower);
        const matchesProductModel = productModel.toString().toLowerCase().includes(searchTextLower);
        // IMEI号是纯数字，不需要转换为小写
        const matchesImei = imei.includes(searchTextTrimmed);
        const matchesOperator = operator.toString().toLowerCase().includes(searchTextLower);
        const matchesBoxNumber = boxNumber.toString().toLowerCase().includes(searchTextLower);
        const matchesStockInNumber = stockInNumber.toString().toLowerCase().includes(searchTextLower);
        const matchesContractNumber = contractNumber.toString().toLowerCase().includes(searchTextLower);
        const matchesSupplier = supplier.toString().toLowerCase().includes(searchTextLower);
        
        const result = matchesProductName || matchesProductModel || matchesImei || matchesOperator || 
               matchesBoxNumber || matchesStockInNumber || matchesContractNumber || matchesSupplier;
               
        console.log('项目过滤检查:', {
          item,
          searchTextTrimmed,
          searchTextLower,
          productName,
          productModel,
          imei,
          operator,
          boxNumber,
          stockInNumber,
          contractNumber,
          supplier,
          matchesProductName,
          matchesProductModel,
          matchesImei,
          matchesOperator,
          matchesBoxNumber,
          matchesStockInNumber,
          matchesContractNumber,
          matchesSupplier,
          result
        });
        
        return result;
      });
      
      console.log('过滤后的结果:', filtered);
      return filtered;
    } catch (error) {
      console.error('搜索过滤出错:', error);
      // 出错时返回空数组而不是所有项目，防止页面空白
      return [];
    }
  }, [batchItems, searchText, products]);

  // 获取产品列表（带防抖）
  const loadProductsDebounced = useRef(debounce(async (retryCount = 0) => {
    try {
      setLoadingProducts(true);
      const response = await productService.getList({ page: 1, limit: 100 });
      setProducts(response.data);
      
      const uniqueProducts = response.data.filter((product, index, self) => 
        index === self.findIndex(p => p.name === product.name)
      );
      
      const options = uniqueProducts.map(product => ({
        label: product.name || '',
        value: product.id,
        model: product.model
      })).filter(option => option.label);
      
      setProductOptions(options);
    } catch (error: any) {
      console.error('加载产品数据失败:', error);
      if (error.message && error.message.includes('请求过于频繁')) {
        if (retryCount < 3) {
          setTimeout(() => {
            loadProductsDebounced(retryCount + 1);
          }, 1000);
        } else {
          message.error('请求过于频繁，请稍后再试');
        }
      } else {
        message.error('加载产品数据失败: ' + (error as Error).message);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, 500, 'products')).current;

  // 获取运营商列表（带防抖）
  const loadOperatorsDebounced = useRef(debounce(async (retryCount = 0) => {
    try {
      setLoadingOperators(true);
      const response = await operatorService.getOptions();
      
      const uniqueOperators = response.data.filter((operator, index, self) => 
        index === self.findIndex(o => o.name === operator.name)
      );
      
      const options = [
        { label: '', value: '' },
        ...uniqueOperators.map(operator => ({
          label: operator.name || '',
          value: operator.name || ''
        })).filter(option => option.label)
      ];
      
      setOperators(response.data);
      setOperatorOptions(options);
    } catch (error: any) {
      console.error('加载运营商数据失败:', error);
      if (error.message && error.message.includes('请求过于频繁')) {
        if (retryCount < 3) {
          setTimeout(() => {
            loadOperatorsDebounced(retryCount + 1);
          }, 1000);
        } else {
          message.error('请求过于频繁，请稍后再试');
        }
      } else {
        message.error('加载运营商数据失败: ' + (error as Error).message);
      }
    } finally {
      setLoadingOperators(false);
    }
  }, 500, 'operators')).current;

  // 获取供应商列表（带防抖）
  const loadSuppliersDebounced = useRef(debounce(async (retryCount = 0) => {
    try {
      setLoadingSuppliers(true);
      const response = await supplierService.getOptions();
      
      const uniqueSuppliers = response.data.filter((supplier: { id: number; company_name: string }, index: number, self: { id: number; company_name: string }[]) => 
        index === self.findIndex((s: { company_name: string }) => s.company_name === supplier.company_name)
      );
      
      const options = [
        { label: '', value: '' },
        ...uniqueSuppliers.map((supplier: { company_name: string }) => ({
          label: supplier.company_name || '',
          value: supplier.company_name || ''
        })).filter((option: { label: string }) => option.label)
      ];
      
      setSupplierOptions(options);
    } catch (error: any) {
      console.error('加载供应商数据失败:', error);
      if (error.message && error.message.includes('请求过于频繁')) {
        if (retryCount < 3) {
          setTimeout(() => {
            loadSuppliersDebounced(retryCount + 1);
          }, 1000);
        } else {
          message.error('请求过于频繁，请稍后再试');
        }
      } else {
        message.error('加载供应商数据失败: ' + (error as Error).message);
      }
    } finally {
      setLoadingSuppliers(false);
    }
  }, 500, 'suppliers')).current;

  const loadProducts = async () => {
    loadProductsDebounced(0);
  };

  const loadOperators = async () => {
    loadOperatorsDebounced(0);
  };

  const loadSuppliers = async () => {
    loadSuppliersDebounced(0);
  };

  // 生成入库单号
  const generateStockInNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    const counterStr = String(stockInCounter).padStart(4, '0');
    const newNumber = `SI${dateStr}${counterStr}`;
    
    return newNumber;
  };

  // 从后端获取最大入库单号
  const fetchMaxStockInNumber = async () => {
    try {
      const maxNumber = await getMaxStockInNumber();
      return maxNumber;
    } catch (error) {
      console.error('获取最大入库单号失败:', error);
      // 如果获取失败，使用本地生成的单号
      return generateStockInNumber();
    }
  };

  // 生成并递增入库单号
  const generateAndIncrementStockInNumber = async () => {
    const newNumber = await fetchMaxStockInNumber();
    setStockInCounter(prev => prev + 1);
    return newNumber;
  };

  // 组件挂载时生成初始入库单号
  useEffect(() => {
    const loadInitialStockInNumber = async () => {
      const initialStockInNumber = await fetchMaxStockInNumber();
      setCurrentStockInNumber(initialStockInNumber);
      setStockInCounter(prev => prev + 1);
      
      singleForm.setFieldsValue({
        stock_in_number: initialStockInNumber
      });
      
      batchForm.setFieldsValue({
        stock_in_number: initialStockInNumber
      });
    };
    
    loadInitialStockInNumber();
  }, []);

  useEffect(() => {
    loadProducts();
    loadOperators();
    loadSuppliers();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, batchItems]);

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*,.pdf,.doc,.docx',
    beforeUpload: (file: any) => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type === 'application/pdf' ||
                         file.type.includes('document');
      if (!isValidType) {
        message.error('只能上传图片、PDF或文档文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB！');
        return false;
      }
      return false;
    },
    onChange(info: any) {
      console.log('文件上传:', info.fileList);
    },
  };

  const receiptUploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*,.pdf,.doc,.docx',
    beforeUpload: (file: any) => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type === 'application/pdf' ||
                         file.type.includes('document');
      if (!isValidType) {
        message.error('只能上传图片、PDF或文档文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB！');
        return false;
      }
      return false;
    },
    onChange(info: any) {
      console.log('收货单据上传:', info.fileList);
    }
  };

  // Excel导入相关函数
  const handleExcelImport = async (file: any) => {
    try {
      // 导入前验证表单必填项目不为空
      const formValues = batchForm.getFieldsValue();
      if (!formValues.product_name) {
        message.warning('请先选择产品名称！');
        return;
      }
      // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
      if (!formValues.stock_in_date) {
        message.warning('请先选择入库时间！');
        return;
      }
      if (!formValues.quantity || formValues.quantity <= 0) {
        message.warning('请先输入有效的数量！');
        return;
      }

      const formData = new FormData();
      formData.append('excel', file);
      
      // 发送请求到后端
      const response = await fetch('/api/upload/excel', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 处理导入的数据
        const importedData = result.data.data || result.data;
        if (Array.isArray(importedData) && importedData.length > 0) {
          // 检查IMEI号重复（包括导入数据内部重复和与现有列表重复）
          const imeiSet = new Set<string>();
          const duplicateImeis: string[] = [];
          
          // 先检查当前导入数据中的重复IMEI
          importedData.forEach((item: any) => {
            const imei = item.imei || item.IMEI || item['IMEI号'] || ''; // 添加对"IMEI号"字段的支持
            if (imei) {
              if (imeiSet.has(imei)) {
                if (!duplicateImeis.includes(imei)) {
                  duplicateImeis.push(imei);
                }
              } else {
                imeiSet.add(imei);
              }
            }
          });
          
          // 再检查与现有批量列表中的重复IMEI
          batchItems.forEach(item => {
            if (item.imei) {
              if (imeiSet.has(item.imei)) {
                if (!duplicateImeis.includes(item.imei)) {
                  duplicateImeis.push(item.imei);
                }
              }
            }
          });
          
          if (duplicateImeis.length > 0) {
            message.error(`导入的数据中存在重复的IMEI号: ${duplicateImeis.join(', ')}`);
            return;
          }

          // 转换数据格式以匹配批量入库列表
          const convertedData = importedData.map((item: any, index: number) => {
            // 获取表单中的非空值（除IMEI和箱号外）
            const formValues = batchForm.getFieldsValue();
            const formData: any = {};
            
            // 只有当表单字段不为空时才使用表单值（排除IMEI和箱号）
            if (formValues.operator) formData.operator = formValues.operator;
            if (formValues.supplier) formData.supplier = formValues.supplier;
            if (formValues.factory_order) formData.factory_order = formValues.factory_order;
            if (formValues.contract_number) formData.contract_number = formValues.contract_number;
            if (formValues.remark) formData.remark = formValues.remark;
            if (formValues.stock_in_number) formData.stock_in_number = formValues.stock_in_number;
            // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
            if (formValues.stock_in_date) formData.stock_in_date = formValues.stock_in_date.format('YYYY-MM-DD HH:mm:ss');
            
            return {
              id: Date.now() + index,
              imei: item.imei || item.IMEI || item['IMEI号'] || '',  // 添加对"IMEI号"字段的支持
              product_name: item.product_name || item.productName || item['产品名称'] || formValues.product_name || '',
              product_model: item.product_model || item.productModel || item['产品型号'] || formValues.product_model || '',
              operator: item.operator || item.Operator || item['运营商'] || formData.operator || '',
              box_number: item.box_number || item.boxNumber || item['箱号'] || '',
              factory_order: item.factory_order || item.factoryOrder || item['工厂工单'] || formData.factory_order || '',
              quantity: parseInt(item.quantity) || parseInt(item.Quantity) || parseInt(item['数量']) || formValues.quantity || 1,
              contract_number: item.contract_number || item.contractNumber || item['合同编号'] || formData.contract_number || '',
              stock_in_number: item.stock_in_number || item.stockInNumber || item['入库单号'] || formData.stock_in_number || '',
              // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
              stock_in_date: item.stock_in_date || item.stockInTime || item['入库时间'] || formData.stock_in_date || dayjs().format('YYYY-MM-DD HH:mm:ss'),
              supplier: item.supplier || item.Supplier || item['供应商'] || formData.supplier || '',
              remark: item.remark || item.Remark || item['备注'] || formData.remark || '',
              receipt_documents: [],
              status: 'pending' as 'pending'
            };
          });
          
          // 添加到批量入库列表
          setBatchItems(prev => [...convertedData, ...prev]);
          message.success(`成功导入 ${importedData.length} 条数据`);
        } else {
          message.warning('导入的文件中没有有效数据');
        }
      } else {
        message.error(result.message || 'Excel导入失败');
      }
    } catch (error: any) {
      console.error('Excel导入错误:', error);
      message.error('Excel导入失败: ' + (error.message || '未知错误'));
    }
  };

  const handleExcelImportClick = () => {
    // 导入前验证表单必填项目不为空
    const formValues = batchForm.getFieldsValue();
    if (!formValues.product_name) {
      message.warning('请先选择产品名称！');
      return;
    }
    if (!formValues.stock_in_date) {
      message.warning('请先选择入库时间！');
      return;
    }
    if (!formValues.quantity || formValues.quantity <= 0) {
      message.warning('请先输入有效的数量！');
      return;
    }
    
    // 如果验证通过，触发文件选择
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.csv';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        handleExcelImport(file);
      }
    };
    fileInput.click();
  };

  const excelUploadProps = {
    name: 'excel',
    multiple: false,
    accept: '.xlsx,.xls,.csv',
    beforeUpload: (file: any) => {
      const isValidType = file.type === 'application/vnd.ms-excel' || 
                         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.type === 'text/csv';
      if (!isValidType) {
        message.error('只能上传Excel或CSV文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB！');
        return false;
      }
      // 直接处理文件
      handleExcelImport(file);
      return false;
    },
    onChange(info: any) {
      console.log('Excel文件上传:', info.fileList);
    },
  };

  const handleSingleSubmit = async () => {
    try {
      setLoading(true);
      const values = await singleForm.validateFields();
      
      console.log('表单值:', values);
      
      // 验证IMEI号格式（如果提供了IMEI号）
      if (values.imei && !/^\d{15}$/.test(values.imei)) {
        message.error('IMEI号格式不正确，应为15位数字');
        setLoading(false);
        return;
      }
      
      const selectedProduct = products.find(p => p.id === values.product_name);
      const productModel = selectedProduct ? selectedProduct.model || '' : values.product_model || '';
      const productName = selectedProduct ? selectedProduct.name || '' : values.product_name || '';
      
      let receiptDocuments = values.receipt_documents || [];
      let stockInDocument = '';
      
      console.log('收货单据文件:', receiptDocuments);
      
      // 如果有收货单据文件，先上传文件
      if (receiptDocuments && receiptDocuments.length > 0) {
        const stockInNumber = values.stock_in_number || currentStockInNumber || 'SI';
        
        // 上传文件到服务器
        const uploadFormData = new FormData();
        const fileNames: string[] = [];
        
        for (let i = 0; i < receiptDocuments.length; i++) {
          const file = receiptDocuments[i];
          console.log(`处理文件 ${i}:`, file);
          
          if (file && file.originFileObj) {
            const fileExtension = file.name.split('.').pop();
            const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
            fileNames.push(newFileName);
            
            // 创建新的File对象以使用新文件名
            const newFile = new File([file.originFileObj], newFileName, {
              type: file.originFileObj.type
            });
            uploadFormData.append('files', newFile);
            console.log(`添加文件到上传表单: ${newFileName}`);
          } else if (file && file.file) {
            // 处理另一种可能的文件对象格式
            const fileExtension = file.name.split('.').pop();
            const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
            fileNames.push(newFileName);
            
            // 创建新的File对象以使用新文件名
            const newFile = new File([file.file], newFileName, {
              type: file.file.type
            });
            uploadFormData.append('files', newFile);
            console.log(`添加文件到上传表单: ${newFileName}`);
          }
        }
        
        // 如果有文件需要上传
        if (fileNames.length > 0) {
          console.log('开始上传文件，文件名:', fileNames);
          try {
            const uploadResponse = await fetch('/api/upload/multiple', {
              method: 'POST',
              body: uploadFormData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            
            console.log('文件上传响应状态:', uploadResponse.status);
            const uploadResult = await uploadResponse.json();
            console.log('文件上传响应数据:', uploadResult);
            
            if (uploadResult.success) {
              // 使用上传后的文件名
              stockInDocument = fileNames.join(', ');
              console.log('文件上传成功，文件名:', stockInDocument);
            } else {
              console.error('文件上传失败:', uploadResult.message);
              message.warning('文件上传失败，将继续入库操作');
              // 即使上传失败，也要使用生成的文件名
              stockInDocument = fileNames.join(', ');
            }
          } catch (uploadError) {
            console.error('文件上传错误:', uploadError);
            message.warning('文件上传出错，将继续入库操作');
            // 即使上传出错，也要使用生成的文件名
            stockInDocument = fileNames.join(', ');
          }
        } else {
          console.log('没有文件需要上传');
        }
      } else {
        console.log('没有收货单据文件');
      }
      
      // 准备入库数据
      const stockInData = {
        product_name: productName,
        product_model: productModel,
        operator: values.operator || '',
        imei: values.imei || '',
        batch_number: values.box_number || '',
        stock_in_quantity: values.quantity || 1,
        supplier: values.supplier || '',
        factory_order: values.factory_order || '',
        stock_in_contract_number: values.contract_number || '',
        stock_in_notes: values.remark || '',
        // 添加入库单号字段
        stock_in_number: values.stock_in_number || '',
        // 修复字段名不匹配的问题：前端使用 stock_in_date，后端需要 stock_in_date
        stock_in_date: values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss'),
        // 添加收货单据信息
        stock_in_document: stockInDocument || ''
      };
      
      console.log('准备发送的入库数据:', stockInData);
      
      // 添加调试日志
      console.log('准备发送的入库数据:', stockInData);
      console.log('表单值:', values);
      
      // 额外验证确保必填字段存在
      if (!stockInData.product_name) {
        message.error('产品名称不能为空');
        setLoading(false);
        return;
      }
      
      if (!stockInData.stock_in_date) {
        message.error('入库时间不能为空');
        setLoading(false);
        return;
      }
      
      if (!stockInData.stock_in_quantity || stockInData.stock_in_quantity <= 0) {
        message.error('入库数量必须为正整数');
        setLoading(false);
        return;
      }
      
      // 调用后端API进行入库操作
      const response = await stockIn(stockInData);
      
      if (response.success) {
        message.success('入库成功！');
        
        const newStockInNumber = await generateAndIncrementStockInNumber();
        setCurrentStockInNumber(newStockInNumber);
        
        const preservedValues = {
          product_name: values.product_name,
          product_model: productModel,
          operator: values.operator,
          supplier: values.supplier,
          factory_order: values.factory_order,
          contract_number: values.contract_number,
          remark: values.remark,
          stock_in_number: newStockInNumber
        };
        
        singleForm.resetFields(['imei', 'stock_in_date', 'quantity', 'receipt_documents']);
        
        singleForm.setFieldsValue({
          ...preservedValues,
          stock_in_number: newStockInNumber
        });
      } else {
        throw new Error(response.message || '入库失败');
      }
    } catch (error: any) {
      console.error('入库失败:', error);
      if (error.errorFields) {
        const errorMessages = error.errorFields.map((field: any) => {
          // 提供更友好的错误消息
          switch (field.name[0]) {
            case 'product_name':
              return '产品名称不能为空';
            case 'stock_in_date':
              return '入库时间不能为空';
            case 'quantity':
              return '数量不能为空';
            default:
              return field.errors.join(', ');
          }
        }).join('; ');
        message.error('输入数据验证失败: ' + errorMessages);
      } else {
        // 提供更具体的错误消息
        const errorMessage = error.message || '入库失败';
        // 检查是否包含多个错误消息
        if (errorMessage.includes('输入数据验证失败:')) {
          message.error(errorMessage);
        } else if (errorMessage.includes('产品名称')) {
          message.error('表单验证失败: 产品名称不能为空');
        } else if (errorMessage.includes('入库时间')) {
          message.error('表单验证失败: 入库时间不能为空');
        } else if (errorMessage.includes('数量')) {
          message.error('表单验证失败: 入库数量必须为正整数');
        } else if (errorMessage.includes('IMEI')) {
          message.error('表单验证失败: ' + errorMessage);
        } else {
          message.error('入库失败，请检查数据: ' + errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const validateBatchForm = () => {
    const values = batchForm.getFieldsValue();
    
    if (!values.product_name) {
      message.warning('请选择产品名称！');
      return false;
    }
    if (!values.stock_in_date) {
      message.warning('请选择入库时间！');
      return false;
    }
    if (!values.quantity || values.quantity <= 0) {
      message.warning('请输入有效的数量！');
      return false;
    }
    
    // 验证IMEI格式（如果提供了IMEI号）
    if (values.imei && !/^\d{15}$/.test(values.imei)) {
      message.warning('IMEI号格式不正确，应为15位数字');
      return false;
    }
    
    return true;
  };

  const handleAddBatchItem = async () => {
    if (!validateBatchForm()) {
      return;
    }
    
    try {
      const values = batchForm.getFieldsValue();
      
      // 验证IMEI格式（如果提供了IMEI号）
      if (values.imei && !/^\d{15}$/.test(values.imei)) {
        message.error('IMEI号格式不正确，应为15位数字');
        return;
      }
      
      const selectedProduct = products.find(p => p.id === values.product_name);
      const productModel = selectedProduct ? (selectedProduct.model || '') : '';

      let batchReceiptDocuments = values.receipt_documents || [];
      let stockInDocument = '';
      
      // 如果有收货单据文件，先上传文件
      if (batchReceiptDocuments && batchReceiptDocuments.length > 0) {
        const stockInNumber = values.stock_in_number || currentStockInNumber || 'SI';
        
        // 上传文件到服务器
        const uploadFormData = new FormData();
        const fileNames: string[] = [];
        
        for (let i = 0; i < batchReceiptDocuments.length; i++) {
          const file = batchReceiptDocuments[i];
          if (file && file.originFileObj) {
            const fileExtension = file.name.split('.').pop();
            const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
            fileNames.push(newFileName);
            
            // 创建新的File对象以使用新文件名
            const newFile = new File([file.originFileObj], newFileName, {
              type: file.originFileObj.type
            });
            uploadFormData.append('files', newFile);
          } else if (file && file.file) {
            // 处理另一种可能的文件对象格式
            const fileExtension = file.name.split('.').pop();
            const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
            fileNames.push(newFileName);
            
            // 创建新的File对象以使用新文件名
            const newFile = new File([file.file], newFileName, {
              type: file.file.type
            });
            uploadFormData.append('files', newFile);
          }
        }
        
        // 如果有文件需要上传
        if (fileNames.length > 0) {
          try {
            const uploadResponse = await fetch('/api/upload/multiple', {
              method: 'POST',
              body: uploadFormData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            
            const uploadResult = await uploadResponse.json();
            
            if (uploadResult.success) {
              // 使用上传后的文件名
              stockInDocument = fileNames.join(', ');
              console.log('批量入库文件上传成功，文件名:', stockInDocument);
              
              // 更新receiptDocuments以包含上传后的信息
              batchReceiptDocuments = batchReceiptDocuments.map((file: any, index: number) => {
                if (file && file.originFileObj) {
                  return {
                    ...file,
                    name: fileNames[index],
                    response: {
                      filename: fileNames[index]
                    }
                  };
                } else if (file && file.file) {
                  return {
                    ...file,
                    name: fileNames[index],
                    response: {
                      filename: fileNames[index]
                    }
                  };
                }
                return file;
              });
            } else {
              console.error('文件上传失败:', uploadResult.message);
              message.warning('文件上传失败，将继续添加项目');
              // 即使上传失败，也要使用生成的文件名
              stockInDocument = fileNames.join(', ');
            }
          } catch (uploadError) {
            console.error('文件上传错误:', uploadError);
            message.warning('文件上传出错，将继续添加项目');
            // 即使上传出错，也要使用生成的文件名
            stockInDocument = fileNames.join(', ');
          }
        }
      }

      const stockInTime = values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss');
      const stockInNumber = values.stock_in_number || '';

      const newItem = {
        id: Date.now(),
        imei: values.imei || '',
        product_name: selectedProduct?.name || values.product_name || '',
        product_model: productModel,
        operator: values.operator || '',
        box_number: values.box_number || '',
        factory_order: values.factory_order || '',
        quantity: values.quantity || 1,
        contract_number: values.contract_number || '',
        stock_in_number: stockInNumber,
        // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
        stock_in_date: stockInTime,
        supplier: values.supplier || '',
        remark: values.remark || '',
        receipt_documents: batchReceiptDocuments,
        status: 'pending' as 'pending'
      };

      setBatchItems(prev => [newItem, ...prev]);
      
      batchForm.setFieldsValue({
        imei: '',
        box_number: ''
      });
      
      message.success('添加成功！');
    } catch (error: any) {
      console.error('添加失败:', error);
      message.error('添加失败: ' + error.message);
    }
  };

  const handleBatchSubmit = async () => {
    if (batchItems.length === 0) {
      message.warning('请先添加入库项目！');
      return;
    }

    const imeiSet = new Set<string>();
    const duplicateImeis: string[] = [];
    
    batchItems.forEach(item => {
      if (item.imei) {
        if (imeiSet.has(item.imei)) {
          if (!duplicateImeis.includes(item.imei)) {
            duplicateImeis.push(item.imei);
          }
        } else {
          imeiSet.add(item.imei);
        }
      }
    });
    
    if (duplicateImeis.length > 0) {
      message.error(`提交的数据中存在重复的IMEI号: ${duplicateImeis.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      
      // 验证每个项目的数据（仅验证格式，不验证是否为空）
      for (const item of batchItems) {
        // 验证IMEI格式（如果提供了IMEI号）
        if (item.imei && !/^\d{15}$/.test(item.imei)) {
          message.error(`IMEI号 ${item.imei} 格式不正确，应为15位数字`);
          setLoading(false);
          return;
        }
      }
      
      // 调用后端API进行批量入库操作
      const response = await batchStockIn(batchItems);
      
      if (response.success) {
        const successCount = response.successCount || 0;
        const failedCount = response.failedCount || 0;
        const errors = response.errors || [];
        
        if (failedCount === 0) {
          message.success(`批量入库完成！成功 ${successCount} 条`);
          setBatchItems([]);
          
          const currentValues = batchForm.getFieldsValue();
          const preservedValues = {
            operator: currentValues.operator,
            supplier: currentValues.supplier,
            factory_order: currentValues.factory_order,
            contract_number: currentValues.contract_number,
            remark: currentValues.remark,
            stock_in_date: dayjs()
          };
          
          batchForm.resetFields();
          
          const newStockInNumber = await generateAndIncrementStockInNumber();
          setCurrentStockInNumber(newStockInNumber);
          
          batchForm.setFieldsValue({
            ...preservedValues,
            stock_in_number: newStockInNumber
          });
        } else {
          // 更新batchItems状态，标记成功和失败的项目
          const updatedBatchItems = batchItems.map((item, index) => {
            const error = errors.find(e => e.index === index);
            if (error) {
              return {
                ...item,
                status: 'error' as 'error',
                error_message: error.error
              };
            } else {
              return {
                ...item,
                status: 'success' as 'success'
              };
            }
          });
          
          setBatchItems(updatedBatchItems);
          
          message.warning(`入库完成！成功 ${successCount} 条，失败 ${failedCount} 条`);
        }
      } else {
        throw new Error(response.message || '批量入库失败');
      }
    } catch (error: any) {
      console.error('批量入库失败:', error);
      if (error.errorFields) {
        const errorMessages = error.errorFields.map((field: any) => {
          // 提供更友好的错误消息
          switch (field.name[0]) {
            case 'product_name':
              return '产品名称不能为空';
            case 'stock_in_date':
              return '入库时间不能为空';
            case 'quantity':
              return '数量不能为空';
            default:
              return field.errors.join(', ');
          }
        }).join('; ');
        message.error('输入数据验证失败: ' + errorMessages);
      } else {
        // 提供更具体的错误消息
        const errorMessage = error.message || '批量入库失败';
        // 检查是否包含多个错误消息
        if (errorMessage.includes('输入数据验证失败:')) {
          message.error(errorMessage);
        } else if (errorMessage.includes('产品名称')) {
          message.error('表单验证失败: 产品名称不能为空');
        } else if (errorMessage.includes('入库时间')) {
          message.error('表单验证失败: 入库时间不能为空');
        } else if (errorMessage.includes('数量')) {
          message.error('表单验证失败: 入库数量必须为正整数');
        } else if (errorMessage.includes('IMEI')) {
          message.error('表单验证失败: ' + errorMessage);
        } else {
          message.error('批量入库失败: ' + errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const batchColumns: ColumnsType<StockInItem> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => {
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 120,
      render: (text) => {
        if (typeof text === 'number') {
          const product = products.find(p => p.id === text);
          return product ? product.name : `产品ID: ${text}`;
        }
        return <span style={{ fontSize: '14px' }}>{text}</span>;
      }
    },
    {
      title: '产品型号',
      dataIndex: 'product_model',
      key: 'product_model',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '运营商',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: 'IMEI号',
      dataIndex: 'imei',
      key: 'imei',
      width: 150,
      render: (text) => <code style={{ fontSize: '14px' }}>{text}</code>
    },
    {
      title: '箱号',
      dataIndex: 'box_number',
      key: 'box_number',
      width: 100,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库时间',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
      width: 150,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库单号',
      dataIndex: 'stock_in_number',
      key: 'stock_in_number',
      width: 150,
      render: (text) => text ? <code style={{ fontSize: '14px' }}>{text}</code> : <span style={{ fontSize: '14px' }}>-</span>
    },
    {
      title: '工厂工单',
      dataIndex: 'factory_order',
      key: 'factory_order',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '合同编号',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '收货单据',
      dataIndex: 'receipt_documents',
      key: 'receipt_documents',
      width: 120,
      render: (receipt_documents) => {
        console.log('receipt_documents:', receipt_documents);
        
        if (receipt_documents && Array.isArray(receipt_documents) && receipt_documents.length > 0) {
          const fileNames = receipt_documents.map((file: any, index: number) => {
            try {
              if (file && typeof file === 'object') {
                if (file.name) return file.name;
                if (file.fileName) return file.fileName;
                if (file.uid) return file.uid;
                if (file.url) {
                  const fileName = file.url.split('/').pop();
                  return fileName || file.url;
                }
                if (file.response && file.response.url) {
                  const fileName = file.response.url.split('/').pop();
                  return fileName || '已上传文件';
                }
                if (file.status === 'done' && file.url) {
                  const fileName = file.url.split('/').pop();
                  return fileName || '已上传文件';
                }
                if (file.originFileObj && file.originFileObj.name) {
                  return file.originFileObj.name;
                }
                if (file.thumbUrl) {
                  const fileName = file.thumbUrl.split('/').pop();
                  return fileName || '缩略图文件';
                }
                return JSON.stringify(file).substring(0, 50) + '...';
              }
              if (typeof file === 'string') {
                if (file.includes('/')) {
                  const fileName = file.split('/').pop();
                  return fileName || file;
                }
                return file;
              }
              return `文件${index + 1}`;
            } catch (error) {
              console.error('处理文件名时出错:', error);
              return `文件${index + 1}`;
            }
          });
          
          if (fileNames.length > 3) {
            return (
              <div style={{ fontSize: '14px' }}>
                {fileNames.slice(0, 3).join(', ')}
                <br />
                <span style={{ color: '#999', fontSize: '14px' }}>等{fileNames.length}个文件</span>
              </div>
            );
          }
          
          return <div style={{ fontSize: '14px' }}>{fileNames.join(', ')}</div>;
        }
        return <span style={{ fontSize: '14px' }}>-</span>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => {
        if (status === 'pending') {
          return <Tag color="default" style={{ fontSize: '14px' }}>待处理</Tag>;
        } else if (status === 'success') {
          return <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: '14px' }}>成功</Tag>;
        } else {
          return (
            <Tooltip title={record.error_message || '未知错误'}>
              <Tag color="red" icon={<ExclamationCircleOutlined />} style={{ fontSize: '14px' }}>
                失败
              </Tag>
            </Tooltip>
          );
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button 
                size="small" 
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditBatchItem(record)}
                style={{ fontSize: '14px' }}
              >
                编辑
              </Button>
              <Button 
                size="small" 
                type="link" 
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteBatchItem(record.id)}
                style={{ fontSize: '14px' }}
              >
                删除
              </Button>
            </>
          )}
          {record.status === 'error' && (
            <Button 
              size="small" 
              type="link"
              onClick={() => message.info(record.error_message || '未知错误')}
              style={{ fontSize: '14px' }}
            >
              查看错误
            </Button>
          )}
        </Space>
      )
    }
  ];

  const downloadExcelTemplate = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      const data = [
        ['IMEI号', '产品名称', '产品型号', '运营商', '箱号', '工厂工单', '数量', '合同编号', '入库单号', '入库时间', '供应商', '备注'],
        ['123456789012345', '产品名称示例', '产品型号示例', '中国移动', 'BOX001', 'FACTORY001', 1, 'CONTRACT001', 'SI202509180001', '2025-09-18 10:00:00', '供应商A', '备注示例A'],
        ['234567890123456', '产品名称示例', '产品型号示例', '中国联通', 'BOX002', 'FACTORY002', 2, 'CONTRACT002', 'SI202509180002', '2025-09-18 11:00:00', '供应商B', '备注示例B']
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, '入库模板');
      
      XLSX.writeFile(workbook, '入库管理Excel导入模板.xlsx');
      
      message.success('模板下载成功！');
    } catch (error) {
      console.error('生成Excel模板失败:', error);
      message.error('模板下载失败，请稍后重试');
    }
  };

  const getStockInNumberOptions = () => {
    const mockNumbers = [
      { label: 'SI202509180001', value: 'SI202509180001' },
      { label: 'SI202509180002', value: 'SI202509180002' },
      { label: 'SI202509180003', value: 'SI202509180003' },
      { label: 'SI202509180004', value: 'SI202509180004' },
      { label: 'SI202509180005', value: 'SI202509180005' }
    ];
    
    return mockNumbers;
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      console.log('搜索条件:', { filterType, searchValue });
      
      const mockResults: StockInItem[] = [
        {
          id: 1,
          imei: '123456789012345',
          product_name: '产品A',
          product_model: '型号A1',
          operator: '中国移动',
          box_number: 'BOX001',
          factory_order: 'FACTORY001',
          quantity: 1,
          contract_number: 'CONTRACT001',
          stock_in_number: 'SI202509180001',
          // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
          stock_in_date: '2025-09-18 10:00:00',
          supplier: '供应商A',
          remark: '备注A',
          receipt_documents: [],
          status: 'success'
        },
        {
          id: 2,
          imei: '234567890123456',
          product_name: '产品B',
          product_model: '型号B1',
          operator: '中国联通',
          box_number: 'BOX002',
          factory_order: 'FACTORY002',
          quantity: 2,
          contract_number: 'CONTRACT002',
          stock_in_number: 'SI202509180002',
          // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
          stock_in_date: '2025-09-18 11:00:00',
          supplier: '供应商B',
          remark: '备注B',
          receipt_documents: [],
          status: 'success'
        }
      ];
      
      setSearchResults(mockResults);
      message.success(`搜索完成，找到 ${mockResults.length} 条记录`);
    } catch (error: any) {
      console.error('搜索失败:', error);
      message.error('搜索失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchResults([]);
  };

  const handleConfirm = () => {
    message.success('更新成功！');
  };

  const handleEditItem = (item: StockInItem) => {
    setUpdatingItem(item);
    setIsUpdateModalVisible(true);
    // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
    updateForm.setFieldsValue({
      ...item,
      stock_in_date: item.stock_in_date ? dayjs(item.stock_in_date) : null
    });
  };

  const handleSaveUpdate = () => {
    updateForm.validateFields().then(values => {
      if (updatingItem) {
        // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
        const updatedItem: StockInItem = {
          ...updatingItem,
          ...values,
          stock_in_date: values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD HH:mm:ss') : ''
        };
        
        setSearchResults(prev => 
          prev.map(item => 
            item.id === updatingItem.id ? updatedItem : item
          )
        );
        
        setIsUpdateModalVisible(false);
        setUpdatingItem(null);
        updateForm.resetFields();
        message.success('更新成功！');
      }
    }).catch(errorInfo => {
      console.error('更新表单验证失败:', errorInfo);
      message.error('请检查表单填写是否正确');
    });
  };

  const handleDeleteItem = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条入库记录吗？此操作不可恢复。',
      onOk: () => {
        setSearchResults(prev => prev.filter(item => item.id !== id));
        message.success('删除成功！');
      }
    });
  };

  const handleDeleteBatchItem = (id: number) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
    message.success('删除成功！');
  };

  const handleEditBatchItem = (item: StockInItem) => {
    setEditingItem(item);
    setIsEditModalVisible(true);
    // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
    editForm.setFieldsValue({
      ...item,
      stock_in_date: item.stock_in_date ? dayjs(item.stock_in_date) : null
    });
  };

  const handleSaveEditBatchItem = () => {
    editForm.validateFields().then(values => {
      if (editingItem) {
        // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
        const updatedItem: StockInItem = {
          ...editingItem,
          ...values,
          stock_in_date: values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD HH:mm:ss') : ''
        };
        
        setBatchItems(prev => 
          prev.map(item => 
            item.id === editingItem.id ? updatedItem : item
          )
        );
        
        setIsEditModalVisible(false);
        setEditingItem(null);
        editForm.resetFields();
        message.success('修改成功！');
      }
    }).catch(errorInfo => {
      console.error('编辑表单验证失败:', errorInfo);
      message.error('请检查表单填写是否正确');
    });
  };

  const searchColumns: ColumnsType<StockInItem> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => {
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 120,
      render: (text) => {
        if (typeof text === 'number') {
          const product = products.find(p => p.id === text);
          return product ? product.name : `产品ID: ${text}`;
        }
        return <span style={{ fontSize: '14px' }}>{text}</span>;
      }
    },
    {
      title: '产品型号',
      dataIndex: 'product_model',
      key: 'product_model',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '运营商',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: 'IMEI号',
      dataIndex: 'imei',
      key: 'imei',
      width: 150,
      render: (text) => <code style={{ fontSize: '14px' }}>{text}</code>
    },
    {
      title: '箱号',
      dataIndex: 'box_number',
      key: 'box_number',
      width: 100,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库时间',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
      width: 150,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库单号',
      dataIndex: 'stock_in_number',
      key: 'stock_in_number',
      width: 150,
      render: (text) => text ? <code style={{ fontSize: '14px' }}>{text}</code> : <span style={{ fontSize: '14px' }}>-</span>
    },
    {
      title: '工厂工单',
      dataIndex: 'factory_order',
      key: 'factory_order',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '合同编号',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => {
        if (status === 'pending') {
          return <Tag color="default" style={{ fontSize: '14px' }}>待处理</Tag>;
        } else if (status === 'success') {
          return <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: '14px' }}>成功</Tag>;
        } else {
          return (
            <Tooltip title={record.error_message || '未知错误'}>
              <Tag color="red" icon={<ExclamationCircleOutlined />} style={{ fontSize: '14px' }}>
                失败
              </Tag>
            </Tooltip>
          );
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
            style={{ fontSize: '14px' }}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteItem(record.id)}
            style={{ fontSize: '14px' }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card title="入库管理">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 单个入库 */}
          <TabPane tab="单个入库" key="single">
            <Form 
              form={singleForm} 
              layout="vertical" 
              initialValues={{ 
                stock_in_number: currentStockInNumber
              }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="产品名称"
                    name="product_name"
                    rules={[{ required: true, message: '请选择产品名称' }]}
                  >
                    <Select 
                      placeholder="请选择产品名称" 
                      loading={loadingProducts}
                      showSearch
                      optionFilterProp="label"
                      onChange={(value, option) => {
                        if (value) {
                          const selectedProduct = products.find(p => p.id === value);
                          if (selectedProduct) {
                            singleForm.setFieldsValue({
                              product_model: selectedProduct.model || ''
                            });
                          }
                        } else {
                          singleForm.setFieldsValue({
                            product_model: ''
                          });
                        }
                      }}
                    >
                      {productOptions.map(option => (
                        <Select.Option key={option.value} value={option.value} label={option.label}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="产品型号"
                    name="product_model"
                  >
                    <Input placeholder="产品型号将根据产品名称自动填充" disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="运营商"
                    name="operator"
                  >
                    <Select 
                      placeholder="请选择运营商" 
                      loading={loadingOperators}
                      showSearch
                      optionFilterProp="label"
                    >
                      {operatorOptions.map(option => (
                        <Select.Option key={option.value} value={option.value} label={option.label}>
                          {option.label || '请选择'}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="入库单号"
                    name="stock_in_number"
                  >
                    <Input placeholder="系统自动生成" disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="供应商"
                    name="supplier"
                  >
                    <Select 
                      placeholder="请选择供应商" 
                      loading={loadingSuppliers}
                      showSearch
                      optionFilterProp="label"
                    >
                      {supplierOptions.map(option => (
                        <Select.Option key={option.value} value={option.value} label={option.label}>
                          {option.label || '请选择'}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="入库时间"
                    name="stock_in_date"
                    rules={[{ required: true, message: '请选择入库时间' }]}
                    initialValue={dayjs()}
                  >
                    <DatePicker 
                      showTime 
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD HH:mm:ss"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="工厂工单"
                    name="factory_order"
                  >
                    <Input placeholder="请输入工厂工单号" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="合同编号"
                    name="contract_number"
                  >
                    <Input placeholder="请输入合同编号" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="IMEI号"
                    name="imei"
                  >
                    <Input placeholder="请输入15位IMEI号" maxLength={15} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="箱号"
                    name="box_number"
                  >
                    <Input placeholder="请输入箱号" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="数量"
                    name="quantity"
                    rules={[{ required: true, message: '请输入数量' }]}
                    initialValue={1}
                  >
                    <InputNumber min={1} max={999} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="备注"
                    name="remark"
                  >
                    <Input placeholder="请输入备注" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="收货单据"
                    name="receipt_documents"
                  >
                    <Upload {...receiptUploadProps} listType="picture-card">
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传文件</div>
                      </div>
                    </Upload>
                    <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
                      支持上传图片、PDF或文档文件，单文件大小不超过10MB
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button 
                  type="primary" 
                  size="large"
                  loading={loading}
                  onClick={handleSingleSubmit}
                  icon={<InboxOutlined />}
                >
                  确认入库
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 批量入库 */}
          <TabPane tab="批量入库" key="batch">
            <div>
              <Form 
                form={batchForm} 
                layout="vertical" 
                initialValues={{ 
                  stock_in_number: currentStockInNumber
                }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="产品名称"
                      name="product_name"
                      rules={[{ required: true, message: '请选择产品名称' }]}
                    >
                      <Select 
                        placeholder="请选择产品名称" 
                        loading={loadingProducts}
                        showSearch
                        optionFilterProp="label"
                        onChange={(value, option) => {
                          if (value) {
                            const selectedProduct = products.find(p => p.id === value);
                            if (selectedProduct) {
                              batchForm.setFieldsValue({
                                product_model: selectedProduct.model || ''
                              });
                            }
                          } else {
                            batchForm.setFieldsValue({
                              product_model: ''
                            });
                          }
                        }}
                      >
                        {productOptions.map(option => (
                          <Select.Option key={option.value} value={option.value} label={option.label}>
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="产品型号"
                      name="product_model"
                    >
                      <Input placeholder="产品型号将根据产品名称自动填充" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="运营商"
                      name="operator"
                    >
                      <Select 
                        placeholder="请选择运营商" 
                        loading={loadingOperators}
                        showSearch
                        optionFilterProp="label"
                      >
                        {operatorOptions.map(option => (
                          <Select.Option key={option.value} value={option.value} label={option.label}>
                            {option.label || '请选择'}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="入库单号"
                      name="stock_in_number"
                    >
                      <Input placeholder="系统自动生成" disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="供应商"
                      name="supplier"
                    >
                      <Select 
                        placeholder="请选择供应商" 
                        loading={loadingSuppliers}
                        showSearch
                        optionFilterProp="label"
                      >
                        {supplierOptions.map(option => (
                          <Select.Option key={option.value} value={option.value} label={option.label}>
                            {option.label || '请选择'}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="入库时间"
                      name="stock_in_date"
                      rules={[{ required: true, message: '请选择入库时间' }]}
                      initialValue={dayjs()}
                    >
                      <DatePicker 
                        showTime 
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="工厂工单"
                      name="factory_order"
                    >
                      <Input placeholder="请输入工厂工单号" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="合同编号"
                      name="contract_number"
                    >
                      <Input placeholder="请输入合同编号" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="IMEI号"
                      name="imei"
                    >
                      <Input placeholder="请输入15位IMEI号" maxLength={15} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="箱号"
                      name="box_number"
                    >
                      <Input placeholder="请输入箱号" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="数量"
                      name="quantity"
                      rules={[{ required: true, message: '请输入数量' }]}
                      initialValue={1}
                    >
                      <InputNumber min={1} max={999} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="备注"
                      name="remark"
                    >
                      <Input placeholder="请输入备注" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="收货单据"
                      name="receipt_documents"
                    >
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {/* 收货单据上传控件 */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <Upload {...receiptUploadProps} listType="picture-card">
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>上传文件</div>
                            </div>
                          </Upload>
                          <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
                            支持上传图片、PDF或文档文件，单文件大小不超过10MB
                          </div>
                        </div>
                        
                        {/* Excel导入控件 */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <Upload 
                            {...excelUploadProps} 
                            listType="picture-card"
                            openFileDialogOnClick={false}
                            style={{ cursor: 'pointer' }}
                          >
                            <div onClick={handleExcelImportClick}>
                              <UploadOutlined style={{ fontSize: '24px' }} />
                              <div style={{ marginTop: 8 }}>Excel导入</div>
                            </div>
                          </Upload>
                          <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
                            点击上传Excel文件进行批量导入
                          </div>
                        </div>
                        
                        {/* 下载模板按钮 */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <Upload 
                            listType="picture-card"
                            openFileDialogOnClick={false}
                            style={{ cursor: 'pointer', height: '100%' }}
                          >
                            <div onClick={downloadExcelTemplate}>
                              <DownloadOutlined style={{ fontSize: '24px' }} />
                              <div style={{ marginTop: 8 }}>下载模板</div>
                            </div>
                          </Upload>
                          <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
                            点击下载Excel导入模板文件
                          </div>
                        </div>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  
                  <Button 
                    type="dashed" 
                    onClick={handleAddBatchItem}
                    icon={<PlusOutlined />}
                  >
                    添加入库项目
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              <Steps current={currentStep}>
                <Steps.Step title="添加入库项目" />
                <Steps.Step title="确认入库" />
              </Steps>

              <Divider />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  loading={loading}
                  onClick={handleBatchSubmit}
                  icon={<InboxOutlined />}
                  style={{ fontSize: '14px' }}
                >
                  确认入库
                </Button>
                
                {/* 添加全部删除按钮 */}
                {batchItems.length > 0 && (
                  <Button 
                    danger
                    size="large"
                    onClick={() => {
                      Modal.confirm({
                        title: '确认删除',
                        content: `确定要删除所有 ${batchItems.length} 条入库项目吗？此操作不可恢复。`,
                        onOk: () => {
                          setBatchItems([]);
                          message.success('已删除所有入库项目');
                        }
                      });
                    }}
                    icon={<DeleteOutlined />}
                    style={{ fontSize: '14px' }}
                  >
                    全部删除
                  </Button>
                )}
                
                {/* 搜索框 */}
                <div style={{ marginLeft: 'auto' }}>
                  <Input 
                    placeholder="搜索产品名称、产品型号、IMEI号等" 
                    value={searchText || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('搜索框值变化:', value);
                      handleSearchDebounced(value);
                    }}
                    prefix={<SearchOutlined />}
                    style={{ width: '250px' }}
                  />
                </div>
              </div>
                
                {/* 批量入库列表统计信息 */}
                {batchItems.length > 0 && (
                  <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
                    <Row gutter={16}>
                      <Col span={6}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>总记录数：</span>
                          <span>{batchItems.length}</span>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>成功记录：</span>
                          <span>{batchItems.filter(item => item.status === 'success').length}</span>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>待处理记录：</span>
                          <span>{batchItems.filter(item => item.status === 'pending').length}</span>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>失败记录：</span>
                          <span>{batchItems.filter(item => item.status === 'error').length}</span>
                        </div>
                      </Col>
                    </Row>
                    
                    {/* 按产品名称和运营商统计 */}
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontWeight: 'bold' }}>按产品和运营商统计：</span>
                      {Array.from(
                        new Set(
                          batchItems.map(
                            item => `${item.product_name || '未指定产品'}-${item.operator || '未指定运营商'}`
                          )
                        )
                      ).map(key => {
                        const [productName, operator] = key.split('-');
                        const items = batchItems.filter(
                          item => (item.product_name || '未指定产品') === productName && 
                                 (item.operator || '未指定运营商') === operator
                        );
                        const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                        return (
                          <Tag key={key} color="blue">
                            {productName}({operator}): {totalCount}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                )}
                

                
                <Table 
                  columns={batchColumns} 
                  dataSource={filteredBatchItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)} 
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: batchItems.length,
                    onChange: (page: number, size?: number) => {
                      setCurrentPage(page);
                      setPageSize(size || 10);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  rowKey="id"
                />
              </div>


          </TabPane>

          {/* 入库更新 - 修改搜索条件表单 */}
          <TabPane tab="入库更新" key="search">
            <Card title="搜索条件" size="small" style={{ marginBottom: 24 }}>
              <Form form={searchForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="条件筛选"
                      name="filterType"
                    >
                      <Select 
                        placeholder="请选择筛选条件"
                        value={filterType}
                        onChange={setFilterType}
                      >
                        <Select.Option value="contract_number">合同编号</Select.Option>
                        <Select.Option value="supplier">供应商</Select.Option>
                        <Select.Option value="factory_order">工厂工单</Select.Option>
                        <Select.Option value="box_number">箱号</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="搜索内容"
                      name="searchContent"
                    >
                      <Input 
                        placeholder="请输入搜索内容" 
                        value={searchValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchValue(value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="入库单号"
                      name="stock_in_number"
                    >
                      <Select 
                        placeholder="请选择入库单号"
                        value={selectedStockInNumber}
                        onChange={setSelectedStockInNumber}
                        showSearch
                        optionFilterProp="label"
                      >
                        {getStockInNumberOptions().map(option => (
                          <Select.Option key={option.value} value={option.value} label={option.label}>
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label="替换内容"
                      name="replaceContent"
                    >
                      <Input 
                        placeholder="请输入替换内容" 
                        value={replaceValue}
                        onChange={(e) => setReplaceValue(e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />}
                      loading={loading}
                      onClick={handleSearch}
                    >
                      搜索
                    </Button>
                    <Button 
                      onClick={handleReset}
                    >
                      重置
                    </Button>
                    <Button 
                      type="primary"
                      onClick={handleConfirm}
                    >
                      确定
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
            
            <Card 
              title="搜索结果"
              size="small"
            >
                {/* 搜索结果统计信息 */}
                <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
                  <Row gutter={16}>
                    <Col span={6}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>总记录数：</span>
                        <span>{searchResults.length}</span>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>成功记录：</span>
                        <span>{searchResults.filter(item => item.status === 'success').length}</span>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>待处理记录：</span>
                        <span>{searchResults.filter(item => item.status === 'pending').length}</span>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>失败记录：</span>
                        <span>{searchResults.filter(item => item.status === 'error').length}</span>
                      </div>
                    </Col>
                  </Row>
                  
                  {/* 按产品名称和运营商统计 */}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontWeight: 'bold' }}>按产品和运营商统计：</span>
                    {Array.from(
                      new Set(
                        searchResults.map(
                          item => `${item.product_name || '未指定产品'}-${item.operator || '未指定运营商'}`
                        )
                      )
                    ).map(key => {
                      const [productName, operator] = key.split('-');
                      const items = searchResults.filter(
                        item => (item.product_name || '未指定产品') === productName && 
                               (item.operator || '未指定运营商') === operator
                      );
                      const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                      return (
                        <Tag key={key} color="blue">
                          {productName}({operator}): {totalCount}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              
              <Table
                columns={searchColumns}
                dataSource={searchResults}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: searchResults.length,
                  onChange: (page, pageSize) => {
                    setCurrentPage(page);
                    setPageSize(pageSize);
                  },
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100']
                }}
                rowKey="id"
                scroll={{ x: 1200 }}
                locale={{ emptyText: '暂无数据，请输入搜索条件进行搜索' }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 编辑模态框 - 用于批量入库项目编辑 */}
      <Modal
        title="编辑入库项目"
        open={isEditModalVisible}
        onOk={handleSaveEditBatchItem}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingItem(null);
          editForm.resetFields();
        }}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品名称"
                name="product_name"
                rules={[{ required: true, message: '请选择产品名称' }]}
              >
                <Select 
                  placeholder="请选择产品名称" 
                  loading={loadingProducts}
                  showSearch
                  optionFilterProp="label"
                  onChange={(value, option) => {
                    if (value) {
                      const selectedProduct = products.find(p => p.id === value);
                      if (selectedProduct) {
                        editForm.setFieldsValue({
                          product_model: selectedProduct.model || ''
                        });
                      }
                    } else {
                      editForm.setFieldsValue({
                        product_model: ''
                      });
                    }
                  }}
                >
                  {productOptions.map(option => (
                    <Select.Option key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品型号"
                name="product_model"
              >
                <Input placeholder="产品型号将根据产品名称自动填充" disabled />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="运营商"
                name="operator"
              >
                <Select 
                  placeholder="请选择运营商" 
                  loading={loadingOperators}
                  showSearch
                  optionFilterProp="label"
                >
                  {operatorOptions.map(option => (
                    <Select.Option key={option.value} value={option.value} label={option.label}>
                      {option.label || '请选择'}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="IMEI号"
                name="imei"
              >
                <Input placeholder="请输入15位IMEI号" maxLength={15} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="箱号"
                name="box_number"
              >
                <Input placeholder="请输入箱号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="入库时间"
                name="stock_in_date"
                rules={[{ required: true, message: '请选择入库时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="入库单号"
                name="stock_in_number"
              >
                <Input placeholder="系统自动生成" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="工厂工单"
                name="factory_order"
              >
                <Input placeholder="请输入工厂工单号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="数量"
                name="quantity"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="合同编号"
                name="contract_number"
              >
                <Input placeholder="请输入合同编号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="供应商"
                name="supplier"
              >
                <Select 
                  placeholder="请选择供应商" 
                  loading={loadingSuppliers}
                  showSearch
                  optionFilterProp="label"
                >
                  {supplierOptions.map(option => (
                    <Select.Option key={option.value} value={option.value} label={option.label}>
                      {option.label || '请选择'}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="备注"
                name="remark"
              >
                <Input placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 更新模态框 - 用于搜索结果编辑 */}
      <Modal
        title="更新入库记录"
        open={isUpdateModalVisible}
        onOk={handleSaveUpdate}
        onCancel={() => {
          setIsUpdateModalVisible(false);
          setUpdatingItem(null);
          updateForm.resetFields();
        }}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form form={updateForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品名称"
                name="product_name"
                rules={[{ required: true, message: '请选择产品名称' }]}
              >
                <Select 
                  placeholder="请选择产品名称" 
                  loading={loadingProducts}
                  showSearch
                  optionFilterProp="label"
                  onChange={(value, option) => {
                    if (value) {
                      const selectedProduct = products.find(p => p.id === value);
                      if (selectedProduct) {
                        updateForm.setFieldsValue({
                          product_model: selectedProduct.model || ''
                        });
                      }
                    } else {
                      updateForm.setFieldsValue({
                        product_model: ''
                      });
                    }
                  }}
                >
                  {productOptions.map(option => (
                    <Select.Option key={option.value} value={option.value} label={option.label}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品型号"
                name="product_model"
              >
                <Input placeholder="产品型号将根据产品名称自动填充" disabled />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="运营商"
                name="operator"
              >
                <Select 
                  placeholder="请选择运营商" 
                  loading={loadingOperators}
                  showSearch
                  optionFilterProp="label"
                >
                  {operatorOptions.map(option => (
                    <Select.Option key={option.value} value={option.value} label={option.label}>
                      {option.label || '请选择'}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="IMEI号"
                name="imei"
              >
                <Input placeholder="请输入15位IMEI号" maxLength={15} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="箱号"
                name="box_number"
              >
                <Input placeholder="请输入箱号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="入库时间"
                name="stock_in_date"
                rules={[{ required: true, message: '请选择入库时间' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="入库单号"
                name="stock_in_number"
              >
                <Input placeholder="系统自动生成" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="工厂工单"
                name="factory_order"
              >
                <Input placeholder="请输入工厂工单号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="数量"
                name="quantity"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="合同编号"
                name="contract_number"
              >
                <Input placeholder="请输入合同编号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="供应商"
                name="supplier"
              >
                <Select 
                  placeholder="请选择供应商" 
                  loading={loadingSuppliers}
                  showSearch
                  optionFilterProp="label"
                >
                  {supplierOptions.map(option => (
                    <Select.Option key={option.value} value={option.value} label={option.label}>
                      {option.label || '请选择'}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="备注"
                name="remark"
              >
                <Input placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default StockInPage;
