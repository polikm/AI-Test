import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Space, Tabs } from 'antd'
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { noticeAPI } from '../../services/api'

const { Option } = Select
const { TabPane } = Tabs

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([])
  const [notices, setNotices] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [editTemplate, setEditTemplate] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [templatesRes, noticesRes] = await Promise.all([
        noticeAPI.getTemplates({}),
        noticeAPI.getNotices({})
      ])
      setTemplates(templatesRes)
      setNotices(noticesRes)
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditTemplate(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditTemplate(record)
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      title: record.title,
      content: record.content
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editTemplate) {
        await noticeAPI.updateTemplate(editTemplate.id, values)
        message.success('更新成功')
      } else {
        await noticeAPI.createTemplate(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handlePreview = (template) => {
    let content = template.content
    content = content.replace(/\{学生姓名\}/g, '张三')
    content = content.replace(/\{机构名称\}/g, '某某素质教育机构')
    content = content.replace(/\{课程名称\}/g, 'AIGC素养课')
    content = content.replace(/\{能力等级\}/g, 'A级')
    content = content.replace(/\{通知书日期\}/g, new Date().toLocaleDateString('zh-CN'))
    setPreviewContent(content)
    setPreviewVisible(true)
  }

  const getTypeColor = (type) => {
    const colors = { admission: 'green', notice: 'blue', reminder: 'orange', result: 'purple' }
    return colors[type] || 'default'
  }

  const getTypeName = (type) => {
    const names = { admission: '录取通知书', notice: '通知', reminder: '提醒', result: '测评结果' }
    return names[type] || type
  }

  const templateColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '模板名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v) => <Tag color={getTypeColor(v)}>{getTypeName(v)}</Tag> },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '启用' : '禁用'}</Tag> },
    { title: '操作', key: 'action', render: (_, record) => (
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>预览</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
      </Space>
    )}
  ]

  const noticeColumns = [
    { title: '学生', dataIndex: 'student_name', key: 'student_name' },
    { title: '课程', dataIndex: 'course_name', key: 'course_name' },
    { title: '模板', dataIndex: 'template_name', key: 'template_name' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => {
      const colors = { draft: 'default', sent: 'blue', viewed: 'green', accepted: 'cyan', rejected: 'red' }
      const names = { draft: '草稿', sent: '已发送', viewed: '已查看', accepted: '已接受', rejected: '已拒绝' }
      return <Tag color={colors[v]}>{names[v]}</Tag>
    }},
    { title: '发送时间', dataIndex: 'sent_at', key: 'sent_at', render: (v) => v ? new Date(v).toLocaleString('zh-CN') : '-' }
  ]

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="通知模板" key="1">
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ color: '#666' }}>管理和配置各类通知模板，包括录取通知书、测评结果通知等</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加模板</Button>
            </div>
            <Table columns={templateColumns} dataSource={templates} rowKey="id" loading={loading} />
          </Card>
        </TabPane>

        <TabPane tab="发送记录" key="2">
          <Card>
            <p style={{ color: '#666', marginBottom: 16 }}>查看所有通知的发送记录和状态</p>
            <Table columns={noticeColumns} dataSource={notices} rowKey="id" loading={loading} />
          </Card>
        </TabPane>

        <TabPane tab="使用说明" key="3">
          <Card>
            <h3>模板变量说明</h3>
            <div style={{ marginTop: 16, lineHeight: 2 }}>
              <p><code>{"{学生姓名}"}</code> - 学生姓名</p>
              <p><code>{"{机构名称}"}</code> - 机构名称</p>
              <p><code>{"{课程名称}"}</code> - 课程名称</p>
              <p><code>{"{能力等级}"}</code> - 能力等级（A/B/C/D）</p>
              <p><code>{"{分数}"}</code> - 测评分数</p>
              <p><code>{"{推荐班级}"}</code> - 推荐班级</p>
              <p><code>{"{开课时间}"}</code> - 开课时间</p>
              <p><code>{"{上课地点}"}</code> - 上课地点</p>
              <p><code>{"{课程费用}"}</code> - 课程费用</p>
              <p><code>{"{报名截止日期}"}</code> - 报名截止日期</p>
              <p><code>{"{通知书日期}"}</code> - 通知书生成日期</p>
              <p><code>{"{学习建议}"}</code> - 学习建议</p>
              <p><code>{"{报告链接}"}</code> - 报告查看链接</p>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editTemplate ? '编辑模板' : '添加模板'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="如：默认录取通知书" />
          </Form.Item>
          <Space split style={{ width: '100%' }}>
            <Form.Item name="type" label="模板类型" rules={[{ required: true }]}>
              <Select style={{ width: 150 }}>
                <Option value="admission">录取通知书</Option>
                <Option value="notice">通知</Option>
                <Option value="reminder">提醒</Option>
                <Option value="result">测评结果</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="active">
              <Select style={{ width: 100 }}>
                <Option value="active">启用</Option>
                <Option value="inactive">禁用</Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="title" label="模板标题">
            <Input placeholder="通知书标题" />
          </Form.Item>
          <Form.Item name="content" label="模板内容（支持HTML）" rules={[{ required: true, message: '请输入模板内容' }]}>
            <Input.TextArea rows={10} placeholder="支持HTML格式，使用 {变量名} 占位" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="模板预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={600}
      >
        <div dangerouslySetInnerHTML={{ __html: previewContent }} style={{ padding: 20, border: '1px solid #f0f0f0', borderRadius: 8 }} />
      </Modal>
    </div>
  )
}
