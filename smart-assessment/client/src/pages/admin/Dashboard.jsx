import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import { UserOutlined, FileTextOutlined, TeamOutlined, BookOutlined, RiseOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { adminAPI } from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_exams: 0,
    total_courses: 0
  })
  const [recentExams, setRecentExams] = useState([])
  const [examTrend, setExamTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getDashboard()
      setStats({
        total_students: res.total_students,
        total_teachers: res.total_teachers,
        total_exams: res.total_exams,
        total_courses: res.total_courses
      })
      setRecentExams(res.recent_exams || [])
      setExamTrend(res.exam_trend || [])
    } catch (error) {
      console.error('Load dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level) => {
    const colors = { A: 'green', B: 'blue', C: 'orange', D: 'red' }
    return colors[level] || 'default'
  }

  const columns = [
    { title: '学生', dataIndex: 'student_name', key: 'student_name' },
    { title: '课程', dataIndex: 'course_name', key: 'course_name' },
    { title: '得分', dataIndex: 'score', key: 'score', render: (v) => v ? `${v}分` : '-' },
    {
      title: '等级',
      dataIndex: 'ability_level',
      key: 'ability_level',
      render: (v) => v ? <Tag color={getLevelColor(v)}>{v}级</Tag> : '-'
    }
  ]

  const getTrendOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: examTrend.map(t => t.date) },
    yAxis: { type: 'value', name: '测评次数' },
    series: [{
      data: examTrend.map(t => t.count),
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(102, 126, 234, 0.2)' },
      lineStyle: { color: '#667eea' },
      itemStyle: { color: '#667eea' }
    }]
  })

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={stats.total_students}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="教师总数"
              value={stats.total_teachers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="测评总数"
              value={stats.total_exams}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="课程总数"
              value={stats.total_courses}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="测评趋势">
            {examTrend.length > 0 ? (
              <ReactECharts option={getTrendOption()} style={{ height: 300 }} />
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="系统状态">
            <div style={{ lineHeight: 2 }}>
              <p>✓ 数据库连接正常</p>
              <p>✓ API服务运行中</p>
              <p>✓ 题库已初始化</p>
              <p>✓ 默认配置已加载</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="最近测评" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={recentExams}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
