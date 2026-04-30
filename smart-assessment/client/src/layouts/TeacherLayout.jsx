import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from 'antd'
import { HomeOutlined, TeamOutlined, FileTextOutlined, BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/teacher/dashboard', icon: <HomeOutlined />, label: '工作台' },
  { key: '/teacher/students', icon: <TeamOutlined />, label: '学生管理' },
  { key: '/teacher/reports', icon: <FileTextOutlined />, label: '测评报告' }
]

const breadcrumbNameMap = {
  '/teacher/dashboard': '工作台',
  '/teacher/students': '学生管理',
  '/teacher/reports': '测评报告'
}

export default function TeacherLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const pathSnippets = location.pathname.split('/').filter(i => i)
  const breadcrumbItems = [
    { title: <a onClick={() => navigate('/teacher/dashboard')}>教师端</a> },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
      return { title: breadcrumbNameMap[url] || url }
    })
  ]

  const userMenuItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }
  ]

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={220}>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#1890ff' }}>
          教师工作台
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20 }}>
          <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          <Dropdown menu={{ items: userMenuItems }} onClick={handleUserMenuClick} placement="bottomRight">
            <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>{user.name?.charAt(0) || 'T'}</Avatar>
          </Dropdown>
          <span style={{ fontSize: 14 }}>{user.name || '教师'}</span>
        </Header>
        <Content style={{ padding: 24, background: '#f0f2f5', minHeight: 280 }}>
          <Breadcrumb style={{ marginBottom: 16 }} items={breadcrumbItems} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
