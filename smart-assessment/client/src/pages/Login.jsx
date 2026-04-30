import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Tabs, Radio, DatePicker } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'
import { authAPI } from '../services/api'
import dayjs from 'dayjs'

const { TabPane } = Tabs

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('account')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [form] = Form.useForm()
  const [registerForm] = Form.useForm()

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const res = await authAPI.login(values)
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      
      message.success('登录成功')
      
      const role = res.user.role
      if (role === 'admin') {
        window.location.href = '/admin/dashboard'
      } else if (role === 'teacher') {
        window.location.href = '/teacher/dashboard'
      } else {
        window.location.href = '/student/home'
      }
    } catch (error) {
      message.error(error.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setRegisterLoading(true)
    try {
      const res = await authAPI.register(values)
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      message.success('注册成功')
      window.location.href = '/student/home'
    } catch (error) {
      message.error(error.error || '注册失败')
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">智能测评系统</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
          素质教育入学测评平台
        </p>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="账号登录" key="account">
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
            
            <div style={{ textAlign: 'center', marginTop: 16, color: '#999', fontSize: 12 }}>
              <p>测试账号：admin / admin123</p>
            </div>
          </TabPane>
          
          <TabPane tab="快速注册" key="register">
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
              
              <Form.Item
                name="phone"
                rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="手机号" />
              </Form.Item>
              
              <Form.Item
                name="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="姓名" />
              </Form.Item>
              
              <Form.Item
                name="role"
                initialValue="student"
                hidden
              >
                <Input />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={registerLoading}>
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </div>
  )
}
