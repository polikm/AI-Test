import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  loginByCode: (data) => api.post('/auth/login-by-code', data),
  register: (data) => api.post('/auth/register', data),
  sendCode: (phone) => api.post('/auth/send-code', { phone })
}

export const courseAPI = {
  list: (params) => api.get('/courses', { params }),
  get: (id) => api.get(`/courses/${id}`)
}

export const questionAPI = {
  list: (params) => api.get('/questions', { params }),
  get: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
  review: (id, data) => api.post(`/questions/review/${id}`, data),
  aiGenerate: (data) => api.post('/questions/ai-generate', data),
  batchImport: (questions) => api.post('/questions/batch', { questions })
}

export const examAPI = {
  generatePaper: (data) => api.post('/exams/generate-paper', data),
  start: (data) => api.post('/exams/start', data),
  submit: (id, answers) => api.put(`/exams/${id}/submit`, { answers }),
  getRecords: (studentId) => api.get(`/exams/records/${studentId}`),
  getPaper: (id) => api.get(`/exams/paper/${id}`),
  getClassReport: (classId) => api.get(`/exams/class-report/${classId}`)
}

export const reportAPI = {
  getPersonal: (recordId) => api.get(`/reports/personal/${recordId}`),
  exportPDF: (recordId) => api.get(`/reports/export/${recordId}`, { responseType: 'blob' }),
  getClassReport: (courseId, params) => api.get(`/reports/class/${courseId}`, { params })
}

export const noticeAPI = {
  getTemplates: (params) => api.get('/notices/templates', { params }),
  getTemplate: (id) => api.get(`/notices/templates/${id}`),
  createTemplate: (data) => api.post('/notices/templates', data),
  updateTemplate: (id, data) => api.put(`/notices/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/notices/templates/${id}`),
  sendAdmission: (data) => api.post('/notices/send-admission', data),
  getNotices: (params) => api.get('/notices/notices', { params }),
  responseNotice: (id, response) => api.put(`/notices/notices/${id}/response`, { response })
}

export const configAPI = {
  getAll: () => api.get('/configs'),
  get: (key) => api.get(`/configs/${key}`),
  update: (key, data) => api.put(`/configs/${key}`, data),
  getAbilityLevels: (courseId) => api.get(`/configs/ability-levels/${courseId}`),
  createAbilityLevel: (data) => api.post('/configs/ability-levels', data),
  updateAbilityLevel: (id, data) => api.put(`/configs/ability-levels/${id}`, data)
}

export const userAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  batchImport: (users) => api.post('/users/batch-import', { users })
}

export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getCourses: () => api.get('/student/courses'),
  getExamHistory: () => api.get('/student/exam-history'),
  getNotices: () => api.get('/student/notices'),
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id) => api.put(`/student/notifications/${id}/read`)
}

export const teacherAPI = {
  getStudents: (params) => api.get('/teacher/students', { params }),
  getStudent: (id) => api.get(`/teacher/students/${id}`),
  getExamOverview: (params) => api.get('/teacher/exam-overview', { params }),
  getClasses: () => api.get('/teacher/classes'),
  getStudentReports: (studentId, params) => api.get(`/teacher/reports/student/${studentId}`, { params }),
  batchImportStudents: (students) => api.post('/teacher/students/batch-import', { students }),
  getCourses: () => api.get('/teacher/courses')
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getQuestionStats: (params) => api.get('/admin/questions/stats', { params }),
  getExamAnalysis: (params) => api.get('/admin/exam-analysis', { params }),
  getAbilityLevels: (params) => api.get('/admin/ability-levels', { params }),
  createAbilityLevel: (data) => api.post('/admin/ability-levels', data),
  updateAbilityLevel: (id, data) => api.put(`/admin/ability-levels/${id}`, data),
  deleteAbilityLevel: (id) => api.delete(`/admin/ability-levels/${id}`)
}

export default api
