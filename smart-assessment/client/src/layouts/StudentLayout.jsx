import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd'
import { HomeOutlined, FileTextOutlined, BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'

const { Header, Sider, Content } = Layout

export default function StudentLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const menuItems = [
    { key: '/student/home', icon: <HomeOutlined />, label: '首页' },
    { key: '/student/exam', icon: <FileTextOutlined />, label: '测评中心' }
  ]

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人资料' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }
  ]

  const handleMenuClick = (e) => {
    navigate(e.key)
  }

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={220}>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#667eea' }}>
          智能测评系统
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={handleMenuClick} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20 }}>
          <Badge count={0}>
            <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          </Badge>
          <Dropdown menu={{ items: userMenuItems }} onClick={handleUserMenuClick} placement="bottomRight">
            <Avatar style={{ backgroundColor: '#667eea', cursor: 'pointer' }} icon={<UserOutlined />} />
          </Dropdown>
          <span style={{ fontSize: 14 }}>{user.name || user.username}</span>
        </Header>
        <Content style={{ padding: 24, background: '#f0f2f5', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
