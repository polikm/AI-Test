import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Login from './pages/Login'
import StudentLayout from './layouts/StudentLayout'
import TeacherLayout from './layouts/TeacherLayout'
import AdminLayout from './layouts/AdminLayout'
import StudentHome from './pages/student/Home'
import StudentExam from './pages/student/Exam'
import StudentReport from './pages/student/Report'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherStudents from './pages/teacher/Students'
import TeacherReports from './pages/teacher/Reports'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminQuestions from './pages/admin/Questions'
import AdminConfigs from './pages/admin/Configs'
import AdminTemplates from './pages/admin/Templates'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/home" />} />
            <Route path="home" element={<StudentHome />} />
            <Route path="exam" element={<StudentExam />} />
            <Route path="report/:recordId" element={<StudentReport />} />
          </Route>
          
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="/teacher/dashboard" />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="reports" element={<TeacherReports />} />
          </Route>
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="configs" element={<AdminConfigs />} />
            <Route path="templates" element={<AdminTemplates />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
