// 出库管理页面
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
  Table,
  Space,
  Tag,
  Modal,
  DatePicker,
  InputNumber,
  Divider
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ScanOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

// 出库数据接口
interface StockOutItem {
  id: number;
  imei: string;
  product_name: string;
  product_model: string;
  operator: string;
  batch_number: string;
  current_status: string;
  selected_quantity: number;
  status: 'pending' | 'success' | 'error';
  error_message?: string;
}

// 可出库库存项目
interface AvailableItem {
  id: number;
  imei: string;
  product_name: string;
  product_model: string;
  operator: string;
  batch_number: string;
  stock_in_date: string;
  supplier: string;
}

const StockOutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [singleForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stockOutItems, setStockOutItems] = useState<StockOutItem[]>([]);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<AvailableItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<React.Key[]>([]);

  // 模拟可出库库存数据
  const mockAvailableItems: AvailableItem[] = [
    {
      id: 1,
      imei: '123456789012345',
      product_name: 'LTE-M模组',
      product_model: 'LTE-M-001',
      operator: '中国移动',
      batch_number: 'BATCH001',
      stock_in_date: '2024-09-10',
      supplier: '华为技术有限公司'
    },
    {
      id: 2,
      imei: '123456789012346',
      product_name: 'NB-IoT模组',
      product_model: 'NB-IoT-002',
      operator: '中国联通',
      batch_number: 'BATCH002',
      stock_in_date: '2024-09-12',
      supplier: '中兴通讯股份有限公司'
    },
    {
      id: 3,
      imei: '123456789012347',
      product_name: '5G模组',
      product_model: '5G-003',
      operator: '中国电信',
      batch_number: 'BATCH003',
      stock_in_date: '2024-09-13',
      supplier: '紫光展锐科技有限公司'
    }
  ];

  // 单个出库提交
  const handleSingleSubmit = async () => {
    try {
      setLoading(true);
      const values = await singleForm.validateFields();
      
      // 生成自动编号
      const autoNumber = generateStockOutNumber();
      
      console.log('单个出库数据:', { ...values, stock_out_auto_number: autoNumber });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('出库成功！');
      singleForm.resetFields();
    } catch (error) {
      console.error('出库失败:', error);
      message.error('出库失败，请检查数据！');
    } finally {
      setLoading(false);
    }
  };

  // 批量出库提交
  const handleBatchSubmit = async () => {
    if (stockOutItems.length === 0) {
      message.warning('请先添加出库项目！');
      return;
    }

    try {
      setLoading(true);
      
      // 模拟批量出库处理
      const processedItems = stockOutItems.map(item => ({
        ...item,
        stock_out_auto_number: generateStockOutNumber(),
        status: (Math.random() > 0.05 ? 'success' : 'error') as 'success' | 'error',
        error_message: Math.random() > 0.05 ? undefined : '库存不足'
      }));
      
      setStockOutItems(processedItems);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const successCount = processedItems.filter(item => item.status === 'success').length;
      const errorCount = processedItems.filter(item => item.status === 'error').length;
      
      if (errorCount === 0) {
        message.success(`批量出库完成！成功 ${successCount} 条`);
        setStockOutItems([]);
        batchForm.resetFields();
      } else {
        message.warning(`出库完成！成功 ${successCount} 条，失败 ${errorCount} 条`);
      }
    } catch (error) {
      console.error('批量出库失败:', error);
      message.error('批量出库失败！');
    } finally {
      setLoading(false);
    }
  };

  // 生成出库编号
  const generateStockOutNumber = () => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `OUT${today}${random}`;
  };

  // 搜索库存
  const handleSearchStock = (value: string) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    // 模拟搜索
    const results = mockAvailableItems.filter(item => 
      item.imei.includes(value) || 
      item.product_name.includes(value) ||
      item.batch_number.includes(value)
    );
    
    setSearchResults(results);
  };

  // 添加到出库列表
  const handleAddToStockOut = () => {
    const selectedRows = searchResults.filter(item => selectedItems.includes(item.id));
    
    const newItems: StockOutItem[] = selectedRows.map(item => ({
      id: item.id,
      imei: item.imei,
      product_name: item.product_name,
      product_model: item.product_model,
      operator: item.operator,
      batch_number: item.batch_number,
      current_status: '在库',
      selected_quantity: 1,
      status: 'pending'
    }));

    setStockOutItems(prev => [...prev, ...newItems]);
    setIsSearchModalVisible(false);
    setSelectedItems([]);
    setSearchResults([]);
    message.success(`已添加 ${newItems.length} 个项目到出库列表`);
  };

  // 删除出库项目
  const handleDeleteStockOutItem = (id: number) => {
    setStockOutItems(prev => prev.filter(item => item.id !== id));
    message.success('删除成功！');
  };

  // 可出库库存表格列
  const availableColumns: ColumnsType<AvailableItem> = [
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
      title: '批次号',
      dataIndex: 'batch_number',
      key: 'batch_number',
      width: 120
    },
    {
      title: '入库日期',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
      width: 120
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
      ellipsis: true
    }
  ];

  // 出库列表表格列
  const stockOutColumns: ColumnsType<StockOutItem> = [
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
      title: '批次号',
      dataIndex: 'batch_number',
      key: 'batch_number',
      width: 120
    },
    {
      title: '出库数量',
      dataIndex: 'selected_quantity',
      key: 'selected_quantity',
      width: 100,
      render: (value, record) => (
        record.status === 'pending' ? (
          <InputNumber
            min={1}
            max={99}
            value={value}
            onChange={(val) => {
              if (val) {
                setStockOutItems(prev => 
                  prev.map(item => 
                    item.id === record.id ? { ...item, selected_quantity: val } : item
                  )
                );
              }
            }}
          />
        ) : value
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => {
        if (status === 'pending') {
          return <Tag color="default">待出库</Tag>;
        } else if (status === 'success') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>已出库</Tag>;
        } else {
          return (
            <Tag color="red" icon={<ExclamationCircleOutlined />}>
              出库失败
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
              onClick={() => handleDeleteStockOutItem(record.id)}
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
      <Card title="出库管理">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 单个出库 */}
          <TabPane tab="单个出库" key="single">
            <Form form={singleForm} layout="vertical">
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
                    <Input 
                      placeholder="请输入15位IMEI号或扫描条码" 
                      maxLength={15}
                      suffix={<ScanOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="出库数量"
                    name="stock_out_quantity"
                    rules={[{ required: true, message: '请输入出库数量' }]}
                    initialValue={1}
                  >
                    <InputNumber min={1} max={999} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="出库单号"
                    name="stock_out_number"
                    rules={[{ required: true, message: '请输入出库单号' }]}
                  >
                    <Input placeholder="请输入出库单号" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="出库日期"
                    name="stock_out_date"
                    rules={[{ required: true, message: '请选择出库日期' }]}
                    initialValue={dayjs()}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="领用对象"
                    name="recipient"
                    rules={[{ required: true, message: '请输入领用对象' }]}
                  >
                    <Input placeholder="请输入领用对象/部门" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="销售单号"
                    name="sales_order_number"
                  >
                    <Input placeholder="请输入销售单号" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="快递公司"
                    name="courier_company"
                  >
                    <Select placeholder="请选择快递公司">
                      <Option value="顺丰速运">顺丰速运</Option>
                      <Option value="京东物流">京东物流</Option>
                      <Option value="圆通速递">圆通速递</Option>
                      <Option value="申通快递">申通快递</Option>
                      <Option value="中通快递">中通快递</Option>
                      <Option value="韵达速递">韵达速递</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="快递单号"
                    name="tracking_number"
                  >
                    <Input placeholder="请输入快递单号" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="收货信息"
                name="delivery_info"
              >
                <TextArea rows={2} placeholder="请输入收货人姓名、电话、地址等信息" />
              </Form.Item>

              <Form.Item
                label="出库备注"
                name="stock_out_notes"
              >
                <TextArea rows={3} placeholder="请输入出库备注信息" />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  size="large"
                  loading={loading}
                  onClick={handleSingleSubmit}
                  icon={<ShoppingCartOutlined />}
                >
                  确认出库
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* 批量出库 */}
          <TabPane tab="批量出库" key="batch">
            <Row gutter={24}>
              <Col span={24}>
                <Card 
                  title="批量出库信息"
                  size="small"
                  style={{ marginBottom: 16 }}
                >
                  <Form form={batchForm} layout="inline">
                    <Form.Item
                      label="出库单号"
                      name="batch_stock_out_number"
                      rules={[{ required: true, message: '请输入出库单号' }]}
                    >
                      <Input placeholder="请输入批量出库单号" style={{ width: 200 }} />
                    </Form.Item>

                    <Form.Item
                      label="领用对象"
                      name="batch_recipient"
                      rules={[{ required: true, message: '请输入领用对象' }]}
                    >
                      <Input placeholder="请输入领用对象" style={{ width: 200 }} />
                    </Form.Item>

                    <Form.Item
                      label="出库日期"
                      name="batch_stock_out_date"
                      initialValue={dayjs()}
                    >
                      <DatePicker />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => setIsSearchModalVisible(true)}
                      >
                        选择库存
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>

                <Card 
                  title={`出库列表 (${stockOutItems.length}项)`}
                  extra={
                    <Space>
                      <Button 
                        type="primary"
                        loading={loading}
                        disabled={stockOutItems.length === 0}
                        onClick={handleBatchSubmit}
                      >
                        批量出库
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    columns={stockOutColumns}
                    dataSource={stockOutItems}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 库存选择模态框 */}
      <Modal
        title="选择出库库存"
        open={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setIsSearchModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="ok" 
            type="primary" 
            disabled={selectedItems.length === 0}
            onClick={handleAddToStockOut}
          >
            添加到出库列表 ({selectedItems.length})
          </Button>
        ]}
      >
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索IMEI、产品名称、批次号"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearchStock}
          />
        </Space>

        <Table
          columns={availableColumns}
          dataSource={searchResults}
          rowKey="id"
          size="small"
          rowSelection={{
            selectedRowKeys: selectedItems,
            onChange: setSelectedItems,
          }}
          pagination={{ pageSize: 8 }}
        />
      </Modal>
    </div>
  );
};

export default StockOutPage;