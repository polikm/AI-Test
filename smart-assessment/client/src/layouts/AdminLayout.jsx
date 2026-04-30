import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from 'antd'
import { DashboardOutlined, TeamOutlined, FileTextOutlined, SettingOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/admin/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/admin/questions', icon: <FileTextOutlined />, label: '题库管理' },
  { key: '/admin/configs', icon: <SettingOutlined />, label: '测评配置' },
  { key: '/admin/templates', icon: <BellOutlined />, label: '通知模板' }
]

const breadcrumbNameMap = {
  '/admin/dashboard': '仪表盘',
  '/admin/users': '用户管理',
  '/admin/questions': '题库管理',
  '/admin/configs': '测评配置',
  '/admin/templates': '通知模板'
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const pathSnippets = location.pathname.split('/').filter(i => i)
  const breadcrumbItems = [
    { title: <a onClick={() => navigate('/admin/dashboard')}>管理端</a> },
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
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#52c41a' }}>
          系统管理
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20 }}>
          <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          <Dropdown menu={{ items: userMenuItems }} onClick={handleUserMenuClick} placement="bottomRight">
            <Avatar style={{ backgroundColor: '#52c41a', cursor: 'pointer' }}>{user.name?.charAt(0) || 'A'}</Avatar>
          </Dropdown>
          <span style={{ fontSize: 14 }}>{user.name || '管理员'}</span>
        </Header>
        <Content style={{ padding: 24, background: '#f0f2f5', minHeight: 280 }}>
          <Breadcrumb style={{ marginBottom: 16 }} items={breadcrumbItems} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
