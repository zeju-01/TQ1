// 用户管理页面
import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  LockOutlined,
  KeyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usersApi, CreateUserRequest, UpdateUserRequest, ResetPasswordRequest } from '@/services/users';
import { formatToBeijingTime } from '@/utils/date';
import { User, PaginatedResponse } from '@/types';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

// 用户状态接口（扩展基础User类型）
interface UserWithStatus extends User {
  status: 'active' | 'inactive';
  last_login?: string;
}

const UserManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithStatus | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [userData, setUserData] = useState<UserWithStatus[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  
  // 防抖计时器引用
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 防抖函数
  const debounce = (func: Function, wait: number) => {
    return function executedFunction(...args: any[]) {
      // 清除之前的定时器
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // 设置新的定时器
      debounceTimer.current = setTimeout(() => {
        func(...args);
      }, wait);
    };
  };

  // 带防抖的加载用户数据函数
  const loadUsersDebounced = useRef(debounce(async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      const response = await usersApi.getList({ page, limit, search });
      
      if (response.success) {
        // 为用户数据添加状态（使用真实的last_login数据）
        const usersWithStatus = response.data.map(user => ({
          ...user,
          status: 'active' as const
        }));
        
        setUserData(usersWithStatus);
        setPagination({
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total
        });
      } else {
        // 检查是否是频率限制错误
        if (response.message && response.message.includes('请求过于频繁')) {
          message.error('请求过于频繁，请稍后再试');
        } else {
          message.error(response.message || '获取用户列表失败');
        }
      }
    } catch (error: any) {
      console.error('加载用户数据失败:', error);
      // 检查是否是频率限制错误
      if (error.message && error.message.includes('请求过于频繁')) {
        message.error('请求过于频繁，请稍后再试');
      } else {
        message.error('加载用户数据失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }, 100)).current; // 将防抖时间减少到100ms以提高响应速度

  // 加载用户数据
  const loadUsers = async (page = 1, limit = 10, search = '', immediate = false) => {
    // 如果是立即加载（如页面初始化），则直接调用，不使用防抖
    if (immediate) {
      try {
        setLoading(true);
        const response = await usersApi.getList({ page, limit, search });
        
        if (response.success) {
          // 为用户数据添加状态（使用真实的last_login数据）
          const usersWithStatus = response.data.map(user => ({
            ...user,
            status: 'active' as const
          }));
          
          setUserData(usersWithStatus);
          setPagination({
            current: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.total
          });
        } else {
          // 检查是否是频率限制错误
          if (response.message && response.message.includes('请求过于频繁')) {
            message.error('请求过于频繁，请稍后再试');
          } else {
            message.error(response.message || '获取用户列表失败');
          }
        }
      } catch (error: any) {
        console.error('加载用户数据失败:', error);
        // 检查是否是频率限制错误
        if (error.message && error.message.includes('请求过于频繁')) {
          message.error('请求过于频繁，请稍后再试');
        } else {
          message.error('加载用户数据失败: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      // 否则使用防抖加载
      loadUsersDebounced(page, limit, search);
    }
  };

  // 组件挂载时加载数据（立即加载）
  useEffect(() => {
    loadUsers(1, 10, '', true); // 添加true参数表示立即加载
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'red',
      manager: 'blue', 
      operator: 'green',
      viewer: 'orange'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  const getRoleText = (role: string) => {
    const texts = {
      admin: '超级管理员',
      manager: '仓库管理员',
      operator: '操作员',
      viewer: '查看员'
    };
    return texts[role as keyof typeof texts] || role;
  };

  const getPermissionText = (permission: string) => {
    const texts = {
      admin: '全部权限',
      manage: '管理权限',
      operate: '操作权限',
      view: '查看权限'
    };
    return texts[permission as keyof typeof texts] || permission;
  };

  const columns: ColumnsType<UserWithStatus> = [
    {
      title: '头像',
      dataIndex: 'username',
      key: 'avatar',
      width: 80,
      render: (username, record) => (
        <Avatar 
          style={{ backgroundColor: '#1890ff' }}
          icon={<UserOutlined />}
        >
          {record.abbreviation?.charAt(0) || username.charAt(0).toUpperCase()}
        </Avatar>
      )
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (text) => <code>{text}</code>
    },
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 120,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '缩写',
      dataIndex: 'abbreviation',
      key: 'abbreviation',
      width: 80
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      )
    },
    {
      title: '权限',
      dataIndex: 'permission',
      key: 'permission',
      width: 100,
      render: (permission) => (
        <Tag color="purple">
          {getPermissionText(permission)}
        </Tag>
      )
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
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) => handleStatusChange(record.id, checked)}
        />
      )
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
      width: 150,
      render: (text) => text ? formatToBeijingTime(text) : '从未登录'
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            type="link" 
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          {record.username !== 'admin' && (
            <Popconfirm
              title="确定要删除这个用户吗？"
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
          )}
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (user: UserWithStatus) => {
    setEditingUser(user);
    setIsModalVisible(true);
    form.setFieldsValue(user);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await usersApi.delete(id);
      if (response.success) {
        message.success('删除成功！');
        // 重新加载用户列表
        await loadUsers(pagination.current, pagination.pageSize, searchText);
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, checked: boolean) => {
    try {
      // 这里可以调用API更新用户状态
      // const response = await usersApi.toggleStatus(id, checked ? 'active' : 'inactive');
      
      setUserData(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: checked ? 'active' : 'inactive', updated_at: new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }) }
            : item
        )
      );
      message.success(`用户已${checked ? '启用' : '禁用'}！`);
    } catch (error) {
      console.error('更新用户状态失败:', error);
      message.error('更新用户状态失败');
    }
  };

  const handleResetPassword = (user: UserWithStatus) => {
    setEditingUser(user);
    setIsPasswordModalVisible(true);
    passwordForm.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      console.log('表单提交数据:', values);
      
      if (editingUser) {
        // 编辑模式 - 调用更新API
        const updateData: UpdateUserRequest = {
          full_name: values.full_name,
          abbreviation: values.abbreviation,
          role: values.role,
          permission: values.permission,
          remarks: values.remarks
        };
        
        console.log('更新用户数据:', updateData);
        const response = await usersApi.update(editingUser.id, updateData);
        if (response.success) {
          message.success('修改成功！');
          // 重新加载用户列表
          await loadUsers(pagination.current, pagination.pageSize, searchText);
        } else {
          message.error(response.message || '修改失败');
        }
      } else {
        // 新增模式 - 调用创建 API
        const createData: CreateUserRequest = {
          username: values.username,
          password: values.password,
          confirmPassword: values.confirmPassword,
          full_name: values.full_name,
          abbreviation: values.abbreviation,
          role: values.role,
          permission: values.permission,
          remarks: values.remarks
        };
        
        console.log('创建用户数据:', createData);
        const response = await usersApi.create(createData);
        console.log('创建用户响应:', response);
        
        if (response.success) {
          message.success('添加成功！');
          // 重新加载用户列表
          await loadUsers(pagination.current, pagination.pageSize, searchText);
        } else {
          const errorMsg = response.message || '添加失败';
          console.error('创建用户失败:', response);
          
          // 显示详细错误信息
          if ((response as any).errors && (response as any).errors.length > 0) {
            const detailErrors = (response as any).errors.map((err: any) => err.msg).join('; ');
            message.error(`${errorMsg}: ${detailErrors}`);
          } else {
            message.error(errorMsg);
          }
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      console.error('提交失败:', error);
      
      // 处理API错误
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.errors && errorData.errors.length > 0) {
          const detailErrors = errorData.errors.map((err: any) => err.msg).join('; ');
          message.error(`验证失败: ${detailErrors}`);
        } else {
          message.error(errorData.message || '操作失败');
        }
      } else {
        message.error('操作失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      setLoading(true);
      
      if (editingUser) {
        const resetData: ResetPasswordRequest = {
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword
        };
        
        const response = await usersApi.resetPassword(editingUser.id, resetData);
        if (response.success) {
          message.success('密码重置成功！');
        } else {
          message.error(response.message || '密码重置失败');
        }
      }
      
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('密码重置失败:', error);
      message.error('密码重置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchText(value);
    await loadUsers(1, pagination.pageSize, value);
  };

  // 处理表格分页变化
  const handleTableChange = (newPagination: any) => {
    loadUsers(newPagination.current, newPagination.pageSize, searchText);
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
                新增用户
              </Button>
            </Space>
          </Col>
          <Col>
            <Search
              placeholder="搜索用户名、姓名"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
          </Col>
        </Row>
      </Card>

      {/* 用户列表 */}
      <Card title="用户列表">
        <Table
          columns={columns}
          dataSource={userData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onShowSizeChange: (current, size) => {
              setPagination({ 
                current: 1, // 当pageSize改变时，重置到第一页
                pageSize: size,
                total: pagination.total
              });
              // 当pageSize改变时，重新加载数据
              loadUsers(1, size, searchText);
            },
            onChange: (page, pageSize) => {
              setPagination({ 
                current: page, 
                pageSize: pageSize || pagination.pageSize,
                total: pagination.total
              });
              // 当页码改变时，重新加载数据
              loadUsers(page, pageSize || pagination.pageSize, searchText);
            }
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
                ]}
              >
                <Input placeholder="请输入用户名" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="姓名"
                name="full_name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入真实姓名" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="确认密码"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请再次输入密码" />
                </Form.Item>
              </Col>
            </Row>
          )}
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="缩写"
                name="abbreviation"
              >
                <Input placeholder="请输入缩写" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="角色"
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">超级管理员</Option>
                  <Option value="manager">仓库管理员</Option>
                  <Option value="operator">操作员</Option>
                  <Option value="viewer">查看员</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="权限"
                name="permission"
                rules={[{ required: true, message: '请选择权限' }]}
              >
                <Select placeholder="请选择权限">
                  <Option value="admin">全部权限</Option>
                  <Option value="manage">管理权限</Option>
                  <Option value="operate">操作权限</Option>
                  <Option value="view">查看权限</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="备注"
            name="remarks"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入用户相关备注信息" 
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码模态框 */}
      <Modal
        title="重置密码"
        open={isPasswordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={() => setIsPasswordModalVisible(false)}
        width={500}
        okText="确定"
        cancelText="取消"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="用户"
            name="username"
            initialValue={editingUser?.full_name}
          >
            <Input disabled value={editingUser?.full_name} />
          </Form.Item>
          
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          
          <Form.Item
            label="确认新密码"
            name="confirmNewPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;