// 仪表板页面
import React from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Progress,
  Tag,
  List,
  Avatar,
  Typography,
  Space,
  Button
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
  AlertOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// 模拟数据接口
interface RecentActivity {
  id: number;
  type: 'stock_in' | 'stock_out' | 'return';
  description: string;
  user: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

interface LowStockItem {
  id: number;
  product_name: string;
  current_stock: number;
  min_stock: number;
  status: 'low' | 'critical';
}

const DashboardPage: React.FC = () => {
  // 模拟统计数据
  const stats = {
    totalItems: 15420,
    inStock: 12345,
    outStock: 3075,
    todayStockIn: 156,
    todayStockOut: 89,
    monthlyStockIn: 2340,
    monthlyStockOut: 1890,
    stockInGrowth: 12.5,
    stockOutGrowth: -5.2
  };

  // 模拟最近活动数据
  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'stock_in',
      description: '批量入库 100 台 LTE-M模组',
      user: '张三',
      time: '2 分钟前',
      status: 'success'
    },
    {
      id: 2,
      type: 'stock_out',
      description: '出库 50 台 NB-IoT模组',
      user: '李四',
      time: '15 分钟前',
      status: 'success'
    },
    {
      id: 3,
      type: 'return',
      description: '退库 5 台设备（质量问题）',
      user: '王五',
      time: '1 小时前',
      status: 'warning'
    },
    {
      id: 4,
      type: 'stock_in',
      description: '单台入库 1 台 5G模组',
      user: '赵六',
      time: '2 小时前',
      status: 'success'
    }
  ];

  // 模拟低库存警告数据
  const lowStockItems: LowStockItem[] = [
    {
      id: 1,
      product_name: 'LTE-M模组 v2.0',
      current_stock: 45,
      min_stock: 100,
      status: 'critical'
    },
    {
      id: 2,
      product_name: 'NB-IoT模组 Pro',
      current_stock: 78,
      min_stock: 150,
      status: 'low'
    },
    {
      id: 3,
      product_name: '5G模组标准版',
      current_stock: 23,
      min_stock: 50,
      status: 'critical'
    }
  ];

  const lowStockColumns: ColumnsType<LowStockItem> = [
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: '当前库存',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (value, record) => (
        <Text type={record.status === 'critical' ? 'danger' : 'warning'}>
          {value}
        </Text>
      )
    },
    {
      title: '最低库存',
      dataIndex: 'min_stock',
      key: 'min_stock',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'critical' ? 'red' : 'orange'}>
          {status === 'critical' ? '严重不足' : '库存偏低'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button size="small" type="link">
          补货
        </Button>
      ),
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stock_in':
        return <InboxOutlined style={{ color: '#52c41a' }} />;
      case 'stock_out':
        return <ShoppingCartOutlined style={{ color: '#1890ff' }} />;
      case 'return':
        return <UndoOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#fa8c16';
      case 'error':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        库存管理仪表板
      </Title>

      {/* 统计卡片区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总库存数量"
              value={stats.totalItems}
              valueStyle={{ color: '#3f8600' }}
              prefix={<InboxOutlined />}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在库数量"
              value={stats.inStock}
              valueStyle={{ color: '#1890ff' }}
              prefix={<InboxOutlined />}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已出库数量"
              value={stats.outStock}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ShoppingCartOutlined />}
              suffix="台"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="库存利用率"
              value={((stats.outStock / stats.totalItems) * 100).toFixed(1)}
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 今日统计和趋势 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="今日入库">
            <Statistic
              value={stats.todayStockIn}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="台"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                本月累计: {stats.monthlyStockIn} 台
              </Text>
            </div>
            <Progress
              percent={stats.stockInGrowth}
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
              style={{ marginTop: 8 }}
            />
            <Text type="success" style={{ fontSize: 12 }}>
              较昨日 +{stats.stockInGrowth}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="今日出库">
            <Statistic
              value={stats.todayStockOut}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="台"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                本月累计: {stats.monthlyStockOut} 台
              </Text>
            </div>
            <Progress
              percent={Math.abs(stats.stockOutGrowth)}
              showInfo={false}
              strokeColor="#ff4d4f"
              size="small"
              style={{ marginTop: 8 }}
            />
            <Text type="danger" style={{ fontSize: 12 }}>
              较昨日 {stats.stockOutGrowth}%
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="库存状态">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>在库率</Text>
                <Progress
                  percent={(stats.inStock / stats.totalItems) * 100}
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
              <div>
                <Text>出库率</Text>
                <Progress
                  percent={(stats.outStock / stats.totalItems) * 100}
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最近活动和低库存警告 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card 
            title="最近活动" 
            extra={<Button type="link">查看全部</Button>}
          >
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getActivityIcon(item.type)}
                        style={{ 
                          backgroundColor: getActivityColor(item.status),
                          borderColor: getActivityColor(item.status)
                        }}
                      />
                    }
                    title={item.description}
                    description={
                      <Space>
                        <Text type="secondary">{item.user}</Text>
                        <Text type="secondary">·</Text>
                        <Text type="secondary">{item.time}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <AlertOutlined style={{ color: '#fa8c16' }} />
                低库存警告
              </Space>
            }
            extra={<Button type="link">查看全部</Button>}
          >
            <Table
              dataSource={lowStockItems}
              columns={lowStockColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;