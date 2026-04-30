import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Input, Select, Modal, Form, message, Space } from 'antd'
import { UserAddOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { userAPI } from '../../services/api'

const { Option } = Select

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form] = Form.useForm()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await userAPI.list({})
      setUsers(res.list)
    } catch (error) {
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record) => {
    setEditUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editUser) {
        await userAPI.update(editUser.id, values)
        message.success('更新成功')
      } else {
        await userAPI.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadUsers()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: async () => {
        try {
          await userAPI.delete(id)
          message.success('删除成功')
          loadUsers()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const getRoleColor = (role) => {
    const colors = { admin: 'red', teacher: 'blue', student: 'green' }
    return colors[role] || 'default'
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (v) => <Tag color={getRoleColor(v)}>{v === 'admin' ? '管理员' : v === 'teacher' ? '教师' : '学生'}</Tag> },
    { title: '学校', dataIndex: 'school', key: 'school', render: (v) => v || '-' },
    { title: '年级', dataIndex: 'grade', key: 'grade', render: (v) => v ? `${v}年级` : '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '正常' : '禁用'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ]

  const filteredUsers = users.filter(u => {
    const matchKeyword = !searchKeyword || u.name?.includes(searchKeyword) || u.username?.includes(searchKeyword) || u.phone?.includes(searchKeyword)
    const matchRole = !roleFilter || u.role === roleFilter
    return matchKeyword && matchRole
  })

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="搜索用户"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Select
              style={{ width: 120 }}
              placeholder="筛选角色"
              allowClear
              onChange={setRoleFilter}
            >
              <Option value="admin">管理员</Option>
              <Option value="teacher">教师</Option>
              <Option value="student">学生</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAdd}>
            添加用户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!editUser} />
          </Form.Item>
          {!editUser && (
            <Form.Item name="password" label="密码" rules={[{ required: !editUser, message: '请输入密码' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="name" label="姓名">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="teacher">教师</Option>
              <Option value="student">学生</Option>
            </Select>
          </Form.Item>
          <Form.Item name="school" label="学校">
            <Input />
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Select allowClear>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => (
                <Option key={g} value={g}>{g}年级</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
