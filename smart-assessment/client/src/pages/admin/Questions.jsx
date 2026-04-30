import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Input, Select, Modal, Form, message, Space, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, RobotOutlined } from '@ant-design/icons'
import { questionAPI, courseAPI } from '../../services/api'

const { Option } = Select

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editQuestion, setEditQuestion] = useState(null)
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [filters, setFilters] = useState({ course_id: null, grade: null, type: null, status: null })
  const [aiLoading, setAiLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadQuestions()
    loadCourses()
  }, [pagination.page, filters])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await questionAPI.list({ ...filters, page: pagination.page, pageSize: pagination.pageSize })
      setQuestions(res.list)
      setPagination({ ...pagination, total: res.pagination.total })
    } catch (error) {
      message.error('加载题库失败')
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await courseAPI.list({ status: 'active' })
      setCourses(res)
    } catch (error) {
      console.error('Load courses error:', error)
    }
  }

  const handleEdit = (record) => {
    setEditQuestion(record)
    form.setFieldsValue({
      ...record,
      options: record.options?.map((o, i) => ({ key: o.key, value: o.value })) || []
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditQuestion(null)
    form.resetFields()
    form.setFieldsValue({ course_id: 1, grade: 1, type: 'single', difficulty: 3, options: [{ key: 'A', value: '' }] })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const options = values.options?.filter(o => o.key && o.value) || []
      
      const data = {
        ...values,
        options,
        dimensions: values.dimensions || ['basic']
      }

      if (editQuestion) {
        await questionAPI.update(editQuestion.id, data)
        message.success('更新成功')
      } else {
        await questionAPI.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadQuestions()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await questionAPI.delete(id)
      message.success('删除成功')
      loadQuestions()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleAiGenerate = async () => {
    setAiLoading(true)
    try {
      const res = await questionAPI.aiGenerate({
        course_id: filters.course_id || 1,
        grade: filters.grade || 1,
        type: filters.type || 'single',
        count: 3
      })
      message.info(res.message)
      res.questions.forEach(q => {
        questionAPI.create(q)
      })
      setTimeout(() => loadQuestions(), 500)
    } catch (error) {
      message.error('AI生成失败')
    } finally {
      setAiLoading(false)
    }
  }

  const getDifficultyColor = (d) => {
    const colors = { 1: 'green', 2: 'cyan', 3: 'blue', 4: 'orange', 5: 'red' }
    return colors[d] || 'default'
  }

  const getStatusColor = (s) => {
    const colors = { pending: 'orange', approved: 'green', rejected: 'red' }
    return colors[s] || 'default'
  }

  const getTypeName = (t) => {
    const names = { single: '单选题', multiple: '多选题', judge: '判断题', blank: '填空题', code: '编程题' }
    return names[t] || t
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '课程', dataIndex: 'course_name', key: 'course_name', render: (v) => <Tag>{v}</Tag> },
    { title: '年级', dataIndex: 'grade', key: 'grade', render: (v) => `${v}年级` },
    { title: '题型', dataIndex: 'type', key: 'type', render: (v) => <Tag>{getTypeName(v)}</Tag> },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', render: (v) => <Tag color={getDifficultyColor(v)}>{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => <Tag color={getStatusColor(v)}>{v === 'approved' ? '已审核' : v === 'pending' ? '待审核' : '已拒绝'}</Tag> },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '操作', key: 'action', width: 150, render: (_, record) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ]

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space wrap>
            <Select style={{ width: 150 }} placeholder="选择课程" allowClear onChange={(v) => setFilters({ ...filters, course_id: v })}>
              {courses.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
            <Select style={{ width: 100 }} placeholder="年级" allowClear onChange={(v) => setFilters({ ...filters, grade: v })}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => <Option key={g} value={g}>{g}年级</Option>)}
            </Select>
            <Select style={{ width: 120 }} placeholder="题型" allowClear onChange={(v) => setFilters({ ...filters, type: v })}>
              <Option value="single">单选题</Option>
              <Option value="multiple">多选题</Option>
              <Option value="judge">判断题</Option>
              <Option value="blank">填空题</Option>
            </Select>
            <Button icon={<RobotOutlined />} onClick={handleAiGenerate} loading={aiLoading}>AI出题</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加题目</Button>
        </div>

        <Table columns={columns} dataSource={questions} rowKey="id" loading={loading} pagination={{ ...pagination, onChange: (p) => setPagination({ ...pagination, page: p }) }} />
      </Card>

      <Modal title={editQuestion ? '编辑题目' : '添加题目'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={700}>
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }} split>
            <Form.Item name="course_id" label="课程" rules={[{ required: true }]}>
              <Select style={{ width: 200 }}>
                {courses.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="grade" label="年级" rules={[{ required: true }]}>
              <Select style={{ width: 100 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => <Option key={g} value={g}>{g}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="type" label="题型" rules={[{ required: true }]}>
              <Select style={{ width: 120 }}>
                <Option value="single">单选题</Option>
                <Option value="multiple">多选题</Option>
                <Option value="judge">判断题</Option>
                <Option value="blank">填空题</Option>
              </Select>
            </Form.Item>
            <Form.Item name="difficulty" label="难度" initialValue={3}>
              <Select style={{ width: 80 }}>
                {[1, 2, 3, 4, 5].map(d => <Option key={d} value={d}>{d}</Option>)}
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="content" label="题目内容" rules={[{ required: true, message: '请输入题目内容' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="options" label="选项">
            <Input.Group compact>
              {['A', 'B', 'C', 'D'].map((key, i) => (
                <Form.Item key={key} name={['options', i, 'key']} style={{ marginBottom: 8 }}>
                  <Input placeholder={key} style={{ width: 50 }} addonBefore={key} />
                </Form.Item>
              ))}
            </Input.Group>
            <Input.Group compact>
              {[0, 1, 2, 3].map(i => (
                <Form.Item key={`value-${i}`} name={['options', i, 'value']} style={{ marginBottom: 8 }}>
                  <Input placeholder="选项内容" />
                </Form.Item>
              ))}
            </Input.Group>
          </Form.Item>
          <Form.Item name="answer" label="正确答案" rules={[{ required: true }]}>
            <Input style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="analysis" label="解析">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
