import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Table, Tag, Button, Modal, Select, message, Space, Statistic, Progress } from 'antd'
import { SendOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { teacherAPI, noticeAPI, courseAPI, reportAPI } from '../../services/api'
import { useSearchParams } from 'react-router-dom'

const { Option } = Select

export default function TeacherReports() {
  const [searchParams] = useSearchParams()
  const [examData, setExamData] = useState({ records: [], stats: {} })
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [noticeModalVisible, setNoticeModalVisible] = useState(false)
  const [templates, setTemplates] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    loadCourses()
    const studentId = searchParams.get('studentId')
    if (studentId) {
      loadStudentReports(studentId)
    }
  }, [searchParams])

  const loadCourses = async () => {
    try {
      const res = await teacherAPI.getCourses()
      setCourses(res)
    } catch (error) {
      console.error('Load courses error:', error)
    }
  }

  const loadStudentReports = async (studentId) => {
    setLoading(true)
    try {
      const res = await teacherAPI.getStudentReports(studentId)
      setExamData({ records: res, stats: {} })
    } catch (error) {
      message.error('加载报告失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId)
    setLoading(true)
    try {
      const res = await reportAPI.getClassReport(courseId)
      setExamData(res)
    } catch (error) {
      message.error('加载报表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotice = async () => {
    if (!selectedStudents.length || !selectedTemplate) {
      message.warning('请选择学生和通知模板')
      return
    }

    try {
      const res = await noticeAPI.sendAdmission({
        student_ids: selectedStudents.map(s => s.student_id),
        template_id: selectedTemplate,
        course_id: selectedCourse
      })
      message.success(res.message)
      setNoticeModalVisible(false)
      setSelectedStudents([])
    } catch (error) {
      message.error('发送失败')
    }
  }

  const getLevelColor = (level) => {
    const colors = { A: 'green', B: 'blue', C: 'orange', D: 'red' }
    return colors[level] || 'default'
  }

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '学校', dataIndex: 'school', key: 'school', render: (v) => v || '-' },
    { title: '年级', dataIndex: 'student_grade', key: 'student_grade', render: (v) => v ? `${v}年级` : '-' },
    { title: '得分', dataIndex: 'score', key: 'score', render: (v) => v ? `${v}分` : '-' },
    {
      title: '等级',
      dataIndex: 'ability_level',
      key: 'ability_level',
      render: (v) => v ? <Tag color={getLevelColor(v)}>{v}级</Tag> : '-'
    }
  ]

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedStudents(selectedRows)
    }
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span>选择课程：</span>
            <Select
              style={{ width: 200, marginLeft: 8 }}
              placeholder="请选择课程"
              onChange={handleCourseChange}
              value={selectedCourse}
            >
              {courses.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SendOutlined />}
              disabled={!selectedStudents.length}
              onClick={() => setNoticeModalVisible(true)}
            >
              发送录取通知 ({selectedStudents.length})
            </Button>
          </Col>
        </Row>
      </Card>

      {examData.stats?.total_students > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="总人数" value={examData.stats.total_students} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="平均分" value={examData.stats.avg_score} suffix="分" />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic title="及格率" value={examData.stats.pass_rate} suffix="%" />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <p style={{ marginBottom: 8 }}>等级分布</p>
              <Space>
                {Object.entries(examData.stats.distribution || {}).map(([level, count]) => (
                  <Tag key={level} color={getLevelColor(level)}>{level}: {count}</Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <Card title="班级测评报表">
        <Table
          columns={columns}
          dataSource={examData.students || examData.records}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowSelection={rowSelection}
        />
      </Card>

      <Modal
        title="发送录取通知书"
        open={noticeModalVisible}
        onCancel={() => setNoticeModalVisible(false)}
        onOk={handleSendNotice}
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <p>已选择 {selectedStudents.length} 名学生</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>选择通知模板：</label>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择模板"
            onChange={setSelectedTemplate}
          >
            <Option value={1}>默认录取通知书</Option>
            <Option value={2}>测评结果通知</Option>
          </Select>
        </div>
        <p style={{ color: '#999', fontSize: 12 }}>
          通知书将发送至学生账号，请提醒学生查收。
        </p>
      </Modal>
    </div>
  )
}
