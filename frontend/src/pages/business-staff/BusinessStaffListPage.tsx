// 业务人员管理页面
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Card,
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Tag,
  Popconfirm,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { businessStaffService } from '../../services/businessStaff';
import { formatToBeijingTime } from '../../utils/date';
import type { BusinessStaff } from '../../types';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const BusinessStaffListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<BusinessStaff | null>(null);
  const [form] = Form.useForm();
  const [staffData, setStaffData] = useState<BusinessStaff[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchText, setSearchText] = useState('');

  // 加载业务人员数据
  const loadBusinessStaff = async () => {
    try {
      setLoading(true);
      const response = await businessStaffService.getList({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText
      });
      setStaffData(response.data);
      setTotal(response.pagination.total); // 从pagination对象中获取total
    } catch (error) {
      console.error('加载业务人员数据失败:', error);
      message.error('加载业务人员数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinessStaff();
  }, [pagination.current, pagination.pageSize, searchText]);

  const columns: ColumnsType<BusinessStaff> = [
    {
      title: '头像',
      dataIndex: 'staff_name',
      key: 'avatar',
      width: 80,
      render: (name) => (
        <Avatar 
          style={{ backgroundColor: '#1890ff' }}
          icon={<UserOutlined />}
        >
          {name.charAt(name.length - 1)}
        </Avatar>
      )
    },
    {
      title: '姓名',
      dataIndex: 'staff_name',
      key: 'staff_name',
      width: 100,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '花名',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 100,
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      width: 150
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      render: (text) => (
        <Tag color="green">{text}</Tag>
      )
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (text) => (
        <Space>
          <PhoneOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (text) => formatToBeijingTime(text)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '在职' : '离职'}
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
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个业务人员吗？"
            onConfirm={() => handleDelete(record.id)}
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

  const handleAdd = () => {
    setEditingStaff(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (staff: BusinessStaff) => {
    setEditingStaff(staff);
    setIsModalVisible(true);
    form.setFieldsValue(staff);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await businessStaffService.delete(id);
      message.success('删除成功！');
      await loadBusinessStaff();
    } catch (error: any) {
      console.error('删除失败:', error);
      
      // 检查是否是网络错误
      if (!error.response) {
        message.error('网络连接失败');
        return;
      }
      
      const { status, data } = error.response;
      
      switch (status) {
        case 404:
          message.error(data.message || '业务人员不存在');
          break;
        case 400:
          message.error(data.message || '该业务人员已被引用，无法删除');
          break;
        case 403:
          message.error('权限不足');
          break;
        default:
          message.error(data.message || '删除失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (editingStaff) {
        // 编辑模式
        await businessStaffService.update(editingStaff.id, values);
        message.success('修改成功！');
      } else {
        // 新增模式
        await businessStaffService.create(values);
        message.success('添加成功！');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      await loadBusinessStaff();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请检查网络连接或联系管理员');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // 重置到第一页并重新加载数据
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <div>
      {/* 操作区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增业务人员
              </Button>
            </Space>
          </Col>
          <Col>
            <Search
              placeholder="搜索姓名、花名、职位"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
          </Col>
        </Row>
      </Card>

      {/* 业务人员列表 */}
      <Card title="业务人员列表">
        <Table
          columns={columns}
          dataSource={staffData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onShowSizeChange: (current, size) => {
              setPagination({ current: 1, pageSize: size });
            },
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize: pageSize || pagination.pageSize });
            }
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingStaff ? '编辑业务人员' : '新增业务人员'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="姓名"
                name="staff_name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="花名"
                name="nickname"
              >
                <Input placeholder="请输入花名/昵称" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="职位"
                name="position"
              >
                <Select placeholder="请选择或输入职位">
                  <Option value="销售专员">销售专员</Option>
                  <Option value="高级销售经理">高级销售经理</Option>
                  <Option value="区域销售总监">区域销售总监</Option>
                  <Option value="客户经理">客户经理</Option>
                  <Option value="销售总监">销售总监</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="部门"
                name="department"
              >
                <Select placeholder="请选择部门">
                  <Option value="销售部">销售部</Option>
                  <Option value="客服部">客服部</Option>
                  <Option value="市场部">市场部</Option>
                  <Option value="技术部">技术部</Option>
                  <Option value="产品部">产品部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="邮箱地址"
                name="email"
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="联系方式"
            name="contact_info"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入详细联系方式，如微信、QQ、钉钉等" 
            />
          </Form.Item>

          {editingStaff && (
            <Form.Item
              label="状态"
              name="status"
            >
              <Select>
                <Option value="active">在职</Option>
                <Option value="inactive">离职</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default BusinessStaffListPage;