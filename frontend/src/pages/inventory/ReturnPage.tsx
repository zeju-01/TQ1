// 退库管理页面
import React, { useState } from 'react';
import {
  Card,
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
  Upload,
  Divider,
  Radio
} from 'antd';
import {
  UndoOutlined,
  SearchOutlined,
  FileTextOutlined,
  UploadOutlined,
  ScanOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

// 退库数据接口
interface ReturnItem {
  id: number;
  imei: string;
  product_name: string;
  product_model: string;
  operator: string;
  batch_number: string;
  supplier: string;
  stock_in_date: string;
  return_type: string;
  return_reason: string;
  return_quantity: number;
  return_date: string;
  return_by: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  return_notes: string;
}

// 可退库项目
interface ReturnableItem {
  id: number;
  imei: string;
  product_name: string;
  product_model: string;
  operator: string;
  batch_number: string;
  supplier: string;
  stock_in_date: string;
  current_status: string;
}

const ReturnPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<ReturnableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReturnableItem | null>(null);
  const [returnHistory, setReturnHistory] = useState<ReturnItem[]>([]);

  // 模拟可退库数据
  const mockReturnableItems: ReturnableItem[] = [
    {
      id: 1,
      imei: '123456789012345',
      product_name: 'LTE-M模组',
      product_model: 'LTE-M-001',
      operator: '中国移动',
      batch_number: 'BATCH001',
      supplier: '华为技术有限公司',
      stock_in_date: '2024-09-10',
      current_status: '在库'
    },
    {
      id: 2,
      imei: '123456789012346',
      product_name: 'NB-IoT模组',
      product_model: 'NB-IoT-002',
      operator: '中国联通',
      batch_number: 'BATCH002',
      supplier: '中兴通讯股份有限公司',
      stock_in_date: '2024-09-12',
      current_status: '已出库'
    }
  ];

  // 模拟退库历史记录
  const mockReturnHistory: ReturnItem[] = [
    {
      id: 1,
      imei: '123456789012348',
      product_name: 'LTE-M模组',
      product_model: 'LTE-M-001',
      operator: '中国移动',
      batch_number: 'BATCH001',
      supplier: '华为技术有限公司',
      stock_in_date: '2024-09-05',
      return_type: '质量问题',
      return_reason: '设备无法正常启动，疑似硬件故障',
      return_quantity: 1,
      return_date: '2024-09-13',
      return_by: 'admin',
      status: 'completed',
      return_notes: '已联系供应商处理'
    },
    {
      id: 2,
      imei: '123456789012349',
      product_name: 'NB-IoT模组',
      product_model: 'NB-IoT-002',
      operator: '中国联通',
      batch_number: 'BATCH002',
      supplier: '中兴通讯股份有限公司',
      stock_in_date: '2024-09-08',
      return_type: '数量错误',
      return_reason: '入库数量与订单不符，多收1台',
      return_quantity: 1,
      return_date: '2024-09-12',
      return_by: 'admin',
      status: 'approved',
      return_notes: '等待供应商确认收货'
    }
  ];

  // 退库类型选项
  const returnTypes = [
    '质量问题',
    '数量错误',
    '型号错误',
    '规格不符',
    '包装破损',
    '过期产品',
    '其他'
  ];

  // 退库提交
  const handleReturnSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!selectedItem) {
        message.error('请先选择要退库的设备！');
        return;
      }

      // 生成退库编号
      const returnNumber = generateReturnNumber();
      
      const returnData = {
        ...selectedItem,
        ...values,
        return_number: returnNumber,
        return_date: values.return_date.format('YYYY-MM-DD'),
        return_by: 'admin', // 当前用户
        status: 'pending'
      };

      console.log('退库数据:', returnData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 添加到退库历史
      const newReturnItem: ReturnItem = {
        id: Date.now(),
        imei: selectedItem.imei,
        product_name: selectedItem.product_name,
        product_model: selectedItem.product_model,
        operator: selectedItem.operator,
        batch_number: selectedItem.batch_number,
        supplier: selectedItem.supplier,
        stock_in_date: selectedItem.stock_in_date,
        return_type: values.return_type,
        return_reason: values.return_reason,
        return_quantity: values.return_quantity || 1,
        return_date: values.return_date.format('YYYY-MM-DD'),
        return_by: 'admin',
        status: 'pending',
        return_notes: values.return_notes || ''
      };
      
      setReturnHistory(prev => [newReturnItem, ...prev]);
      
      message.success('退库申请提交成功！');
      form.resetFields();
      setSelectedItem(null);
    } catch (error) {
      console.error('退库失败:', error);
      message.error('退库失败，请检查数据！');
    } finally {
      setLoading(false);
    }
  };

  // 生成退库编号
  const generateReturnNumber = () => {
    const today = new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      timeZone: 'Asia/Shanghai'
    }).replace(/\//g, '');
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `RET${today}${random}`;
  };

  // 搜索可退库设备
  const handleSearchReturnableItems = (value: string) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    // 模拟搜索
    const results = mockReturnableItems.filter(item => 
      item.imei.includes(value) || 
      item.product_name.includes(value) ||
      item.batch_number.includes(value)
    );
    
    setSearchResults(results);
  };

  // 选择退库设备
  const handleSelectReturnableItem = (item: ReturnableItem) => {
    setSelectedItem(item);
    setIsSearchModalVisible(false);
    
    // 自动填充表单
    form.setFieldsValue({
      return_quantity: 1,
      return_date: dayjs()
    });
    
    message.success('已选择设备，请填写退库信息');
  };

  // 可退库设备表格列
  const returnableColumns: ColumnsType<ReturnableItem> = [
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
      title: '批次号',
      dataIndex: 'batch_number',
      key: 'batch_number',
      width: 120
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
      ellipsis: true
    },
    {
      title: '入库日期',
      dataIndex: 'stock_in_date',
      key: 'stock_in_date',
      width: 120
    },
    {
      title: '当前状态',
      dataIndex: 'current_status',
      key: 'current_status',
      width: 100,
      render: (status) => (
        <Tag color={status === '在库' ? 'blue' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          size="small" 
          type="link"
          onClick={() => handleSelectReturnableItem(record)}
        >
          选择
        </Button>
      )
    }
  ];

  // 退库历史表格列
  const returnHistoryColumns: ColumnsType<ReturnItem> = [
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
      title: '退库类型',
      dataIndex: 'return_type',
      key: 'return_type',
      width: 100,
      render: (type) => (
        <Tag color="orange">{type}</Tag>
      )
    },
    {
      title: '退库原因',
      dataIndex: 'return_reason',
      key: 'return_reason',
      width: 200,
      ellipsis: true
    },
    {
      title: '退库数量',
      dataIndex: 'return_quantity',
      key: 'return_quantity',
      width: 100
    },
    {
      title: '退库日期',
      dataIndex: 'return_date',
      key: 'return_date',
      width: 120
    },
    {
      title: '操作人',
      dataIndex: 'return_by',
      key: 'return_by',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          pending: { color: 'default', text: '待审核' },
          approved: { color: 'blue', text: '已审核' },
          rejected: { color: 'red', text: '已拒绝' },
          completed: { color: 'green', text: '已完成' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.color === 'green' ? <CheckCircleOutlined /> : undefined}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link">
            查看
          </Button>
          {record.status === 'pending' && (
            <Button size="small" type="link">
              撤回
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row gutter={24}>
        {/* 退库申请 */}
        <Col span={12}>
          <Card title="退库申请" style={{ marginBottom: 24 }}>
            {/* 选择设备区域 */}
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
              <Row gutter={16} align="middle">
                <Col span={18}>
                  {selectedItem ? (
                    <div>
                      <strong>已选择设备:</strong>
                      <div style={{ marginTop: 8 }}>
                        <Tag color="blue">IMEI: {selectedItem.imei}</Tag>
                        <Tag color="green">{selectedItem.product_name}</Tag>
                        <Tag color="orange">{selectedItem.batch_number}</Tag>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#999' }}>
                      请选择要退库的设备
                    </div>
                  )}
                </Col>
                <Col span={6}>
                  <Button 
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => setIsSearchModalVisible(true)}
                  >
                    选择设备
                  </Button>
                </Col>
              </Row>
            </Card>

            <Form form={form} layout="vertical" disabled={!selectedItem}>
              <Form.Item
                label="退库类型"
                name="return_type"
                rules={[{ required: true, message: '请选择退库类型' }]}
              >
                <Select placeholder="请选择退库类型">
                  {returnTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="退库原因"
                name="return_reason"
                rules={[{ required: true, message: '请输入详细的退库原因' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="请详细描述退库原因，包括问题描述、发现时间等"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="退库数量"
                    name="return_quantity"
                    rules={[{ required: true, message: '请输入退库数量' }]}
                  >
                    <Select>
                      <Option value={1}>1台</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="退库日期"
                    name="return_date"
                    rules={[{ required: true, message: '请选择退库日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="处理方式"
                name="return_method"
              >
                <Radio.Group>
                  <Radio value="repair">维修后返还</Radio>
                  <Radio value="replace">更换新设备</Radio>
                  <Radio value="refund">退款处理</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="相关文件"
                name="return_documents"
              >
                <Upload>
                  <Button icon={<UploadOutlined />}>上传图片或文档</Button>
                </Upload>
                <div style={{ color: '#999', fontSize: '12px', marginTop: 4 }}>
                  支持上传问题图片、检测报告等相关文件
                </div>
              </Form.Item>

              <Form.Item
                label="备注"
                name="return_notes"
              >
                <TextArea 
                  rows={2} 
                  placeholder="其他需要说明的情况"
                  maxLength={200}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  size="large"
                  loading={loading}
                  disabled={!selectedItem}
                  onClick={handleReturnSubmit}
                  icon={<UndoOutlined />}
                  block
                >
                  提交退库申请
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 退库历史 */}
        <Col span={12}>
          <Card title="退库历史记录">
            <Table
              columns={returnHistoryColumns}
              dataSource={[...returnHistory, ...mockReturnHistory]}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 8 }}
              scroll={{ y: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 设备选择模态框 */}
      <Modal
        title="选择退库设备"
        open={isSearchModalVisible}
        onCancel={() => setIsSearchModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
          <Search
            placeholder="搜索IMEI、产品名称、批次号"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: '100%' }}
            onSearch={handleSearchReturnableItems}
          />
          <div style={{ color: '#666' }}>
            <ExclamationCircleOutlined style={{ marginRight: 4 }} />
            提示：只能退库"在库"或"已出库"状态的设备
          </div>
        </Space>

        <Table
          columns={returnableColumns}
          dataSource={searchResults}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
        />
      </Modal>
    </div>
  );
};

export default ReturnPage;