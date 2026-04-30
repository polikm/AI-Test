import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd'
import { TeamOutlined, FileTextOutlined, TrophyOutlined, RiseOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { teacherAPI, courseAPI } from '../../services/api'

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ total_students: 0, total_exams: 0, average_score: 0 })
  const [examData, setExamData] = useState({ records: [], stats: {} })
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [overviewRes, coursesRes] = await Promise.all([
        teacherAPI.getExamOverview({}),
        courseAPI.list({ status: 'active' })
      ])
      setExamData(overviewRes)
      setCourses(coursesRes)
      setStats({
        total_students: overviewRes.stats?.total || 0,
        total_exams: overviewRes.stats?.total || 0,
        average_score: overviewRes.stats?.average_score || 0
      })
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level) => {
    const colors = { A: 'green', B: 'blue', C: 'orange', D: 'red' }
    return colors[level] || 'default'
  }

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '学校', dataIndex: 'school', key: 'school' },
    { title: '年级', dataIndex: 'student_grade', key: 'student_grade', render: (v) => `${v}年级` },
    { title: '课程', dataIndex: 'course_name', key: 'course_name' },
    { title: '得分', dataIndex: 'score', key: 'score', render: (v) => v || '-' },
    {
      title: '等级',
      dataIndex: 'ability_level',
      key: 'ability_level',
      render: (v) => v ? <Tag color={getLevelColor(v)}>{v}级</Tag> : '-'
    }
  ]

  const getPieOption = () => ({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: examData.stats?.distribution?.A || 0, name: 'A级', itemStyle: { color: '#52c41a' } },
        { value: examData.stats?.distribution?.B || 0, name: 'B级', itemStyle: { color: '#1890ff' } },
        { value: examData.stats?.distribution?.C || 0, name: 'C级', itemStyle: { color: '#faad14' } },
        { value: examData.stats?.distribution?.D || 0, name: 'D级', itemStyle: { color: '#f5222d' } }
      ]
    }]
  })

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="测评学生数"
              value={stats.total_students}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="完成测评数"
              value={stats.total_exams}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均得分"
              value={stats.average_score}
              suffix="分"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="测评记录">
            <Table
              columns={columns}
              dataSource={examData.records}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="等级分布">
            <ReactECharts option={getPieOption()} style={{ height: 250 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="等级说明">
            <Row gutter={[16, 16]}>
              {[
                { level: 'A', color: '#52c41a', text: '90-100分', desc: '优秀，推荐培优班' },
                { level: 'B', color: '#1890ff', text: '75-89分', desc: '良好，推荐基础班' },
                { level: 'C', color: '#faad14', text: '60-74分', desc: '一般，推荐预备班' },
                { level: 'D', color: '#f5222d', text: '0-59分', desc: '待提升，建议先修基础' }
              ].map(item => (
                <Col span={12} key={item.level}>
                  <Card size="small">
                    <Tag color={item.color} style={{ marginRight: 8 }}>{item.level}级</Tag>
                    <span style={{ color: '#666' }}>{item.text}</span>
                    <p style={{ marginTop: 8, fontSize: 12, color: '#999' }}>{item.desc}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="可用课程">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {courses.map(course => (
                <Tag key={course.id} color={course.category === 'aigc' ? 'purple' : 'cyan'}>
                  {course.name}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
