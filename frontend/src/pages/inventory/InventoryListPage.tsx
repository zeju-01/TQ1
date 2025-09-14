// 库存管理页面
import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Statistic,
  Upload,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  UndoOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 模拟数据接口
interface InventoryItem {
  id: number;
  imei: string;
  product_name: string;
  product_model: string;
  operator: string;
  batch_number: string;
  stock_in_date: string;
  stock_in_status: string;
  stock_out_status: string;
  supplier: string;
  stock_in_by: string;
}

const InventoryListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isStockInModalVisible, setIsStockInModalVisible] = useState(false);
  const [isStockOutModalVisible, setIsStockOutModalVisible] = useState(false);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [stockInForm] = Form.useForm();
  const [stockOutForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  // 模拟库存数据
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([
    {
      id: 1,
      imei: '123456789012345',
      product_name: 'LTE-M模组',
      product_model: 'LTE-M-001',
      operator: '中国移动',
      batch_number: 'BATCH001',
      stock_in_date: '2024-09-14',
      stock_in_status: '已入库',
      stock_out_status: '在库',
      supplier: '华为技术有限公司',
      stock_in_by: 'admin'
    },
    {
      id: 2,
      imei: '123456789012346',
      product_name: 'NB-IoT模组',
      product_model: 'NB-IoT-002',
      operator: '中国联通',
      batch_number: 'BATCH002',
      stock_in_date: '2024-09-13',
      stock_in_status: '已入库',
      stock_out_status: '已出库',
      supplier: '中兴通讯股份有限公司',
      stock_in_by: 'admin'
    }
  ]);

  // 模拟统计数据
  const statsData = {
    totalItems: 1500,
    inStock: 1200,
    outStock: 300,
    todayStockIn: 50,
    todayStockOut: 25
  };

  const columns: ColumnsType<InventoryItem> = [
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
    },
    {
      title: '产品型号',
      dataIndex: 'product_model',
      key: 'product_model',
    },
    {
      title: '运营商',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '批次号',
      dataIndex: 'batch_number',
      key: 'batch_number',
    },
    {
      title: '入库日期',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
    },
    {
      title: '入库状态',
      dataIndex: 'stock_in_status',
      key: 'stock_in_status',
      render: (status) => (
        <Tag color={status === '已入库' ? 'green' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: '库存状态',
      dataIndex: 'stock_out_status',
      key: 'stock_out_status',
      render: (status) => (
        <Tag color={status === '在库' ? 'blue' : status === '已出库' ? 'orange' : 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button size="small" type="link">查看</Button>
          <Button size="small" type="link">编辑</Button>
          {record.stock_out_status === '在库' && (
            <Button size="small" type="link" onClick={() => handleStockOut([record])}>
              出库
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleStockIn = () => {
    setIsStockInModalVisible(true);
  };

  const handleStockOut = (items?: InventoryItem[]) => {
    setIsStockOutModalVisible(true);
  };

  const handleBatchStockOut = () => {
    setIsStockOutModalVisible(true);
  };

  const handleReturn = () => {
    setIsReturnModalVisible(true);
  };

  const handleStockInSubmit = async () => {
    try {
      const values = await stockInForm.validateFields();
      console.log('入库数据:', values);
      
      // 这里应该调用API
      message.success('入库成功！');
      setIsStockInModalVisible(false);
      stockInForm.resetFields();
    } catch (error) {
      console.error('入库失败:', error);
    }
  };

  const handleStockOutSubmit = async () => {
    try {
      const values = await stockOutForm.validateFields();
      console.log('出库数据:', values);
      
      // 这里应该调用API
      message.success('出库成功！');
      setIsStockOutModalVisible(false);
      stockOutForm.resetFields();
    } catch (error) {
      console.error('出库失败:', error);
    }
  };

  const handleReturnSubmit = async () => {
    try {
      const values = await returnForm.validateFields();
      console.log('退库数据:', values);
      
      // 这里应该调用API
      message.success('退库成功！');
      setIsReturnModalVisible(false);
      returnForm.resetFields();
    } catch (error) {
      console.error('退库失败:', error);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="总库存"
              value={statsData.totalItems}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="在库数量"
              value={statsData.inStock}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="出库数量"
              value={statsData.outStock}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日入库"
              value={statsData.todayStockIn}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日出库"
              value={statsData.todayStockOut}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<InboxOutlined />}
                onClick={handleStockIn}
              >
                入库
              </Button>
              <Button 
                icon={<ShoppingCartOutlined />}
                onClick={handleBatchStockOut}
                disabled={selectedRowKeys.length === 0}
              >
                批量出库
              </Button>
              <Button 
                icon={<UndoOutlined />}
                onClick={handleReturn}
              >
                退库
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出
              </Button>
              <Upload>
                <Button icon={<UploadOutlined />}>导入</Button>
              </Upload>
            </Space>
          </Col>
          <Col>
            <Search
              placeholder="搜索IMEI、产品名称、批次号"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              style={{ width: 300 }}
            />
          </Col>
        </Row>
      </Card>

      {/* 库存列表 */}
      <Card title="库存列表">
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={inventoryData}
          rowKey="id"
          loading={loading}
          pagination={{
            total: inventoryData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </Card>

      {/* 入库模态框 */}
      <Modal
        title="入库操作"
        open={isStockInModalVisible}
        onOk={handleStockInSubmit}
        onCancel={() => setIsStockInModalVisible(false)}
        width={800}
      >
        <Form form={stockInForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="IMEI号"
                name="imei"
                rules={[{ required: true, message: '请输入IMEI号' }]}
              >
                <Input placeholder="请输入15位IMEI号" />
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
                label="批次号"
                name="batch_number"
                rules={[{ required: true, message: '请输入批次号' }]}
              >
                <Input placeholder="请输入批次号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="供应商"
                name="supplier"
              >
                <Input placeholder="请输入供应商" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="入库备注"
            name="stock_in_notes"
          >
            <Input.TextArea rows={3} placeholder="请输入入库备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 出库模态框 */}
      <Modal
        title="出库操作"
        open={isStockOutModalVisible}
        onOk={handleStockOutSubmit}
        onCancel={() => setIsStockOutModalVisible(false)}
        width={600}
      >
        <Form form={stockOutForm} layout="vertical">
          <Form.Item
            label="出库单号"
            name="stock_out_number"
            rules={[{ required: true, message: '请输入出库单号' }]}
          >
            <Input placeholder="请输入出库单号" />
          </Form.Item>
          <Form.Item
            label="领用对象"
            name="recipient"
            rules={[{ required: true, message: '请输入领用对象' }]}
          >
            <Input placeholder="请输入领用对象" />
          </Form.Item>
          <Form.Item
            label="出库备注"
            name="stock_out_notes"
          >
            <Input.TextArea rows={3} placeholder="请输入出库备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 退库模态框 */}
      <Modal
        title="退库操作"
        open={isReturnModalVisible}
        onOk={handleReturnSubmit}
        onCancel={() => setIsReturnModalVisible(false)}
        width={600}
      >
        <Form form={returnForm} layout="vertical">
          <Form.Item
            label="IMEI号"
            name="imei"
            rules={[{ required: true, message: '请输入IMEI号' }]}
          >
            <Input placeholder="请输入要退库的IMEI号" />
          </Form.Item>
          <Form.Item
            label="退库类型"
            name="return_type"
            rules={[{ required: true, message: '请选择退库类型' }]}
          >
            <Select placeholder="请选择退库类型">
              <Option value="质量问题">质量问题</Option>
              <Option value="数量错误">数量错误</Option>
              <Option value="型号错误">型号错误</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="退库原因"
            name="return_reason"
            rules={[{ required: true, message: '请输入退库原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请详细说明退库原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryListPage;