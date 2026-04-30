import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, List, Avatar, Tag, message, Form, Modal, Input, Select, DatePicker, Radio, Button } from 'antd'
import { BookOutlined, FileTextOutlined, TrophyOutlined, BellOutlined, RightOutlined } from '@ant-design/icons'
import { studentAPI, courseAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select

export default function StudentHome() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [examHistory, setExamHistory] = useState([])
  const [notices, setNotices] = useState([])
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [profileForm] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [coursesRes, historyRes, noticesRes, profileRes] = await Promise.all([
        studentAPI.getCourses(),
        studentAPI.getExamHistory(),
        studentAPI.getNotices(),
        studentAPI.getProfile()
      ])
      setCourses(coursesRes)
      setExamHistory(historyRes.slice(0, 5))
      setNotices(noticesRes.slice(0, 5))
      setProfile(profileRes)
      profileForm.setFieldsValue({
        ...profileRes,
        birthday: profileRes.birthday ? dayjs(profileRes.birthday) : null
      })
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (values) => {
    try {
      await studentAPI.updateProfile({
        ...values,
        birthday: values.birthday?.format('YYYY-MM-DD')
      })
      message.success('个人信息更新成功')
      setProfileModalVisible(false)
      loadData()
    } catch (error) {
      message.error('更新失败')
    }
  }

  const getLevelColor = (level) => {
    const colors = { A: 'green', B: 'blue', C: 'orange', D: 'red' }
    return colors[level] || 'default'
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>欢迎回来，{profile.name || '同学'}</h2>
        <p style={{ color: '#666' }}>开始你的学习之旅吧！</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已选课程"
              value={courses.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="完成测评"
              value={examHistory.filter(e => e.status === 'graded').length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="获得A级"
              value={examHistory.filter(e => e.ability_level === 'A').length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="通知书"
              value={notices.filter(n => n.status === 'sent').length}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="测评历史"
            extra={<Button type="link" onClick={() => navigate('/student/exam')}>查看全部</Button>}
          >
            <List
              loading={loading}
              dataSource={examHistory}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => navigate(`/student/report/${item.id}`)}>
                      查看报告
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#667eea' }} icon={<FileTextOutlined />} />}
                    title={item.course_name}
                    description={`测评时间：${dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}`}
                  />
                  <Tag color={getLevelColor(item.ability_level)}>
                    {item.ability_level || '待评估'}级
                  </Tag>
                  <span style={{ marginLeft: 16, color: '#1890ff', fontWeight: 600 }}>
                    {item.score || 0}分
                  </span>
                </List.Item>
              )}
              locale={{ emptyText: '暂无测评记录' }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="我的通知书" style={{ marginBottom: 16 }}>
            <List
              loading={loading}
              dataSource={notices}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.course_name}
                    description={item.template_name}
                  />
                  <Tag color={item.status === 'sent' ? 'green' : 'default'}>
                    {item.status === 'sent' ? '已发送' : item.status}
                  </Tag>
                </List.Item>
              )}
              locale={{ emptyText: '暂无通知书' }}
            />
          </Card>

          <Card title="个人资料">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Avatar size={80} style={{ backgroundColor: '#667eea' }}>
                {profile.name?.charAt(0) || '学'}
              </Avatar>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 18, fontWeight: 600 }}>{profile.name}</p>
              <p style={{ color: '#666', fontSize: 14 }}>{profile.school || '未填写学校'}</p>
            </div>
            <Button block onClick={() => setProfileModalVisible(true)}>
              编辑资料
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal
        title="编辑个人资料"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item name="name" label="姓名">
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Radio.Group>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
              <Radio value="other">其他</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="birthday" label="出生日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="school" label="学校">
            <Input />
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Select>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                <Option key={g} value={g}>{g}年级</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="math_level" label="数学成绩">
            <Select>
              <Option value="excellent">优秀</Option>
              <Option value="good">良好</Option>
              <Option value="average">一般</Option>
              <Option value="poor">较差</Option>
            </Select>
          </Form.Item>
          <Form.Item name="ai_level" label="AI/编程基础">
            <Select>
              <Option value="none">零基础</Option>
              <Option value="beginner">初级</Option>
              <Option value="intermediate">中级</Option>
              <Option value="advanced">高级</Option>
            </Select>
          </Form.Item>
          <Form.Item name="award_level" label="获奖情况">
            <Select>
              <Option value="none">无</Option>
              <Option value="school">校级</Option>
              <Option value="district">区级</Option>
              <Option value="city">市级</Option>
              <Option value="province">省级</Option>
              <Option value="national">国家级</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
