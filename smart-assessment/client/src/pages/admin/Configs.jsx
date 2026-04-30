import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Input, Select, Modal, Form, message, Space, Tabs, InputNumber, Slider } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { configAPI, courseAPI } from '../../services/api'

const { Option } = Select
const { TabPane } = Tabs

export default function AdminConfigs() {
  const [abilityLevels, setAbilityLevels] = useState([])
  const [courses, setCourses] = useState([])
  const [configs, setConfigs] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [editLevel, setEditLevel] = useState(null)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [levelsRes, coursesRes, configsRes] = await Promise.all([
        configAPI.getAbilityLevels(),
        courseAPI.list({ status: 'active' }),
        configAPI.getAll()
      ])
      setAbilityLevels(levelsRes)
      setCourses(coursesRes)
      
      const configMap = {}
      configsRes.forEach(c => {
        configMap[c.key_name] = c.value
      })
      setConfigs(configMap)
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record) => {
    setEditLevel(record)
    form.setFieldsValue({
      ...record,
      suggestions: record.suggestions?.suggestion || ''
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditLevel(null)
    form.resetFields()
    form.setFieldsValue({ course_id: 1, grade: 0, level: 'A', min_score: 0, max_score: 100 })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        suggestions: { suggestion: values.suggestions, class: values.class }
      }

      if (editLevel) {
        await configAPI.updateAbilityLevel(editLevel.id, data)
        message.success('更新成功')
      } else {
        await configAPI.createAbilityLevel(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleUpdateConfig = async (key, value) => {
    try {
      await configAPI.update(key, { value })
      message.success('配置更新成功')
      loadData()
    } catch (error) {
      message.error('更新失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '课程', dataIndex: 'course_name', key: 'course_name', render: (v) => <Tag>{v}</Tag> },
    { title: '等级', dataIndex: 'level', key: 'level', render: (v) => <Tag color={v === 'A' ? 'green' : v === 'B' ? 'blue' : v === 'C' ? 'orange' : 'red'}>{v}</Tag> },
    { title: '分数区间', key: 'score_range', render: (_, record) => `${record.min_score} - ${record.max_score}` },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '建议班级', key: 'class', render: (_, record) => record.suggestions?.class || '-' },
    { title: '操作', key: 'action', render: (_, record) => (
      <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
    )}
  ]

  const getLevelColor = (level) => {
    const colors = { A: 'green', B: 'blue', C: 'orange', D: 'red' }
    return colors[level] || 'default'
  }

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="能力等级配置" key="1">
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ color: '#666' }}>配置不同课程的能力等级评估标准和对应建议班级</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加等级配置</Button>
            </div>
            <Table columns={columns} dataSource={abilityLevels} rowKey="id" loading={loading} />
          </Card>
        </TabPane>

        <TabPane tab="测评配置" key="2">
          <Card title="题目数量配置">
            <Form layout="vertical" initialValues={configs.default_questions_count || { min: 15, max: 30, default: 15 }}>
              <Space size="large">
                <Form.Item label="最少题目数" name="min">
                  <InputNumber min={5} max={50} onChange={(v) => handleUpdateConfig('default_questions_count', { ...configs.default_questions_count, min: v })} />
                </Form.Item>
                <Form.Item label="最多题目数" name="max">
                  <InputNumber min={10} max={100} onChange={(v) => handleUpdateConfig('default_questions_count', { ...configs.default_questions_count, max: v })} />
                </Form.Item>
                <Form.Item label="默认题目数" name="default">
                  <InputNumber min={5} max={100} onChange={(v) => handleUpdateConfig('default_questions_count', { ...configs.default_questions_count, default: v })} />
                </Form.Item>
              </Space>
            </Form>
          </Card>

          <Card title="考核维度配置" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                { key: 'basic', name: '基础认知', desc: '基本概念、术语理解' },
                { key: 'logic', name: '逻辑思维', desc: '问题分析、推理判断' },
                { key: 'creative', name: '创意应用', desc: '创新想法、实践能力' },
                { key: 'comprehensive', name: '综合素养', desc: '跨学科、知识迁移' }
              ].map(dim => (
                <Card key={dim.key} size="small" style={{ width: 200 }}>
                  <Tag color="blue">{dim.name}</Tag>
                  <p style={{ marginTop: 8, color: '#666', fontSize: 12 }}>{dim.desc}</p>
                </Card>
              ))}
            </div>
          </Card>
        </TabPane>

        <TabPane tab="等级说明" key="3">
          <Card>
            <Table
              dataSource={[
                { level: 'A', range: '90-100', desc: '优秀', class: '培优班', suggestion: '建议直接进入培优班学习' },
                { level: 'B', range: '75-89', desc: '良好', class: '基础班', suggestion: '建议进入基础班学习' },
                { level: 'C', range: '60-74', desc: '一般', class: '预备班', suggestion: '建议进入预备班打牢基础' },
                { level: 'D', range: '0-59', desc: '待提升', class: '基础班', suggestion: '建议先学习基础知识' }
              ]}
              columns={[
                { title: '等级', dataIndex: 'level', key: 'level', render: (v) => <Tag color={getLevelColor(v)}>{v}级</Tag> },
                { title: '分数区间', dataIndex: 'range', key: 'range' },
                { title: '描述', dataIndex: 'desc', key: 'desc' },
                { title: '推荐班级', dataIndex: 'class', key: 'class' },
                { title: '建议', dataIndex: 'suggestion', key: 'suggestion' }
              ]}
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editLevel ? '编辑等级配置' : '添加等级配置'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }} split>
            <Form.Item name="course_id" label="课程" rules={[{ required: true }]}>
              <Select style={{ width: 180 }}>
                {courses.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="grade" label="年级（0表示通用）">
              <Select style={{ width: 100 }}>
                <Option value={0}>通用</Option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => <Option key={g} value={g}>{g}</Option>)}
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="level" label="等级" rules={[{ required: true }]}>
            <Select style={{ width: 100 }}>
              {['A', 'B', 'C', 'D'].map(l => <Option key={l} value={l}>{l}级</Option>)}
            </Select>
          </Form.Item>
          <Space split>
            <Form.Item name="min_score" label="最低分" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
            <Form.Item name="max_score" label="最高分" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="等级描述">
            <Input />
          </Form.Item>
          <Form.Item name="class" label="推荐班级">
            <Input placeholder="如：培优班、基础班" />
          </Form.Item>
          <Form.Item name="suggestions" label="学习建议">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
