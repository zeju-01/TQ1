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
  DownloadOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { productService } from '../../services/products';
import { operatorService } from '../../services/operators';
import { supplierService } from '../../services/suppliers';
import { stockIn, batchStockIn, getMaxStockInNumber, checkIMEI, searchStockInNumbers, getStockInRecordsByNumber, batchUpdateInventory, batchRestoreInventory } from '../../services/inventory';

import type { Product } from '../../types';
import type { Operator } from '../../services/operators';
import type { Supplier } from '../../types';
import type { Inventory } from '../../types';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

// 入库数据接口
interface StockInItem {
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
  // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
  stock_in_date: string;
  supplier: string;
  remark: string;
  receipt_documents: any[];
  stock_in_document?: string;
  custom_file_names?: string[];
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
  
  // 为每个页面创建独立的收货单据文件列表状态
  const [singleReceiptFileList, setSingleReceiptFileList] = useState<any[]>([]);
  const [batchReceiptFileList, setBatchReceiptFileList] = useState<any[]>([]);
  const [receiptFileList, setReceiptFileList] = useState<any[]>([]);
  
  // 入库更新页面：搜索条件表单状态
  const [filterType, setFilterType] = useState<string>('contract_number');
  const [searchValue, setSearchValue] = useState<string>('');
  const [stockInNumbers, setStockInNumbers] = useState<string[]>([]);
  const [selectedStockInNumber, setSelectedStockInNumber] = useState<string>('');
  const [replaceValue, setReplaceValue] = useState<string>('');
  const [originalSearchResults, setOriginalSearchResults] = useState<StockInItem[]>([]); // 保存原始搜索结果用于重置
  
  const debounceTimers = useRef<Record<string, NodeJS.Timeout | null>>({});
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 添加一个useEffect来确保表单初始值正确设置
  useEffect(() => {
    // 设置搜索表单的初始值
    searchForm.setFieldsValue({
      filterType: 'contract_number',
      searchContent: '',
      stock_in_number: '',
      replaceContent: ''
    });
  }, []);

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

  // 添加一个useEffect来处理标签页切换时重新获取入库单号
  useEffect(() => {
    const reloadStockInNumber = async () => {
      if (activeTab === 'single' || activeTab === 'batch') {
        const newStockInNumber = await fetchMaxStockInNumber();
        setCurrentStockInNumber(newStockInNumber);
        setStockInCounter(prev => prev + 1);
        
        // 更新对应表单的入库单号
        if (activeTab === 'single') {
          singleForm.setFieldsValue({
            stock_in_number: newStockInNumber
          });
        } else if (activeTab === 'batch') {
          batchForm.setFieldsValue({
            stock_in_number: newStockInNumber
          });
        }
      }
    };
    
    reloadStockInNumber();
  }, [activeTab]);

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

  // 添加一个useEffect来处理标签页切换时的自动搜索
  useEffect(() => {
    if (activeTab === 'search') {
      // 当切换到入库更新标签页时，自动触发一次搜索
      // 即使搜索内容为空，也要搜索数据库中对应字段为空值的入库单号
      console.log('切换到入库更新标签页，自动触发搜索');
      console.log('当前筛选条件:', filterType);
      console.log('当前搜索内容:', searchValue);
      
      // 获取表单中的实际值
      const formValues = searchForm.getFieldsValue();
      const actualFilterType = formValues.filterType || filterType;
      const actualSearchValue = formValues.searchContent || searchValue;
      
      console.log('实际筛选条件:', actualFilterType);
      console.log('实际搜索内容:', actualSearchValue);
      
      // 触发搜索，即使条件为空也要搜索空值记录
      debouncedSearch(actualFilterType, actualSearchValue, 0);
    }
  }, [activeTab]);

  // 添加一个useEffect来处理stockInNumbers变化时的自动选择
  useEffect(() => {
    // 如果当前没有选中的入库单号，但有可用的入库单号，则自动选择第一个
    if (!selectedStockInNumber && stockInNumbers.length > 0) {
      console.log('自动选择第一个入库单号:', stockInNumbers[0]);
      setSelectedStockInNumber(stockInNumbers[0]);
      
      // 同步更新表单字段
      searchForm.setFieldsValue({
        stock_in_number: stockInNumbers[0]
      });
      
      // 自动加载第一个入库单号的记录
      handleStockInNumberChange(stockInNumbers[0]);
    }
  }, [stockInNumbers]);

  // 计算搜索汇总数据
  const searchSummaryData = useMemo(() => {
    console.log('计算搜索汇总数据，searchResults:', searchResults);
    if (!searchResults || searchResults.length === 0) {
      console.log('搜索结果为空，返回空数组');
      return [];
    }
    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    // 按产品名称、产品型号、运营商分组统计
    const summaryMap = new Map<string, {
      product_name: string;
      product_model: string;
      operator: string;
      total_quantity: number;
      stock_in_dates: string[];
    }>();

    searchResults.forEach(item => {
      // 处理产品名称，如果是数字ID则转换为产品名称
      let productName: string = '';
      if (typeof item.product_name === 'number') {
        const product = products.find(p => p.id === item.product_name);
        productName = (product && product.name) ? product.name : `产品ID: ${item.product_name}`;
      } else if (typeof item.product_name === 'string' && !isNaN(Number(item.product_name))) {
        // 如果是数字字符串，也尝试查找产品
        const productId = parseInt(item.product_name, 10);
        const product = products.find(p => p.id === productId);
        productName = (product && product.name) ? product.name : item.product_name;
      } else {
        productName = item.product_name as string;
      }

      const key = `${productName}-${item.product_model}-${item.operator}`;
      
      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key)!;
        existing.total_quantity += item.quantity || 0;
        if (item.stock_in_date && !existing.stock_in_dates.includes(item.stock_in_date)) {
          existing.stock_in_dates.push(item.stock_in_date);
        }
      } else {
        summaryMap.set(key, {
          product_name: productName,
          product_model: item.product_model || '',
          operator: item.operator || '',
          total_quantity: item.quantity || 0,
          stock_in_dates: item.stock_in_date ? [item.stock_in_date] : []
        });
      }
    });

    // 转换为数组并添加序号
    return Array.from(summaryMap.values()).map((item, index) => ({
      id: index + 1,
      product_name: item.product_name,
      product_model: item.product_model,
      operator: item.operator,
      total_quantity: item.total_quantity,
      stock_in_date: item.stock_in_dates.sort().join(', ') // 按时间排序后连接
    }));
  }, [searchResults, products]);

  // 搜索汇总表格列定义
  const searchSummaryColumns: ColumnsType<{
    id: number;
    product_name: string;
    product_model: string;
    operator: string;
    total_quantity: number;
    stock_in_date: string;
  }> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 'auto',
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 'auto',
    },
    {
      title: '产品型号',
      dataIndex: 'product_model',
      key: 'product_model',
      width: 'auto',
    },
    {
      title: '运营商',
      dataIndex: 'operator',
      key: 'operator',
      width: 'auto',
    },
    {
      title: '总数',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 'auto',
    },
    {
      title: '入库时间',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
      width: 'auto',
    },
  ];

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
      // 返回 true 允许自动上传，或者返回 false 并手动处理
      // 这里我们返回 false，因为我们希望手动控制上传过程
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
      // 返回 false 以手动控制上传过程
      return false;
    },
    onChange(info: any) {
      console.log('收货单据上传:', info.fileList);
    },
    // 修正onPreview函数实现
    onPreview: async (file: any) => {
      // 如果文件已经有预览URL，直接打开
      if (file.url) {
        window.open(file.url);
        return;
      }
      
      // 如果是图片类型且有originFileObj，创建临时URL预览
      if (file.originFileObj && file.type && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file.originFileObj);
        window.open(url);
        // 在新窗口加载后释放URL对象
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        return;
      }
      
      // 对于其他文件类型，如果有thumbUrl则打开缩略图
      if (file.thumbUrl) {
        window.open(file.thumbUrl);
        return;
      }
      
      // 如果以上都不满足，显示提示信息
      message.info('该文件不支持预览');
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
            const formData: any = {};
            
            // 只有当表单字段不为空时才使用表单值（排除IMEI和箱号）
            if (formValues.operator) formData.operator = formValues.operator;
            if (formValues.supplier) formData.supplier = formValues.supplier;
            if (formValues.factory_order) formData.factory_order = formValues.factory_order;
            if (formValues.contract_number) formData.contract_number = formValues.contract_number;
            if (formValues.remark) formData.remark = formValues.remark;
            if (formValues.stock_in_number) formData.stock_in_number = formValues.stock_in_number;
            // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
            if (formValues.stock_in_date) formData.stock_in_date = formValues.stock_in_date.format('YYYY-MM-DD');
            
            // 处理产品名称 - 如果表单中的product_name是数字ID，需要转换为产品名称
            let productName = '';
            if (item.product_name || item.productName || item['产品名称']) {
              // 优先使用Excel中的产品名称
              productName = item.product_name || item.productName || item['产品名称'];
            } else if (formValues.product_name) {
              // 如果Excel中没有产品名称，使用表单中的产品名称
              if (typeof formValues.product_name === 'number') {
                // 如果是数字ID，从产品列表中查找产品名称
                const selectedProduct = products.find(p => p.id === formValues.product_name);
                productName = selectedProduct ? (selectedProduct.name || '') : '';
              } else {
                // 如果是字符串，直接使用
                productName = formValues.product_name as string;
              }
            }
            
            // 处理产品型号 - 如果表单中的product_name是数字ID，需要获取对应的产品型号
            let productModel = '';
            if (item.product_model || item.productModel || item['产品型号']) {
              // 优先使用Excel中的产品型号
              productModel = item.product_model || item.productModel || item['产品型号'];
            } else if (formValues.product_model) {
              // 如果Excel中没有产品型号，使用表单中的产品型号
              productModel = formValues.product_model as string;
            } else if (typeof formValues.product_name === 'number') {
              // 如果表单中的product_name是数字ID，从产品列表中查找产品型号
              const selectedProduct = products.find(p => p.id === formValues.product_name);
              productModel = selectedProduct ? (selectedProduct.model || '') : '';
            }
            
            // 处理收货单据文件
            let stockInDocument = '';
            const customFileNames: string[] = [];
            let batchReceiptDocuments = formValues.receipt_documents || [];
            
            if (batchReceiptDocuments && batchReceiptDocuments.length > 0) {
              const stockInNumber = formValues.stock_in_number || currentStockInNumber || 'SI';
              const fileNames: string[] = [];
              
              for (let i = 0; i < batchReceiptDocuments.length; i++) {
                const file = batchReceiptDocuments[i];
                if (file && (file.originFileObj || file.file)) {
                  const fileName = file.name || file.fileName || `file-${i}`;
                  const fileExtension = fileName.split('.').pop();
                  const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
                  fileNames.push(newFileName);
                  customFileNames.push(newFileName);
                }
              }
              
              stockInDocument = fileNames.join(', ');
            }
            
            return {
              id: Date.now() + index,
              imei: item.imei || item.IMEI || item['IMEI号'] || '',  // 添加对"IMEI号"字段的支持
              product_name: productName,
              product_model: productModel,
              operator: item.operator || item.Operator || item['运营商'] || formData.operator || '',
              box_number: item.box_number || item.boxNumber || item['箱号'] || '',
              factory_order: item.factory_order || item.factoryOrder || item['工厂工单'] || formData.factory_order || '',
              quantity: parseInt(item.quantity) || parseInt(item.Quantity) || parseInt(item['数量']) || formValues.quantity || 1,
              contract_number: item.contract_number || item.contractNumber || item['合同编号'] || formData.contract_number || '',
              stock_in_number: item.stock_in_number || item.stockInNumber || item['入库单号'] || formData.stock_in_number || '',
              // 已将 stock_in_time 改为 stock_in_date 以与后端保持一致
              stock_in_date: item.stock_in_date || item.stockInTime || item['入库时间'] || formData.stock_in_date || dayjs().format('YYYY-MM-DD'),
              supplier: item.supplier || item.Supplier || item['供应商'] || formData.supplier || '',
              remark: item.remark || item.Remark || item['备注'] || formData.remark || '',
              receipt_documents: batchReceiptDocuments, // 保存原始文件对象，用于后续上传
              stock_in_document: stockInDocument || '', // 保存预期的文件名
              custom_file_names: customFileNames, // 保存自定义文件名数组
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
        const customFileNames: string[] = []; // 存储自定义文件名
        
        for (let i = 0; i < receiptDocuments.length; i++) {
          const file = receiptDocuments[i];
          console.log(`处理文件 ${i}:`, file);
          
          if (file && file.originFileObj) {
            const fileExtension = file.name.split('.').pop();
            const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
            fileNames.push(newFileName);
            customFileNames.push(newFileName); // 保存自定义文件名
            
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
            customFileNames.push(newFileName); // 保存自定义文件名
            
            // 创建新的File对象以使用新文件名
            const newFile = new File([file.file], newFileName, {
              type: file.file.type
            });
            uploadFormData.append('files', newFile);
            console.log(`添加文件到上传表单: ${newFileName}`);
          } else if (file && file.response && file.response.filename) {
            // 如果文件已经上传，直接使用响应中的文件名
            fileNames.push(file.response.filename);
          }
        }
        
        // 添加自定义文件名到表单数据
        customFileNames.forEach((name, index) => {
          uploadFormData.append(`custom_filenames[${index}]`, name);
        });
        
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
              // 使用上传后服务器返回的实际文件名
              const uploadedFileNames = uploadResult.data.map((file: any) => file.filename);
              stockInDocument = uploadedFileNames.join(', ');
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
        stock_in_date: values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD') : new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-'),
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
        
        // 清空收货单据文件列表状态
        setSingleReceiptFileList([]);
        
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
          message.error('入库失败: ' + errorMessage);
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
      
      // 检查IMEI号是否已存在于当前表格中
      if (values.imei) {
        const isDuplicateInTable = batchItems.some(item => item.imei === values.imei);
        if (isDuplicateInTable) {
          message.error(`IMEI号 ${values.imei} 已存在于当前表格中`);
          return;
        }
      }
      
      // 检查IMEI号是否已存在于数据库中
      if (values.imei) {
        try {
          const imeiCheck = await checkIMEI(values.imei);
          if (!imeiCheck.available) {
            message.error(`IMEI号 ${values.imei} 已存在于数据库中`);
            return;
          }
        } catch (error) {
          console.error('检查IMEI失败:', error);
          message.error('检查IMEI失败: ' + (error as Error).message);
          return;
        }
      }
      
      const selectedProduct = products.find(p => p.id === values.product_name);
      const productModel = selectedProduct ? (selectedProduct.model || '') : '';

      // 不再在添加项目时上传文件，而是保存原始文件信息和预期的文件名
      let batchReceiptDocuments = values.receipt_documents || [];
      
      // 生成文件名但不上传文件
      let stockInDocument = '';
      const customFileNames: string[] = []; // 存储自定义文件名
      
      if (batchReceiptDocuments && batchReceiptDocuments.length > 0) {
        const stockInNumber = values.stock_in_number || currentStockInNumber || 'SI';
        const fileNames: string[] = [];
        
        for (let i = 0; i < batchReceiptDocuments.length; i++) {
          const file = batchReceiptDocuments[i];
          if (file && (file.originFileObj || file.file)) {
            const fileName = file.name || file.fileName || `file-${i}`;
            const fileExtension = fileName.split('.').pop();
            const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
            fileNames.push(newFileName);
            customFileNames.push(newFileName); // 保存自定义文件名
          }
        }
        
        stockInDocument = fileNames.join(', ');
      }

      const stockInTime = values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD') : new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-');
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
        receipt_documents: batchReceiptDocuments, // 保存原始文件对象，用于后续上传
        // 添加收货单据信息
        stock_in_document: stockInDocument || '', // 保存预期的文件名
        custom_file_names: customFileNames, // 保存自定义文件名数组
        status: 'pending' as 'pending'
      };

      setBatchItems(prev => [newItem, ...prev]);
      
      batchForm.setFieldsValue({
        imei: ''
        // 不再清空箱号字段，保留用户输入的箱号
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
      
      // 在提交时上传文件
      const itemsWithUploadedDocuments = await Promise.all(batchItems.map(async (item) => {
        // 如果有收货单据文件，上传文件
        if (item.receipt_documents && item.receipt_documents.length > 0) {
          const stockInNumber = item.stock_in_number || currentStockInNumber || 'SI';
          
          // 上传文件到服务器
          const uploadFormData = new FormData();
          const customFileNames = item.custom_file_names || []; // 使用项目中保存的自定义文件名
          
          // 收集文件和自定义文件名
          for (let i = 0; i < item.receipt_documents.length; i++) {
            const file = item.receipt_documents[i];
            if (file && (file.originFileObj || file.file)) {
              // 使用预生成的文件名或生成新的文件名
              const fileName = customFileNames[i] || (() => {
                const originalName = file.name || file.fileName || `file-${i}`;
                const fileExtension = originalName.split('.').pop();
                return `${stockInNumber}_${i + 1}.${fileExtension}`;
              })();
              
              // 创建新的File对象以使用新文件名
              if (file.originFileObj) {
                const newFile = new File([file.originFileObj], fileName, {
                  type: file.originFileObj.type
                });
                uploadFormData.append('files', newFile);
              } else if (file.file) {
                const newFile = new File([file.file], fileName, {
                  type: file.file.type
                });
                uploadFormData.append('files', newFile);
              }
            }
          }
          
          // 添加自定义文件名到表单数据
          customFileNames.forEach((name, index) => {
            uploadFormData.append(`custom_filenames[${index}]`, name);
          });
          
          // 上传文件
          if (customFileNames.length > 0) {
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
                // 使用上传后服务器返回的实际文件名
                const uploadedFileNames = uploadResult.data.map((file: any) => file.filename);
                const stockInDocument = uploadedFileNames.join(', ');
                
                // 返回更新后的项目
                return {
                  ...item,
                  stock_in_document: stockInDocument
                };
              } else {
                console.error('文件上传失败:', uploadResult.message);
                message.warning(`项目 ${item.imei || item.product_name} 的文件上传失败`);
                // 保持原有的 stock_in_document
                return item;
              }
            } catch (uploadError) {
              console.error('文件上传错误:', uploadError);
              message.warning(`项目 ${item.imei || item.product_name} 的文件上传出错`);
              // 保持原有的 stock_in_document
              return item;
            }
          }
        }
        
        // 如果没有文件需要上传，返回原始项目
        return item;
      }));
      
      // 调用后端API进行批量入库操作
      const response = await batchStockIn(itemsWithUploadedDocuments);
      
      if (response.success) {
        const successCount = response.successCount || 0;
        const failedCount = response.failedCount || 0;
        const errors = response.errors || [];
        
        if (failedCount === 0) {
          message.success(`批量入库完成！成功 ${successCount} 条`);
          setBatchItems([]);
          // 清空收货单据文件列表状态
          setBatchReceiptFileList([]);
          
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
          const updatedBatchItems = itemsWithUploadedDocuments.map((item, index) => {
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
      width: 'auto',
      render: (_, __, index) => {
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 'auto',
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
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '运营商',
      dataIndex: 'operator',
      key: 'operator',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: 'IMEI号',
      dataIndex: 'imei',
      key: 'imei',
      width: 'auto',
      render: (text) => <code style={{ fontSize: '14px' }}>{text}</code>
    },
    {
      title: '箱号',
      dataIndex: 'box_number',
      key: 'box_number',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库时间',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库单号',
      dataIndex: 'stock_in_number',
      key: 'stock_in_number',
      width: 'auto',
      render: (text) => text ? <code style={{ fontSize: '14px' }}>{text}</code> : <span style={{ fontSize: '14px' }}>-</span>
    },
    {
      title: '工厂工单',
      dataIndex: 'factory_order',
      key: 'factory_order',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '合同编号',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '收货单据',
      dataIndex: 'stock_in_document',
      key: 'stock_in_document',
      width: 'auto',
      render: (stock_in_document) => {
        if (stock_in_document) {
          // 如果是逗号分隔的多个文件名，显示所有文件名
          const fileNames = stock_in_document.split(',').map((name: string) => name.trim());
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
      width: 'auto',
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
      width: 'auto',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
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
    console.log('getStockInNumberOptions被调用，stockInNumbers:', stockInNumbers);
    const options = stockInNumbers.map(number => ({
      label: number,
      value: number
    }));
    console.log('生成的选项:', options);
    return options;
  };

  // 防抖搜索函数
  const debouncedSearch = useRef(debounce(async (filterType: string, searchValue: string, retryCount = 0) => {
    // 直接使用传入的参数，而不是从状态中读取
    console.log('执行防抖搜索:', { filterType, searchValue });
    
    if (filterType) {
      try {
        const numbers = await searchStockInNumbers(filterType, searchValue);
        console.log('搜索到的入库单号:', numbers);
        setStockInNumbers(numbers);
        
        // 添加调试信息
        console.log('设置stockInNumbers后的值:', numbers);
        
        // 如果有匹配的入库单号，自动选择第一个
        if (numbers.length > 0) {
          setSelectedStockInNumber(numbers[0]);
          console.log('设置selectedStockInNumber后的值:', numbers[0]);
          
          // 同步更新表单字段
          searchForm.setFieldsValue({
            stock_in_number: numbers[0]
          });
          
          // 自动加载第一个入库单号的记录
          const records = await getStockInRecordsByNumber(numbers[0]);
          console.log('搜索到的记录:', records);
          const convertedRecords = records.map((record: any) => ({
            id: record.id,
            imei: record.imei || '',
            product_name: record.product_name || '',
            product_model: record.product_model || '',
            operator: record.operator || '',
            box_number: record.batch_number || '',
            factory_order: record.factory_order || '',
            quantity: record.stock_in_quantity || 1,
            contract_number: record.stock_in_contract_number || '',
            stock_in_number: record.stock_in_number || '',
            stock_in_date: record.stock_in_date || '',
            supplier: record.supplier || '',
            remark: record.stock_in_notes || '',
            receipt_documents: [],
            status: 'success' as 'success'
          }));
          
          console.log('设置搜索结果:', convertedRecords);
          setSearchResults(convertedRecords);
        } else {
          setSearchResults([]);
          // 如果没有结果，也要清空表单中的入库单号
          searchForm.setFieldsValue({
            stock_in_number: ''
          });
        }
      } catch (error: any) {
        console.error('搜索失败:', error);
        message.error('搜索失败: ' + error.message);
        setStockInNumbers([]);
        setSearchResults([]);
      }
    } else {
      // 如果没有筛选条件，清空结果
      setStockInNumbers([]);
      setSelectedStockInNumber('');
      setSearchResults([]);
    }
  }, 500, 'search-stock-in-numbers')).current;

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // 从表单中获取实际的筛选条件和搜索内容
      const formValues = searchForm.getFieldsValue();
      const actualFilterType = formValues.filterType || filterType;
      const actualSearchValue = formValues.searchContent || searchValue;
      
      console.log('搜索条件:', { filterType: actualFilterType, searchValue: actualSearchValue });
      
      // 如果有筛选条件和搜索内容，则搜索匹配的入库单号
      if (actualFilterType && actualSearchValue) {
        const numbers = await searchStockInNumbers(actualFilterType, actualSearchValue);
        setStockInNumbers(numbers);
        message.success(`找到 ${numbers.length} 个匹配的入库单号`);
        
        // 如果有匹配的入库单号，自动选择第一个
        if (numbers.length > 0) {
          setSelectedStockInNumber(numbers[0]);
          
          // 同步更新表单字段
          searchForm.setFieldsValue({
            stock_in_number: numbers[0]
          });
          
          // 自动加载第一个入库单号的记录
          const records = await getStockInRecordsByNumber(numbers[0]);
          const convertedRecords = records.map((record: any) => ({
            id: record.id,
            imei: record.imei || '',
            product_name: record.product_name || '',
            product_model: record.product_model || '',
            operator: record.operator || '',
            box_number: record.batch_number || '',
            factory_order: record.factory_order || '',
            quantity: record.stock_in_quantity || 1,
            contract_number: record.stock_in_contract_number || '',
            stock_in_number: record.stock_in_number || '',
            stock_in_date: record.stock_in_date || '',
            supplier: record.supplier || '',
            remark: record.stock_in_notes || '',
            receipt_documents: [],
            status: 'success' as 'success'
          }));
          
          console.log('设置搜索结果:', convertedRecords);
          setSearchResults(convertedRecords);
        } else {
          console.log('搜索结果为空，设置空数组');
          setSearchResults([]);
        }
      } else {
        // 如果没有筛选条件或搜索内容，清空结果
        setStockInNumbers([]);
        setSelectedStockInNumber('');
        console.log('重置搜索结果为空数组');
        setSearchResults([]);
      }
    } catch (error: any) {
      console.error('搜索失败:', error);
      message.error('搜索失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 当选中的入库单号改变时，加载对应的记录
  const handleStockInNumberChange = async (value: string) => {
    setSelectedStockInNumber(value);
    
    // 同步更新表单字段
    searchForm.setFieldsValue({
      stock_in_number: value
    });
    
    if (value) {
      try {
        setLoading(true);
        const records = await getStockInRecordsByNumber(value);
        const convertedRecords = records.map((record: any) => ({
          id: record.id,
          imei: record.imei || '',
          product_name: record.product_name || '',
          product_model: record.product_model || '',
          operator: record.operator || '',
          box_number: record.batch_number || '',
          factory_order: record.factory_order || '',
          quantity: record.stock_in_quantity || 1,
          contract_number: record.stock_in_contract_number || '',
          stock_in_number: record.stock_in_number || '',
          stock_in_date: record.stock_in_date || '',
          supplier: record.supplier || '',
          remark: record.stock_in_notes || '',
          receipt_documents: [],
          status: 'success' as 'success'
        }));
        
        console.log('加载入库记录，设置搜索结果:', convertedRecords);
        setSearchResults(convertedRecords);
        message.success(`加载了 ${convertedRecords.length} 条记录`);
      } catch (error: any) {
        console.error('加载入库记录失败:', error);
        message.error('加载入库记录失败: ' + error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleReset = async () => {
    // 保存当前的筛选条件，避免重置后丢失
    const currentFilterType = filterType;
    
    // 获取当前表单值
    const formValues = searchForm.getFieldsValue();
    const searchContent = formValues.searchContent || searchValue;
    const replaceContent = formValues.replaceContent || replaceValue;
    
    // 如果有保存的原始搜索结果，则恢复到更新前的状态
    if (originalSearchResults.length > 0) {
      try {
        setLoading(true);
        
        // 准备要恢复的数据
        const restoreData = originalSearchResults.map(item => {
          // 根据当前筛选条件确定要恢复的字段
          let restoreField = '';
          switch (currentFilterType) {
            case 'contract_number':
              restoreField = 'stock_in_contract_number';
              break;
            case 'supplier':
              restoreField = 'supplier';
              break;
            case 'factory_order':
              restoreField = 'factory_order';
              break;
            case 'box_number':
              restoreField = 'batch_number';
              break;
            case 'receipt_documents':
              restoreField = 'stock_in_document';
              break;
            default:
              return null;
          }
          
          // 获取原始值
          let originalValue = '';
          switch (currentFilterType) {
            case 'contract_number':
              originalValue = item.contract_number || '';
              break;
            case 'supplier':
              originalValue = item.supplier || '';
              break;
            case 'factory_order':
              originalValue = item.factory_order || '';
              break;
            case 'box_number':
              originalValue = item.box_number || '';
              break;
            case 'receipt_documents':
              originalValue = item.stock_in_document || '';
              break;
          }
          
          return {
            id: item.id,
            data: {
              [restoreField]: originalValue
            }
          };
        }).filter(item => item !== null) as { id: number; data: Partial<Inventory> }[];
        
        // 调用后端API进行批量恢复
        if (restoreData.length > 0) {
          const response = await batchRestoreInventory(restoreData);
          
          if (!response.success) {
            throw new Error(response.message);
          }
        }
        
        // 更新前端显示的数据
        setSearchResults([...originalSearchResults]);
        setOriginalSearchResults([]); // 清空原始结果缓存
        message.success('已恢复到更新前的状态');
      } catch (error: any) {
        console.error('恢复数据失败:', error);
        message.error('恢复数据失败: ' + (error.message || '未知错误'));
      } finally {
        setLoading(false);
      }
    } else {
      // 如果没有原始搜索结果，重新执行搜索以获取最新数据
      handleSearch();
    }
    
    // 恢复筛选条件、搜索内容和更新内容
    searchForm.setFieldsValue({
      filterType: currentFilterType,
      searchContent: searchContent,
      replaceContent: replaceContent
    });
  };

  const handleConfirm = async () => {
    // 获取表单中的更新内容
    const formValues = searchForm.getFieldsValue();
    const updateContent = formValues.replaceContent;
    const searchContent = formValues.searchContent;
    
    // 获取当前的筛选条件
    const currentFilterType = formValues.filterType || filterType;
    
    // 如果是收货单据筛选，特殊处理文件上传
    if (currentFilterType === 'receipt_documents') {
      // 检查是否有上传的文件
      const receiptDocuments = formValues.receipt_documents || [];
      if (receiptDocuments.length > 0) {
        try {
          setLoading(true);
          
          // 保存原始搜索结果用于可能的重置操作（在更新之前保存）
          setOriginalSearchResults([...searchResults]);
          
          // 过滤出与搜索内容相同的记录进行更新
          let filteredResults = [...searchResults];
          if (searchContent && searchContent.trim() !== '') {
            filteredResults = searchResults.filter(item => 
              item.stock_in_document && item.stock_in_document.includes(searchContent)
            );
          }
          
          // 如果没有匹配的记录，提示用户
          if (filteredResults.length === 0) {
            message.warning('没有找到与搜索内容匹配的记录');
            // 清空原始搜索结果
            setOriginalSearchResults([]);
            setLoading(false);
            return;
          }
          
          // 上传文件到服务器
          const uploadFormData = new FormData();
          const fileNames: string[] = [];
          const customFileNames: string[] = [];
          
          // 生成文件名前缀（使用第一个匹配记录的入库单号，如果没有则使用默认值）
          const firstRecord = filteredResults[0];
          const stockInNumber = firstRecord.stock_in_number || 'SI';
          
          for (let i = 0; i < receiptDocuments.length; i++) {
            const file = receiptDocuments[i];
            if (file && file.originFileObj) {
              const fileExtension = file.name.split('.').pop();
              const newFileName = `${stockInNumber}_${i + 1}.${fileExtension}`;
              fileNames.push(newFileName);
              customFileNames.push(newFileName);
              
              // 创建新的File对象以使用新文件名
              const newFile = new File([file.originFileObj], newFileName, {
                type: file.originFileObj.type
              });
              uploadFormData.append('files', newFile);
            }
          }
          
          // 添加自定义文件名到表单数据
          customFileNames.forEach((name, index) => {
            uploadFormData.append(`custom_filenames[${index}]`, name);
          });
          
          let stockInDocument = '';
          if (fileNames.length > 0) {
            // 上传文件
            const uploadResponse = await fetch('/api/upload/multiple', {
              method: 'POST',
              body: uploadFormData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            
            const uploadResult = await uploadResponse.json();
            
            if (uploadResult.success) {
              // 使用上传后服务器返回的实际文件名
              const uploadedFileNames = uploadResult.data.map((file: any) => file.filename);
              stockInDocument = uploadedFileNames.join(', ');
            } else {
              // 即使上传失败，也要使用生成的文件名
              stockInDocument = fileNames.join(', ');
              message.warning('文件上传失败，将继续更新操作');
            }
          }
          
          // 准备要更新的数据（仅更新匹配的记录）
          const updates = filteredResults.map(item => ({
            id: item.id,
            data: {
              stock_in_document: stockInDocument
            }
          }));
          
          // 调用后端API进行批量更新
          const response = await batchUpdateInventory(updates);
          
          if (response.success) {
            // 更新前端显示的数据
            const updatedResults = searchResults.map(item => {
              // 检查当前项是否在更新列表中
              const isUpdated = filteredResults.some(filteredItem => filteredItem.id === item.id);
              if (isUpdated) {
                return {
                  ...item,
                  stock_in_document: stockInDocument
                };
              }
              return item;
            });
            
            setSearchResults(updatedResults);
            
            // 清空文件列表
            setReceiptFileList([]);
            searchForm.setFieldsValue({
              receipt_documents: []
            });
            
            message.success(`成功更新 ${updates.length} 条记录`);
          } else {
            // 如果更新失败，清空原始搜索结果
            setOriginalSearchResults([]);
            throw new Error(response.message);
          }
        } catch (error: any) {
          console.error('更新失败:', error);
          message.error('更新失败: ' + (error.message || '未知错误'));
          // 如果更新失败，清空原始搜索结果
          setOriginalSearchResults([]);
        } finally {
          setLoading(false);
        }
        return;
      }
    }
    
    // 对于非收货单据的更新，使用原有逻辑
    // 如果更新内容为空，则不执行更新操作
    if (!updateContent || updateContent.trim() === '') {
      message.warning('更新内容为空，不执行更新操作');
      return;
    }
    
    // 根据筛选条件确定要更新的字段
    let updateField = '';
    switch (currentFilterType) {
      case 'contract_number':
        updateField = 'stock_in_contract_number';
        break;
      case 'supplier':
        updateField = 'supplier';
        break;
      case 'factory_order':
        updateField = 'factory_order';
        break;
      case 'box_number':
        updateField = 'batch_number';
        break;
      case 'receipt_documents':
        updateField = 'stock_in_document';
        break;
      default:
        message.warning('无效的筛选条件');
        return;
    }
    
    try {
      setLoading(true);
      
      // 保存原始搜索结果用于可能的重置操作（在更新之前保存）
      setOriginalSearchResults([...searchResults]);
      
      // 过滤出与搜索内容相同的记录进行更新
      let filteredResults = [...searchResults];
      if (searchContent && searchContent.trim() !== '') {
        switch (currentFilterType) {
          case 'contract_number':
            filteredResults = searchResults.filter(item => 
              item.contract_number && item.contract_number.includes(searchContent)
            );
            break;
          case 'supplier':
            filteredResults = searchResults.filter(item => 
              item.supplier && item.supplier.includes(searchContent)
            );
            break;
          case 'factory_order':
            filteredResults = searchResults.filter(item => 
              item.factory_order && item.factory_order.includes(searchContent)
            );
            break;
          case 'box_number':
            filteredResults = searchResults.filter(item => 
              item.box_number && item.box_number.includes(searchContent)
            );
            break;
          case 'receipt_documents':
            filteredResults = searchResults.filter(item => 
              item.stock_in_document && item.stock_in_document.includes(searchContent)
            );
            break;
        }
      }
      
      // 如果没有匹配的记录，提示用户
      if (filteredResults.length === 0) {
        message.warning('没有找到与搜索内容匹配的记录');
        // 清空原始搜索结果
        setOriginalSearchResults([]);
        setLoading(false);
        return;
      }
      
      // 准备要更新的数据（仅更新匹配的记录）
      const updates = filteredResults.map(item => ({
        id: item.id,
        data: {
          [updateField]: updateContent
        }
      }));
      
      // 调用后端API进行批量更新
      const response = await batchUpdateInventory(updates);
      
      if (response.success) {
        // 更新前端显示的数据
        const updatedResults = searchResults.map(item => {
          // 检查当前项是否在更新列表中
          const isUpdated = filteredResults.some(filteredItem => filteredItem.id === item.id);
          if (isUpdated) {
            return {
              ...item,
              [currentFilterType === 'contract_number' ? 'contract_number' : 
               currentFilterType === 'supplier' ? 'supplier' : 
               currentFilterType === 'factory_order' ? 'factory_order' : 
               currentFilterType === 'box_number' ? 'box_number' :
               'stock_in_document']: updateContent
            };
          }
          return item;
        });
        
        setSearchResults(updatedResults);
        
        message.success(`成功更新 ${updates.length} 条记录`);
      } else {
        // 如果更新失败，清空原始搜索结果
        setOriginalSearchResults([]);
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('更新失败:', error);
      message.error('更新失败: ' + (error.message || '未知错误'));
      // 如果更新失败，清空原始搜索结果
      setOriginalSearchResults([]);
    } finally {
      setLoading(false);
    }
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
          stock_in_date: values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD') : ''
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
          stock_in_date: values.stock_in_date ? values.stock_in_date.format('YYYY-MM-DD') : ''
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
      width: 'auto',
      render: (_, __, index) => {
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 'auto',
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
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '运营商',
      dataIndex: 'operator',
      key: 'operator',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: 'IMEI号',
      dataIndex: 'imei',
      key: 'imei',
      width: 'auto',
      render: (text) => <code style={{ fontSize: '14px' }}>{text}</code>
    },
    {
      title: '箱号',
      dataIndex: 'box_number',
      key: 'box_number',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库时间',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '入库单号',
      dataIndex: 'stock_in_number',
      key: 'stock_in_number',
      width: 'auto',
      render: (text) => text ? <code style={{ fontSize: '14px' }}>{text}</code> : <span style={{ fontSize: '14px' }}>-</span>
    },
    {
      title: '工厂工单',
      dataIndex: 'factory_order',
      key: 'factory_order',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '合同编号',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 'auto',
      render: (text) => <span style={{ fontSize: '14px' }}>{text}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 'auto',
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
      width: 'auto',
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
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
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

              <Row gutter={6} align="middle">
                <Col span={6}>
                  <Form.Item
                    label={(
                      <span>
                        收货单据{' '}
                        <Tooltip title="支持上传图片、PDF或文档文件，单文件大小不超过10MB">
                          <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                        </Tooltip>
                      </span>
                    )}
                    name="receipt_documents"
                  >
                    <Upload 
                      {...receiptUploadProps} 
                      listType="picture-card"
                      fileList={singleReceiptFileList}
                      onChange={(info) => {
                        console.log('收货单据上传:', info.fileList);
                        setSingleReceiptFileList(info.fileList);
                        // 同时更新表单字段的值
                        singleForm.setFieldsValue({
                          receipt_documents: info.fileList
                        });
                      }}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传文件</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                </Col>
              </Row>
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
                  <Col span={5}>
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
                  <Col span={5}>
                    <Form.Item
                      label="产品型号"
                      name="product_model"
                    >
                      <Input placeholder="产品型号将根据产品名称自动填充" disabled />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
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
                  <Col span={5}>
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
                  <Col span={4}>
                    <Form.Item
                      label="入库单号"
                      name="stock_in_number"
                    >
                      <Input placeholder="系统自动生成" disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={5}>
                    <Form.Item
                      label="入库时间"
                      name="stock_in_date"
                      rules={[{ required: true, message: '请选择入库时间' }]}
                      initialValue={dayjs()}
                    >
                      <DatePicker 
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      label="数量"
                      name="quantity"
                      rules={[{ required: true, message: '请输入数量' }]}
                      initialValue={1}
                    >
                      <InputNumber min={1} max={999} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      label="工厂工单"
                      name="factory_order"
                    >
                      <Input placeholder="请输入工厂工单号" />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      label="合同编号"
                      name="contract_number"
                    >
                      <Input placeholder="请输入合同编号" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      label="备注"
                      name="remark"
                    >
                      <Input placeholder="请输入备注" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={5}>
                    <Form.Item
                      label="IMEI号"
                      name="imei"
                    >
                      <Input placeholder="请输入15位IMEI号" maxLength={15} />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item
                      label="箱号"
                      name="box_number"
                    >
                      <Input placeholder="请输入箱号" />
                    </Form.Item>
                  </Col>
                   <Col span={5}>
                    <Form.Item
                      
                    >
                     
                    </Form.Item>
                  </Col>
                  
                  <Col span={5}>
                    <Form.Item
                      label={(
                        <span>
                          收货单据{' '}
                          <Tooltip title="支持上传图片、PDF或文档文件，单文件大小不超过10MB">
                            <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                          </Tooltip>
                        </span>
                      )}
                      name="receipt_documents"
                    >
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        
                       
                        {/* 收货单据上传控件 */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          </div>
                          <Upload 
                            {...receiptUploadProps} 
                            listType="picture-card"
                            fileList={batchReceiptFileList}
                            onChange={(info) => {
                              console.log('收货单据上传:', info.fileList);
                              setBatchReceiptFileList(info.fileList);
                              // 同时更新表单字段的值
                              batchForm.setFieldsValue({
                                receipt_documents: info.fileList
                              });
                            }}
                          >
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>上传单据</div>
                            </div>
                          </Upload>
                        </div>
                        

                      </div>
                    </Form.Item>
                  </Col>
                </Row>

                
              </Form>
                
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '60px',marginBottom: '24px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleAddBatchItem}
                  icon={<PlusOutlined />}
                >
                  单个添加入库
                </Button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '32px' }}>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleExcelImportClick}
                    icon={<UploadOutlined />}
                  >
                    <span>
                      批量导入入库{' '}
                      <Tooltip title="支持上传Excel或CSV文件，单文件大小不超过10MB">
                        <QuestionCircleOutlined style={{ color: '#ffffff', cursor: 'help' }} />
                      </Tooltip>
                    </span>
                  </Button>
                  
                  <Button 
                    type="default" 
                    size="large"
                    onClick={downloadExcelTemplate}
                    icon={<DownloadOutlined />}
                    style={{ color: '#1890ff', borderColor: '#1890ff' }}
                  >
                    <span>
                      下载模板{' '}
                      <Tooltip title="下载Excel导入模板文件">
                        <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                      </Tooltip>
                    </span>
                  </Button>
                </div>
              </div>
                
              <Divider />

              <Steps 
                current={currentStep}
                size="small"
                style={{ fontSize: '12px' }}
              >
                <Steps.Step 
                  title="单个添加入库/批量导入入库" 
                  style={{ fontSize: '12px' }}
                />
                <Steps.Step 
                  title="确认入库" 
                  style={{ fontSize: '12px' }}
                />
              </Steps>

              <Divider />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  loading={loading}
                  onClick={handleBatchSubmit}
                  icon={<InboxOutlined />}
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
                  scroll={{ x: 'max-content' }}
                  style={{ width: '100%' }}
                />
              </div>


          </TabPane>

          {/* 入库更新 - 修改搜索条件表单 */}
          <TabPane tab="入库更新" key="search">
            <Card title="搜索条件" size="small" style={{ marginBottom: 24 }}>
              <Form 
                form={searchForm} 
                layout="vertical"
                initialValues={{
                  filterType: 'contract_number',
                  searchContent: '',
                  stock_in_number: '',
                  replaceContent: ''
                }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      label="条件筛选"
                      name="filterType"
                    >
                      <Select 
                        placeholder="请选择筛选条件"
                        value={filterType}
                        onChange={(value) => {
                          setFilterType(value);
                          console.log('筛选条件变化:', { value, searchValue });
                          // 触发自动搜索，直接传入当前的searchValue
                          if (value) {
                            console.log('触发防抖搜索');
                            debouncedSearch(value, searchValue, 0);
                          } else {
                            console.log('清空搜索结果');
                            // 如果筛选条件为空，清空结果
                            setStockInNumbers([]);
                            setSelectedStockInNumber('');
                            setSearchResults([]);
                          }
                          // 重置相关字段
                          searchForm.setFieldsValue({
                            stock_in_number: '',
                          });
                        }}
                      >
                        <Select.Option value="contract_number">合同编号</Select.Option>
                        <Select.Option value="supplier">供应商</Select.Option>
                        <Select.Option value="factory_order">工厂工单</Select.Option>
                        <Select.Option value="box_number">箱号</Select.Option>
                        <Select.Option value="receipt_documents">收货单据</Select.Option>
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
                          console.log('搜索内容变化:', { value, filterType });
                          // 触发自动搜索，直接传入当前的filterType
                          if (filterType) {
                            console.log('触发防抖搜索');
                            debouncedSearch(filterType, value, 0);
                          } else {
                            console.log('清空搜索结果');
                            // 如果筛选条件为空，清空结果
                            setStockInNumbers([]);
                            setSelectedStockInNumber('');
                            setSearchResults([]);
                          }
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
                        onChange={(value) => handleStockInNumberChange(value)}
                        showSearch
                        optionFilterProp="label"
                      >
                        {getStockInNumberOptions().map(option => {
                          console.log('渲染选项:', option);
                          return (
                            <Select.Option key={option.value} value={option.value} label={option.label}>
                              {option.label}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  {/* 将更新内容/收货单据组件放在入库单号后面 */}
                  <Col span={6}>
                    <Form.Item noStyle>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => 
                          prevValues.filterType !== currentValues.filterType
                        }
                      >
                        {({ getFieldValue }) => {
                          const currentFilterType = getFieldValue('filterType');
                          return currentFilterType === 'receipt_documents' ? (
                            <>
                              {/* 收货单据时显示文件上传组件 */}
                              <Form.Item
                                label={(
                                  <span>
                                    收货单据{' '}
                                    <Tooltip title="支持上传图片、PDF或文档文件，单文件大小不超过10MB">
                                      <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'help' }} />
                                    </Tooltip>
                                  </span>
                                )}
                                name="receipt_documents"
                              >
                                <Upload 
                                  {...receiptUploadProps} 
                                  listType="picture"
                                  fileList={receiptFileList}
                                  onChange={(info) => {
                                    console.log('收货单据上传:', info.fileList);
                                    setReceiptFileList(info.fileList);
                                    // 同时更新表单字段的值
                                    searchForm.setFieldsValue({
                                      receipt_documents: info.fileList
                                    });
                                  }}
                                >
                                  <Button icon={<UploadOutlined />}>上传文件</Button>
                                </Upload>
                              </Form.Item>
                            </>
                          ) : (
                            <>
                              {/* 非收货单据时显示更新内容输入框 */}
                              <Form.Item
                                label="更新内容"
                                name="replaceContent"
                              >
                                <Input 
                                  placeholder="请输入更新内容" 
                                  value={replaceValue}
                                  onChange={(e) => setReplaceValue(e.target.value)}
                                />
                              </Form.Item>
                            </>
                          );
                        }}
                      </Form.Item>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Space>
                    {/* 隐藏搜索按钮，因为现在是自动搜索 */}
                    <div style={{ display: 'none' }}>
                      <Button 
                        type="primary" 
                        icon={<SearchOutlined />}
                        loading={loading}
                        onClick={handleSearch}
                      >
                        搜索
                      </Button>
                    </div>
                    <Button 
                      type="primary"
                      onClick={handleConfirm}
                    >
                      确定
                    </Button>
                    <Button 
                      onClick={handleReset}
                      style={{ color: '#1890ff', borderColor: '#1890ff' }}
                    >
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
            
            {/* 搜索汇总表格 */}
            {searchSummaryData.length > 0 && (
              <div style={{ margin: '24px 0' }}>
                <Card title="搜索汇总" size="small" style={{ border: '1px solid #d9d9d9' }}>
                  <Table
                    columns={searchSummaryColumns}
                    dataSource={searchSummaryData}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    scroll={{ x: 'max-content' }}
                    style={{ width: '100%' }}
                  />
                </Card>
              </div>
            )}
            
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
                          item => {
                            // 处理产品名称，如果是数字ID则转换为产品名称
                            let productName: string = '';
                            if (typeof item.product_name === 'number') {
                              const product = products.find(p => p.id === item.product_name);
                              productName = (product && product.name) ? product.name : `产品ID: ${item.product_name}`;
                            } else if (typeof item.product_name === 'string' && !isNaN(Number(item.product_name))) {
                              // 如果是数字字符串，也尝试查找产品
                              const productId = parseInt(item.product_name, 10);
                              const product = products.find(p => p.id === productId);
                              productName = (product && product.name) ? product.name : item.product_name;
                            } else {
                              productName = item.product_name as string;
                            }
                            return `${productName || '未指定产品'}-${item.operator || '未指定运营商'}`;
                          }
                        )
                      )
                    ).map(key => {
                      const [productName, operator] = key.split('-');
                      // 计算该产品和运营商组合的总入库数量
                      const totalQuantity = searchResults.reduce((sum, item) => {
                        // 处理产品名称，如果是数字ID则转换为产品名称
                        let itemProductName: string = '';
                        if (typeof item.product_name === 'number') {
                          const product = products.find(p => p.id === item.product_name);
                          itemProductName = (product && product.name) ? product.name : `产品ID: ${item.product_name}`;
                        } else if (typeof item.product_name === 'string' && !isNaN(Number(item.product_name))) {
                          // 如果是数字字符串，也尝试查找产品
                          const productId = parseInt(item.product_name, 10);
                          const product = products.find(p => p.id === productId);
                          itemProductName = (product && product.name) ? product.name : item.product_name;
                        } else {
                          itemProductName = item.product_name as string;
                        }
                        
                        // 如果产品名称和运营商匹配，则累加入库数量
                        if ((itemProductName || '未指定产品') === productName && 
                            (item.operator || '未指定运营商') === operator) {
                          return sum + (item.quantity || 0);
                        }
                        return sum;
                      }, 0);
                      
                      return (
                        <Tag key={key} color="blue">
                          {productName}({operator}): {totalQuantity}
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
                  onChange: (page: number, pageSize?: number) => {
                    setCurrentPage(page);
                    setPageSize(pageSize || 10);
                  },
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100']
                }}
                rowKey="id"
                scroll={{ x: 'max-content' }}
                style={{ width: '100%' }}
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
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
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
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
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
