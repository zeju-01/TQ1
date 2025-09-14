// 入库管理页面
import React, { useState } from 'react';
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
  InputNumber
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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
  box_number: string; // 箱号
  factory_order: string; // 工厂工单
  quantity: number; // 数量
  contract_number: string; // 合同编号
  stock_in_number: string; // 入库单号（系统生成）
  stock_in_time: string; // 入库时间
  supplier: string;
  receipt_documents: any[]; // 收货单据
  status: 'pending' | 'success' | 'error';
  error_message?: string;
}

const StockInPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [singleForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [batchItems, setBatchItems] = useState<StockInItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // 模拟供应商数据
  const suppliers = [
    '华为技术有限公司',
    '中兴通讯股份有限公司',
    '紫光展锐科技有限公司',
    '联发科技股份有限公司'
  ];

  // 文件上传配置
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
      return false; // 阻止自动上传，手动处理
    },
    onChange(info: any) {
      console.log('文件上传:', info.fileList);
    },
  };

  // 单个入库提交
  const handleSingleSubmit = async () => {
    try {
      setLoading(true);
      const values = await singleForm.validateFields();
      
      // 生成自动编号
      const autoNumber = generateStockInNumber();
      const stockInTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      
      console.log('单个入库数据:', { 
        ...values, 
        stock_in_number: autoNumber,
        stock_in_time: stockInTime,
        stock_in_time_formatted: values.stock_in_time?.format('YYYY-MM-DD HH:mm:ss')
      });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('入库成功！');
      singleForm.resetFields();
      
      // 自动生成新的箱号
      singleForm.setFieldsValue({
        box_number: `BOX${Date.now().toString().slice(-6)}`
      });
    } catch (error) {
      console.error('入库失败:', error);
      message.error('入库失败，请检查数据！');
    } finally {
      setLoading(false);
    }
  };

  // 批量入库添加项目
  const handleAddBatchItem = () => {
    try {
      const values = batchForm.getFieldsValue();
      if (!values.imei || !values.product_name || !values.box_number) {
        message.warning('请填写完整的产品信息！');
        return;
      }

      const newItem: StockInItem = {
        id: Date.now(),
        imei: values.imei,
        product_name: values.product_name,
        product_model: values.product_model || '',
        operator: values.operator || '',
        box_number: values.box_number,
        factory_order: values.factory_order || '',
        quantity: values.quantity || 1,
        contract_number: values.contract_number || '',
        stock_in_number: generateStockInNumber(),
        stock_in_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        supplier: values.supplier || '',
        receipt_documents: [],
        status: 'pending'
      };

      setBatchItems(prev => [...prev, newItem]);
      
      // 清空表单，保留箱号和其他公共信息
      batchForm.setFieldsValue({
        imei: '',
        product_name: values.product_name,
        product_model: values.product_model,
        operator: values.operator,
        box_number: values.box_number,
        factory_order: values.factory_order,
        quantity: values.quantity,
        contract_number: values.contract_number,
        supplier: values.supplier
      });
      
      message.success('添加成功！');
    } catch (error) {
      console.error('添加失败:', error);
    }
  };

  // 删除批量入库项目
  const handleDeleteBatchItem = (id: number) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
    message.success('删除成功！');
  };

  // 批量入库提交
  const handleBatchSubmit = async () => {
    if (batchItems.length === 0) {
      message.warning('请先添加入库项目！');
      return;
    }

    try {
      setLoading(true);
      
      // 模拟批量入库处理
      const processedItems = batchItems.map(item => ({
        ...item,
        stock_in_number: generateStockInNumber(),
        stock_in_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: (Math.random() > 0.1 ? 'success' : 'error') as 'success' | 'error',
        error_message: Math.random() > 0.1 ? undefined : 'IMEI号重复'
      }));
      
      setBatchItems(processedItems);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const successCount = processedItems.filter(item => item.status === 'success').length;
      const errorCount = processedItems.filter(item => item.status === 'error').length;
      
      if (errorCount === 0) {
        message.success(`批量入库完成！成功 ${successCount} 条`);
        setBatchItems([]);
        batchForm.resetFields();
      } else {
        message.warning(`入库完成！成功 ${successCount} 条，失败 ${errorCount} 条`);
      }
    } catch (error) {
      console.error('批量入库失败:', error);
      message.error('批量入库失败！');
    } finally {
      setLoading(false);
    }
  };

  // 生成入库编号
  const generateStockInNumber = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `IN${today}${random}`;
  };

  // 文件上传处理
  const handleFileUpload = (info: any) => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功！`);
      // 这里处理Excel文件解析
      const mockData: StockInItem[] = [
        {
          id: 1,
          imei: '123456789012345',
          product_name: 'LTE-M模组',
          product_model: 'LTE-M-001',
          operator: '中国移动',
          box_number: 'BOX001',
          factory_order: 'FO202409001',
          quantity: 1,
          contract_number: 'CT2024001',
          stock_in_number: generateStockInNumber(),
          stock_in_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          supplier: '华为技术有限公司',
          receipt_documents: [],
          status: 'pending'
        },
        {
          id: 2,
          imei: '123456789012346',
          product_name: 'NB-IoT模组',
          product_model: 'NB-IoT-002',
          operator: '中国联通',
          box_number: 'BOX001',
          factory_order: 'FO202409002',
          quantity: 1,
          contract_number: 'CT2024001',
          stock_in_number: generateStockInNumber(),
          stock_in_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          supplier: '华为技术有限公司',
          receipt_documents: [],
          status: 'pending'
        }
      ];
      setBatchItems(mockData);
      setCurrentStep(1);
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败！`);
    }
  };

  // 批量入库表格列
  const batchColumns: ColumnsType<StockInItem> = [
    {
      title: 'IMEI号',
      dataIndex: 'imei',
      key: 'imei',
      width: 150,
      render: (text) => <code>{text}</code>
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 120
    },
    {
      title: '产品型号',
      dataIndex: 'product_model',
      key: 'product_model',
      width: 120
    },
    {
      title: '运营商',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '箱号',
      dataIndex: 'box_number',
      key: 'box_number',
      width: 100
    },
    {
      title: '工厂工单',
      dataIndex: 'factory_order',
      key: 'factory_order',
      width: 120
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80
    },
    {
      title: '合同编号',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 120
    },
    {
      title: '入库单号',
      dataIndex: 'stock_in_number',
      key: 'stock_in_number',
      width: 150,
      render: (text) => text ? <code>{text}</code> : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => {
        if (status === 'pending') {
          return <Tag color="default">待处理</Tag>;
        } else if (status === 'success') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>成功</Tag>;
        } else {
          return (
            <Tag color="red" icon={<ExclamationCircleOutlined />}>
              失败
            </Tag>
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
            <Button 
              size="small" 
              type="link" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteBatchItem(record.id)}
            >
              删除
            </Button>
          )}
          {record.status === 'error' && (
            <Button 
              size="small" 
              type="link"
              onClick={() => message.info(record.error_message || '未知错误')}
            >
              查看错误
            </Button>
          )}
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
            <Form form={singleForm} layout="vertical" initialValues={{ box_number: `BOX${Date.now().toString().slice(-6)}` }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="IMEI号"
                    name="imei"
                    rules={[
                      { required: true, message: '请输入IMEI号' },
                      { len: 15, message: 'IMEI号必须是15位数字' },
                      { pattern: /^\d{15}$/, message: 'IMEI号只能包含数字' }
                    ]}
                  >
                    <Input placeholder="请输入15位IMEI号" maxLength={15} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="产品名称"
                    name="product_name"
                    rules={[{ required: true, message: '请输入产品名称' }]}
                  >
                    <Input placeholder="请输入产品名称" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="产品型号"
                    name="product_model"
                  >
                    <Input placeholder="请输入产品型号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="运营商"
                    name="operator"
                  >
                    <Select placeholder="请选择运营商">
                      <Option value="中国移动">中国移动</Option>
                      <Option value="中国联通">中国联通</Option>
                      <Option value="中国电信">中国电信</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="入库时间"
                    name="stock_in_time"
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
                <Col span={12}>
                  <Form.Item
                    label="箱号"
                    name="box_number"
                    rules={[{ required: true, message: '请输入箱号' }]}
                  >
                    <Input placeholder="请输入箱号" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="工厂工单"
                    name="factory_order"
                  >
                    <Input placeholder="请输入工厂工单号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="数量"
                    name="quantity"
                    rules={[{ required: true, message: '请输入数量' }]}
                    initialValue={1}
                  >
                    <InputNumber min={1} max={999} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="合同编号"
                    name="contract_number"
                  >
                    <Input placeholder="请输入合同编号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="入库单号"
                    name="stock_in_number"
                  >
                    <Input placeholder="系统自动生成" disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="供应商"
                name="supplier"
              >
                <Select placeholder="请选择供应商" showSearch>
                  {suppliers.map(supplier => (
                    <Option key={supplier} value={supplier}>{supplier}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="收货单据"
                name="receipt_documents"
              >
                <Upload {...uploadProps} listType="picture-card">
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传文件</div>
                  </div>
                </Upload>
                <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
                  支持上传图片、PDF或文档文件，单文件大小不超过10MB
                </div>
              </Form.Item>

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
            <Row gutter={24}>
              <Col span={12}>
                <Card title="添加入库项目" size="small">
                  <Form form={batchForm} layout="vertical" initialValues={{ box_number: `BOX${Date.now().toString().slice(-6)}` }}>
                    <Form.Item
                      label="IMEI号"
                      name="imei"
                      rules={[
                        { required: true, message: '请输入IMEI号' },
                        { len: 15, message: 'IMEI号必须是15位数字' },
                        { pattern: /^\d{15}$/, message: 'IMEI号只能包含数字' }
                      ]}
                    >
                      <Input placeholder="请输入15位IMEI号" maxLength={15} />
                    </Form.Item>

                    <Form.Item
                      label="产品名称"
                      name="product_name"
                      rules={[{ required: true, message: '请输入产品名称' }]}
                    >
                      <Input placeholder="请输入产品名称" />
                    </Form.Item>

                    <Form.Item
                      label="产品型号"
                      name="product_model"
                    >
                      <Input placeholder="请输入产品型号" />
                    </Form.Item>

                    <Form.Item
                      label="运营商"
                      name="operator"
                    >
                      <Select placeholder="请选择运营商">
                        <Option value="中国移动">中国移动</Option>
                        <Option value="中国联通">中国联通</Option>
                        <Option value="中国电信">中国电信</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="箱号"
                      name="box_number"
                      rules={[{ required: true, message: '请输入箱号' }]}
                    >
                      <Input placeholder="请输入箱号" />
                    </Form.Item>

                    <Form.Item
                      label="工厂工单"
                      name="factory_order"
                    >
                      <Input placeholder="请输入工厂工单号" />
                    </Form.Item>

                    <Form.Item
                      label="数量"
                      name="quantity"
                      rules={[{ required: true, message: '请输入数量' }]}
                      initialValue={1}
                    >
                      <InputNumber min={1} max={999} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                      label="合同编号"
                      name="contract_number"
                    >
                      <Input placeholder="请输入合同编号" />
                    </Form.Item>

                    <Form.Item
                      label="供应商"
                      name="supplier"
                    >
                      <Select placeholder="请选择供应商" showSearch>
                        {suppliers.map(supplier => (
                          <Option key={supplier} value={supplier}>{supplier}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="dashed" 
                        block
                        icon={<PlusOutlined />}
                        onClick={handleAddBatchItem}
                      >
                        添加到批量列表
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={12}>
                <Card 
                  title={`批量入库列表 (${batchItems.length}项)`}
                  size="small"
                  extra={
                    <Space>
                      <Button 
                        type="primary"
                        loading={loading}
                        disabled={batchItems.length === 0}
                        onClick={handleBatchSubmit}
                      >
                        批量入库
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    columns={batchColumns}
                    dataSource={batchItems}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 400 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Excel导入 */}
          <TabPane tab="Excel导入" key="excel">
            <Steps current={currentStep} style={{ marginBottom: 24 }}>
              <Steps.Step title="上传文件" description="选择Excel文件" />
              <Steps.Step title="数据预览" description="确认导入数据" />
              <Steps.Step title="执行导入" description="批量入库" />
            </Steps>

            {currentStep === 0 && (
              <Card>
                <Dragger
                  name="file"
                  multiple={false}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  showUploadList={false}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽Excel文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持 .xlsx, .xls, .csv 格式文件
                  </p>
                </Dragger>

                <Divider />

                <div>
                  <h4>模板下载</h4>
                  <p>请下载标准模板，按照模板格式填写数据</p>
                  <Button icon={<UploadOutlined />}>
                    下载Excel模板
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 1 && (
              <Card
                title="数据预览"
                extra={
                  <Space>
                    <Button onClick={() => setCurrentStep(0)}>
                      重新上传
                    </Button>
                    <Button 
                      type="primary"
                      onClick={() => {
                        setCurrentStep(2);
                        handleBatchSubmit();
                      }}
                    >
                      确认导入
                    </Button>
                  </Space>
                }
              >
                <Table
                  columns={batchColumns}
                  dataSource={batchItems}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </Card>
            )}

            {currentStep === 2 && (
              <Card title="导入结果">
                <Table
                  columns={batchColumns}
                  dataSource={batchItems}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Button 
                    type="primary"
                    onClick={() => {
                      setCurrentStep(0);
                      setBatchItems([]);
                    }}
                  >
                    完成
                  </Button>
                </div>
              </Card>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default StockInPage;