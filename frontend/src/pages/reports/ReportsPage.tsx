// 报表管理页面
import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Space,
  Statistic,
  Progress,
  Tag,
  Tabs,
  Form,
  Input,
  Radio,
  Divider,
  Alert
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CalendarOutlined,
  FilterOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// 报表数据接口
interface ReportData {
  period: string;
  stock_in_count: number;
  stock_out_count: number;
  return_count: number;
  total_value: number;
}

interface ProductReport {
  product_name: string;
  product_model: string;
  stock_in_count: number;
  stock_out_count: number;
  current_stock: number;
  turnover_rate: number;
}

interface SupplierReport {
  supplier_name: string;
  product_count: number;
  total_value: number;
  quality_score: number;
  delivery_time: number;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [reportType, setReportType] = useState('daily');

  // 模拟总览统计数据
  const overviewStats = {
    totalProducts: 1250,
    totalValue: 2850000,
    monthlyInbound: 456,
    monthlyOutbound: 389,
    turnoverRate: 75.6,
    inventoryAccuracy: 98.2
  };

  // 模拟趋势数据
  const trendData: ReportData[] = [
    { period: '2024-09-01', stock_in_count: 45, stock_out_count: 32, return_count: 2, total_value: 125000 },
    { period: '2024-09-02', stock_in_count: 38, stock_out_count: 41, return_count: 1, total_value: 110000 },
    { period: '2024-09-03', stock_in_count: 52, stock_out_count: 35, return_count: 3, total_value: 145000 },
    { period: '2024-09-04', stock_in_count: 41, stock_out_count: 39, return_count: 2, total_value: 132000 },
    { period: '2024-09-05', stock_in_count: 49, stock_out_count: 44, return_count: 1, total_value: 138000 },
    { period: '2024-09-06', stock_in_count: 35, stock_out_count: 28, return_count: 4, total_value: 98000 },
    { period: '2024-09-07', stock_in_count: 43, stock_out_count: 37, return_count: 2, total_value: 126000 }
  ];

  // 模拟产品报表数据
  const productReportData: ProductReport[] = [
    {
      product_name: 'LTE-M通信模组',
      product_model: 'LTE-M-001',
      stock_in_count: 156,
      stock_out_count: 134,
      current_stock: 22,
      turnover_rate: 85.9
    },
    {
      product_name: 'NB-IoT通信模组',
      product_model: 'NB-IoT-002',
      stock_in_count: 98,
      stock_out_count: 89,
      current_stock: 9,
      turnover_rate: 90.8
    },
    {
      product_name: '5G通信模组',
      product_model: '5G-003',
      stock_in_count: 67,
      stock_out_count: 45,
      current_stock: 22,
      turnover_rate: 67.2
    },
    {
      product_name: 'WiFi模组',
      product_model: 'WiFi-004',
      stock_in_count: 125,
      stock_out_count: 98,
      current_stock: 27,
      turnover_rate: 78.4
    }
  ];

  // 模拟供应商报表数据
  const supplierReportData: SupplierReport[] = [
    {
      supplier_name: '华为技术有限公司',
      product_count: 234,
      total_value: 1250000,
      quality_score: 96.5,
      delivery_time: 3.2
    },
    {
      supplier_name: '中兴通讯股份有限公司',
      product_count: 189,
      total_value: 980000,
      quality_score: 94.8,
      delivery_time: 4.1
    },
    {
      supplier_name: '紫光展锐科技有限公司',
      product_count: 156,
      total_value: 825000,
      quality_score: 92.3,
      delivery_time: 3.8
    }
  ];

  // 趋势报表表格列
  const trendColumns: ColumnsType<ReportData> = [
    {
      title: '日期',
      dataIndex: 'period',
      key: 'period',
      width: 120
    },
    {
      title: '入库数量',
      dataIndex: 'stock_in_count',
      key: 'stock_in_count',
      width: 100,
      render: (value) => <Tag color="green">{value}</Tag>
    },
    {
      title: '出库数量',
      dataIndex: 'stock_out_count',
      key: 'stock_out_count',
      width: 100,
      render: (value) => <Tag color="blue">{value}</Tag>
    },
    {
      title: '退库数量',
      dataIndex: 'return_count',
      key: 'return_count',
      width: 100,
      render: (value) => <Tag color="orange">{value}</Tag>
    },
    {
      title: '货值金额(元)',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 150,
      render: (value) => `¥${value.toLocaleString()}`
    },
    {
      title: '净增长',
      key: 'net_growth',
      width: 100,
      render: (_, record) => {
        const net = record.stock_in_count - record.stock_out_count;
        return (
          <Tag color={net > 0 ? 'green' : net < 0 ? 'red' : 'default'}>
            {net > 0 ? '+' : ''}{net}
          </Tag>
        );
      }
    }
  ];

  // 产品报表表格列
  const productColumns: ColumnsType<ProductReport> = [
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150
    },
    {
      title: '产品型号',
      dataIndex: 'product_model',
      key: 'product_model',
      width: 120,
      render: (text) => <code>{text}</code>
    },
    {
      title: '累计入库',
      dataIndex: 'stock_in_count',
      key: 'stock_in_count',
      width: 100,
      render: (value) => <Tag color="green">{value}</Tag>
    },
    {
      title: '累计出库',
      dataIndex: 'stock_out_count',
      key: 'stock_out_count',
      width: 100,
      render: (value) => <Tag color="blue">{value}</Tag>
    },
    {
      title: '当前库存',
      dataIndex: 'current_stock',
      key: 'current_stock',
      width: 100,
      render: (value) => (
        <Tag color={value < 10 ? 'red' : value < 20 ? 'orange' : 'green'}>
          {value}
        </Tag>
      )
    },
    {
      title: '周转率',
      dataIndex: 'turnover_rate',
      key: 'turnover_rate',
      width: 120,
      render: (value) => (
        <div>
          <Progress 
            percent={value} 
            size="small" 
            strokeColor={value > 80 ? '#52c41a' : value > 60 ? '#faad14' : '#ff4d4f'}
          />
          <span style={{ fontSize: '12px' }}>{value}%</span>
        </div>
      )
    }
  ];

  // 供应商报表表格列
  const supplierColumns: ColumnsType<SupplierReport> = [
    {
      title: '供应商名称',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      width: 200
    },
    {
      title: '供货数量',
      dataIndex: 'product_count',
      key: 'product_count',
      width: 100,
      render: (value) => <Tag color="blue">{value}</Tag>
    },
    {
      title: '供货金额',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 150,
      render: (value) => `¥${value.toLocaleString()}`
    },
    {
      title: '质量评分',
      dataIndex: 'quality_score',
      key: 'quality_score',
      width: 120,
      render: (value) => (
        <div>
          <Progress 
            percent={value} 
            size="small" 
            strokeColor={value > 95 ? '#52c41a' : value > 90 ? '#faad14' : '#ff4d4f'}
          />
          <span style={{ fontSize: '12px' }}>{value}分</span>
        </div>
      )
    },
    {
      title: '平均交期(天)',
      dataIndex: 'delivery_time',
      key: 'delivery_time',
      width: 120,
      render: (value) => (
        <Tag color={value <= 3 ? 'green' : value <= 5 ? 'orange' : 'red'}>
          {value}天
        </Tag>
      )
    }
  ];

  // 生成报表
  const handleGenerateReport = () => {
    setLoading(true);
    // 模拟生成报表
    setTimeout(() => {
      setLoading(false);
      console.log('生成报表:', { dateRange, reportType });
    }, 1000);
  };

  // 导出报表
  const handleExportReport = (format: 'excel' | 'pdf') => {
    console.log('导出报表:', format);
    // 这里实现导出逻辑
  };

  // 打印报表
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div>
      {/* 报表筛选区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Space>
              <CalendarOutlined />
              <span>日期范围:</span>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="YYYY-MM-DD"
              />
            </Space>
          </Col>
          <Col span={4}>
            <Space>
              <FilterOutlined />
              <span>报表类型:</span>
              <Select value={reportType} onChange={setReportType} style={{ width: 120 }}>
                <Option value="daily">日报表</Option>
                <Option value="weekly">周报表</Option>
                <Option value="monthly">月报表</Option>
                <Option value="yearly">年报表</Option>
              </Select>
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <Button 
                type="primary" 
                icon={<BarChartOutlined />}
                loading={loading}
                onClick={handleGenerateReport}
              >
                生成报表
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={() => handleExportReport('excel')}>
                导出Excel
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={() => handleExportReport('pdf')}>
                导出PDF
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrintReport}>
                打印
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 总览报表 */}
        <TabPane tab="总览统计" key="overview">
          <Row gutter={[16, 16]}>
            {/* 关键指标 */}
            <Col span={24}>
              <Card title="关键绩效指标 (KPI)">
                <Row gutter={16}>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="总产品数量"
                        value={overviewStats.totalProducts}
                        suffix="台"
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="总库存价值"
                        value={overviewStats.totalValue}
                        precision={0}
                        prefix="¥"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="本月入库"
                        value={overviewStats.monthlyInbound}
                        suffix="台"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="本月出库"
                        value={overviewStats.monthlyOutbound}
                        suffix="台"
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="库存周转率"
                        value={overviewStats.turnoverRate}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card>
                      <Statistic
                        title="库存准确率"
                        value={overviewStats.inventoryAccuracy}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#eb2f96' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* 趋势分析 */}
            <Col span={24}>
              <Card title="出入库趋势分析">
                <Alert
                  message="数据说明"
                  description="以下数据展示了最近7天的出入库趋势，可以帮助分析库存流动情况和业务发展趋势。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  columns={trendColumns}
                  dataSource={trendData}
                  rowKey="period"
                  size="small"
                  pagination={false}
                  summary={(pageData) => {
                    const totalIn = pageData.reduce((sum, record) => sum + record.stock_in_count, 0);
                    const totalOut = pageData.reduce((sum, record) => sum + record.stock_out_count, 0);
                    const totalReturn = pageData.reduce((sum, record) => sum + record.return_count, 0);
                    const totalValue = pageData.reduce((sum, record) => sum + record.total_value, 0);

                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}><strong>合计</strong></Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <Tag color="green"><strong>{totalIn}</strong></Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <Tag color="blue"><strong>{totalOut}</strong></Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <Tag color="orange"><strong>{totalReturn}</strong></Tag>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <strong>¥{totalValue.toLocaleString()}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          <Tag color={totalIn - totalOut > 0 ? 'green' : 'red'}>
                            <strong>{totalIn - totalOut > 0 ? '+' : ''}{totalIn - totalOut}</strong>
                          </Tag>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 产品报表 */}
        <TabPane tab="产品分析" key="product">
          <Card title="产品库存分析报表">
            <Alert
              message="产品分析说明"
              description="通过产品维度分析各产品的库存周转情况，红色表示库存不足需要补货，绿色表示库存充足。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={productColumns}
              dataSource={productReportData}
              rowKey="product_model"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* 供应商报表 */}
        <TabPane tab="供应商分析" key="supplier">
          <Card title="供应商绩效分析报表">
            <Alert
              message="供应商评估说明"
              description="从供货数量、质量评分、交期等维度评估供应商表现，绿色表示优秀，橙色表示良好，红色表示需要改进。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={supplierColumns}
              dataSource={supplierReportData}
              rowKey="supplier_name"
              size="small"
              pagination={false}
            />
          </Card>
        </TabPane>

        {/* 库存分析 */}
        <TabPane tab="库存分析" key="inventory">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="库存状态分布">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="在库产品"
                      value={856}
                      suffix="台"
                      valueStyle={{ color: '#52c41a' }}
                    />
                    <Progress percent={68.5} strokeColor="#52c41a" />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="已出库产品"
                      value={394}
                      suffix="台"
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <Progress percent={31.5} strokeColor="#1890ff" />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="库存预警">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Tag color="red">严重不足</Tag>
                    <span>3种产品库存不足10台</span>
                    <Progress percent={12} strokeColor="#ff4d4f" size="small" />
                  </div>
                  <div>
                    <Tag color="orange">库存偏低</Tag>
                    <span>5种产品库存在10-20台之间</span>
                    <Progress percent={20} strokeColor="#faad14" size="small" />
                  </div>
                  <div>
                    <Tag color="green">库存正常</Tag>
                    <span>其余产品库存充足</span>
                    <Progress percent={68} strokeColor="#52c41a" size="small" />
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="库存周转分析">
                <Alert
                  message="周转率计算公式"
                  description="库存周转率 = (出库数量 ÷ 平均库存) × 100%，周转率越高表示库存利用效率越好。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="平均周转率"
                        value={75.6}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="最高周转率"
                        value={90.8}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="最低周转率"
                        value={67.2}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="周转天数"
                        value={4.8}
                        precision={1}
                        suffix="天"
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 异常分析 */}
        <TabPane tab="异常分析" key="exception">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="退库异常分析">
                <Alert
                  message="异常监控"
                  description="监控退库率、质量问题等异常情况，帮助及时发现和解决问题。"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Row gutter={16}>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="本月退库数量"
                        value={23}
                        suffix="台"
                        valueStyle={{ color: '#fa8c16' }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Tag color="orange">较上月 +12%</Tag>
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="退库率"
                        value={2.3}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#fa541c' }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Tag color="red">超出正常范围</Tag>
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <Statistic
                        title="质量问题占比"
                        value={65.2}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#cf1322' }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Tag color="red">需要关注</Tag>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="库存异常监控">
                <Row gutter={16}>
                  <Col span={12}>
                    <h4>滞销产品预警</h4>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>WiFi模组 (WiFi-004)</span>
                        <Tag color="red">45天未出库</Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>蓝牙模组 (BT-005)</span>
                        <Tag color="orange">30天未出库</Tag>
                      </div>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <h4>库存差异提醒</h4>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>系统数量与实际盘点差异</span>
                        <Tag color="orange">3台</Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>上次盘点时间</span>
                        <Tag color="blue">7天前</Tag>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportsPage;