import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Input, Select, Modal, message, Space } from 'antd'
import { UserAddOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { teacherAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

const { Option } = Select

export default function TeacherStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [importData, setImportData] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const res = await teacherAPI.getStudents({})
      setStudents(res)
    } catch (error) {
      message.error('加载学生列表失败')
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
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '学校', dataIndex: 'school', key: 'school', render: (v) => v || '-' },
    { title: '年级', dataIndex: 'grade', key: 'grade', render: (v) => v ? `${v}年级` : '-' },
    { title: '课程', dataIndex: 'course_name', key: 'course_name', render: (v) => v || '-' },
    {
      title: '测评成绩',
      key: 'score',
      render: (_, record) => record.score !== null ? (
        <span style={{ color: '#1890ff', fontWeight: 600 }}>{record.score}分</span>
      ) : '-'
    },
    {
      title: '能力等级',
      dataIndex: 'ability_level',
      key: 'ability_level',
      render: (v) => v ? <Tag color={getLevelColor(v)}>{v}级</Tag> : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/teacher/reports?studentId=${record.id}`)}>
            查看报告
          </Button>
        </Space>
      )
    }
  ]

  const handleImport = async () => {
    try {
      const lines = importData.trim().split('\n')
      const students = lines.map(line => {
        const [name, phone, school, grade] = line.split(',').map(s => s.trim())
        return { name, phone, school, grade: parseInt(grade) || 1 }
      }).filter(s => s.name)

      const res = await teacherAPI.batchImportStudents(students)
      message.success(res.message)
      setImportModalVisible(false)
      setImportData('')
      loadStudents()
    } catch (error) {
      message.error('导入失败')
    }
  }

  const filteredStudents = students.filter(s => 
    !searchKeyword || 
    s.name?.includes(searchKeyword) || 
    s.username?.includes(searchKeyword) ||
    s.phone?.includes(searchKeyword)
  )

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input
            placeholder="搜索学生姓名/用户名/手机号"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setImportModalVisible(true)}>
            批量导入
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="批量导入学生"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onOk={handleImport}
        width={600}
      >
        <p style={{ marginBottom: 16 }}>
          请按以下格式输入学生信息（每行一个，逗号分隔）：<br />
          <code>姓名, 手机号, 学校, 年级</code>
        </p>
        <Input.TextArea
          rows={10}
          placeholder={`张三, 13800138000, 第一小学, 3
李四, 13800138001, 第二小学, 4`}
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
        />
        <p style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
          默认密码为：123456，请提醒学生登录后修改密码。
        </p>
      </Modal>
    </div>
  )
}
