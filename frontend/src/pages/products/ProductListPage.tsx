// 产品管理页面
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
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { productService } from '../../services/products';
import type { Product } from '../../types';

const { Search } = Input;

const ProductListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [productData, setProductData] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  // 加载产品数据
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getList({
        page: pagination.current,
        pageSize: pagination.pageSize
      });
      setProductData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('加载产品数据失败:', error);
      message.error('加载产品数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [pagination.current, pagination.pageSize]);

  const columns: ColumnsType<Product> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '产品型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
      render: (text) => <code>{text}</code>
    },
    {
      title: '产品描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true
    },
    {
      title: '缩写',
      dataIndex: 'abbreviation',
      key: 'abbreviation',
      width: 80,
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120
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
            title="确定要删除这个产品吗？"
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
    setEditingProduct(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalVisible(true);
    form.setFieldsValue(product);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await productService.delete(id);
      message.success('删除成功！');
      await loadProducts();
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
      
      if (editingProduct) {
        // 编辑模式
        await productService.update(editingProduct.id, values);
        message.success('修改成功！');
      } else {
        // 新增模式
        await productService.create(values);
        message.success('添加成功！');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      await loadProducts();
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请检查网络连接或联系管理员');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    console.log('搜索:', value);
    // 这里实现搜索逻辑
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
                新增产品
              </Button>
            </Space>
          </Col>
          <Col>
            <Search
              placeholder="搜索产品名称、型号"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
          </Col>
        </Row>
      </Card>

      {/* 产品列表 */}
      <Card title="产品列表">
        <Table
          columns={columns}
          dataSource={productData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize: pageSize || 10 });
            }
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingProduct ? '编辑产品' : '新增产品'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品名称"
                name="name"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品型号"
                name="model"
                rules={[{ required: true, message: '请输入产品型号' }]}
              >
                <Input placeholder="请输入产品型号" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="产品描述"
            name="description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入产品描述" 
            />
          </Form.Item>

          <Form.Item
            label="产品缩写"
            name="abbreviation"
          >
            <Input placeholder="请输入产品缩写" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductListPage;