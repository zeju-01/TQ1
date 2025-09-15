// 供应商管理页面
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Modal,
  Form,
  message,
  Row,
  Col,
  Tag,
  Popconfirm,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  LinkOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supplierService } from '../../services/suppliers';
import { operatorService, type Operator } from '../../services/operators';
import { courierService, type Courier } from '../../services/couriers';
import type { Supplier } from '../../types';

const { Search } = Input;
const { TextArea } = Input;

const SupplierListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [form] = Form.useForm();
  const [supplierData, setSupplierData] = useState<Supplier[]>([]);
  const [operatorData, setOperatorData] = useState<Operator[]>([]);
  const [courierData, setCourierData] = useState<Courier[]>([]);
  const [total, setTotal] = useState(0);
  const [operatorTotal, setOperatorTotal] = useState(0);
  const [courierTotal, setCourierTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [operatorPagination, setOperatorPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [courierPagination, setCourierPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [activeTab, setActiveTab] = useState('suppliers');
  const [modalType, setModalType] = useState<'supplier' | 'operator' | 'courier'>('supplier');

  // 加载数据函数
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getList({
        page: pagination.current,
        limit: pagination.pageSize
      });
      setSupplierData(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('加载供应商数据失败:', error);
      message.error('加载供应商数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      setLoading(true);
      const response = await operatorService.getList({
        page: operatorPagination.current,
        limit: operatorPagination.pageSize
      });
      setOperatorData(response.data);
      // 使用数组长度作为总数，后续可以根据实际API响应调整
      setOperatorTotal(response.pagination.total);
    } catch (error) {
      console.error('加载运营商数据失败:', error);
      message.error('加载运营商数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCouriers = async () => {
    try {
      setLoading(true);
      const response = await courierService.getList({
        page: courierPagination.current,
        limit: courierPagination.pageSize
      });
      setCourierData(response.data);
      // 使用数组长度作为总数，后续可以根据实际API响应调整
      setCourierTotal(response.pagination.total);
    } catch (error) {
      console.error('加载快递公司数据失败:', error);
      message.error('加载快递公司数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'suppliers') {
      loadSuppliers();
    } else if (activeTab === 'operators') {
      loadOperators();
    } else if (activeTab === 'couriers') {
      loadCouriers();
    }
  }, [activeTab, pagination.current, pagination.pageSize, operatorPagination.current, operatorPagination.pageSize, courierPagination.current, courierPagination.pageSize]);

  // 操作处理函数
  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setModalType('supplier');
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalType('supplier');
    setIsModalVisible(true);
    form.setFieldsValue(supplier);
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      setLoading(true);
      await supplierService.delete(id);
      message.success('删除成功！');
      await loadSuppliers();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = () => {
    setEditingOperator(null);
    setModalType('operator');
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditOperator = (operator: Operator) => {
    setEditingOperator(operator);
    setModalType('operator');
    setIsModalVisible(true);
    form.setFieldsValue(operator);
  };

  const handleDeleteOperator = async (id: number) => {
    try {
      setLoading(true);
      await operatorService.delete(id);
      message.success('删除成功！');
      await loadOperators();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourier = () => {
    setEditingCourier(null);
    setModalType('courier');
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditCourier = (courier: Courier) => {
    setEditingCourier(courier);
    setModalType('courier');
    setIsModalVisible(true);
    form.setFieldsValue(courier);
  };

  const handleDeleteCourier = async (id: number) => {
    try {
      setLoading(true);
      await courierService.delete(id);
      message.success('删除成功！');
      await loadCouriers();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (modalType === 'supplier') {
        if (editingSupplier) {
          await supplierService.update(editingSupplier.id, values);
          message.success('修改成功！');
        } else {
          await supplierService.create(values);
          message.success('添加成功！');
        }
        await loadSuppliers();
      } else if (modalType === 'operator') {
        if (editingOperator) {
          await operatorService.update(editingOperator.id!, values);
          message.success('修改成功！');
        } else {
          await operatorService.create(values);
          message.success('添加成功！');
        }
        await loadOperators();
      } else if (modalType === 'courier') {
        if (editingCourier) {
          await courierService.update(editingCourier.id!, values);
          message.success('修改成功！');
        } else {
          await courierService.create(values);
          message.success('添加成功！');
        }
        await loadCouriers();
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请检查网络连接或联系管理员');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    console.log('搜索:', value);
  };

  // 表格列配置
  const supplierColumns: ColumnsType<Supplier> = [
    {
      title: '公司名称',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 200,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (text) => text && (
        <Space>
          <PhoneOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      )
    },
    {
      title: '邮箱地址',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (text) => text && (
        <Space>
          <MailOutlined style={{ color: '#52c41a' }} />
          {text}
        </Space>
      )
    },
    {
      title: '公司地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            size="small" 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditSupplier(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个供应商吗？"
            onConfirm={() => handleDeleteSupplier(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              size="small" 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const operatorColumns: ColumnsType<Operator> = [
    {
      title: '运营商名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text && (
        <Space>
          <PhoneOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            size="small" 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditOperator(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个运营商吗？"
            onConfirm={() => handleDeleteOperator(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              size="small" 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const courierColumns: ColumnsType<Courier> = [
    {
      title: '快递公司名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text && (
        <Space>
          <PhoneOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      )
    },
    {
      title: '跟踪网址',
      dataIndex: 'tracking_url',
      key: 'tracking_url',
      render: (text) => text && (
        <Space>
          <LinkOutlined style={{ color: '#722ed1' }} />
          <a href={text} target="_blank" rel="noopener noreferrer">
            查看
          </a>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            size="small" 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditCourier(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个快递公司吗？"
            onConfirm={() => handleDeleteCourier(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              size="small" 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderModalForm = () => {
    if (modalType === 'supplier') {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="公司名称" name="company_name" rules={[{ required: true, message: '请输入公司名称' }]}>
                <Input placeholder="请输入公司名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系人" name="contact_person">
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="邮箱地址" name="email" rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}>
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="公司地址" name="address">
            <Input placeholder="请输入公司详细地址" />
          </Form.Item>
          <Form.Item label="其他信息" name="other_info">
            <TextArea rows={3} placeholder="请输入供应商其他相关信息" />
          </Form.Item>
        </>
      );
    } else if (modalType === 'operator') {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="运营商名称" name="name" rules={[{ required: true, message: '请输入运营商名称' }]}>
                <Input placeholder="请输入运营商名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="运营商代码" name="code">
                <Input placeholder="请输入运营商代码" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系人" name="contact_person">
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="邮箱地址" name="email" rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}>
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="地址" name="address">
                <Input placeholder="请输入详细地址" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="描述" name="description">
            <TextArea rows={3} placeholder="请输入运营商描述信息" />
          </Form.Item>
        </>
      );
    } else if (modalType === 'courier') {
      return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="快递公司名称" name="name" rules={[{ required: true, message: '请输入快递公司名称' }]}>
                <Input placeholder="请输入快递公司名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="快递公司代码" name="code">
                <Input placeholder="请输入快递公司代码" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系人" name="contact_person">
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="邮箱地址" name="email" rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}>
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="地址" name="address">
                <Input placeholder="请输入详细地址" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="跟踪网址" name="tracking_url" rules={[{ type: 'url', message: '请输入正确的网址格式' }]}>
            <Input placeholder="请输入快递跟踪网址" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea rows={3} placeholder="请输入快递公司描述信息" />
          </Form.Item>
        </>
      );
    }
    return null;
  };

  const getModalTitle = () => {
    if (modalType === 'supplier') {
      return editingSupplier ? '编辑供应商' : '新增供应商';
    } else if (modalType === 'operator') {
      return editingOperator ? '编辑运营商' : '新增运营商';
    } else if (modalType === 'courier') {
      return editingCourier ? '编辑快递公司' : '新增快递公司';
    }
    return '';
  };

  const tabItems = [
    {
      key: 'suppliers',
      label: '供应商管理',
      children: (
        <>
          <Card style={{ marginBottom: 24 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSupplier}>
                  新增供应商
                </Button>
              </Col>
              <Col>
                <Search placeholder="搜索公司名称、联系人" allowClear enterButton={<SearchOutlined />} style={{ width: 300 }} onSearch={handleSearch} />
              </Col>
            </Row>
          </Card>
          <Card title="供应商列表">
            <Table
              columns={supplierColumns}
              dataSource={supplierData}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize: pageSize || 10 });
                }
              }}
            />
          </Card>
        </>
      )
    },
    {
      key: 'operators',
      label: '运营商列表',
      children: (
        <>
          <Card style={{ marginBottom: 24 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddOperator}>
                  新增运营商
                </Button>
              </Col>
              <Col>
                <Search placeholder="搜索运营商名称、联系人" allowClear enterButton={<SearchOutlined />} style={{ width: 300 }} onSearch={handleSearch} />
              </Col>
            </Row>
          </Card>
          <Card title="运营商列表">
            <Table
              columns={operatorColumns}
              dataSource={operatorData}
              rowKey="id"
              loading={loading}
              pagination={{
                current: operatorPagination.current,
                pageSize: operatorPagination.pageSize,
                total: operatorTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                onChange: (page, pageSize) => {
                  setOperatorPagination({ current: page, pageSize: pageSize || 10 });
                }
              }}
            />
          </Card>
        </>
      )
    },
    {
      key: 'couriers',
      label: '快递公司列表',
      children: (
        <>
          <Card style={{ marginBottom: 24 }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCourier}>
                  新增快递公司
                </Button>
              </Col>
              <Col>
                <Search placeholder="搜索快递公司名称、联系人" allowClear enterButton={<SearchOutlined />} style={{ width: 300 }} onSearch={handleSearch} />
              </Col>
            </Row>
          </Card>
          <Card title="快递公司列表">
            <Table
              columns={courierColumns}
              dataSource={courierData}
              rowKey="id"
              loading={loading}
              pagination={{
                current: courierPagination.current,
                pageSize: courierPagination.pageSize,
                total: courierTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                onChange: (page, pageSize) => {
                  setCourierPagination({ current: page, pageSize: pageSize || 10 });
                }
              }}
            />
          </Card>
        </>
      )
    }
  ];

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <Modal
        title={getModalTitle()}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          {renderModalForm()}
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierListPage;