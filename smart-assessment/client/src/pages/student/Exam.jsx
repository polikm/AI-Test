import React, { useState, useEffect } from 'react'
import { Card, Steps, Button, Radio, Checkbox, Input, Space, Progress, Modal, Result, Select, message } from 'antd'
import { BookOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { courseAPI, examAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Option } = Select

export default function StudentExam() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [examStarted, setExamStarted] = useState(false)
  const [examData, setExamData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [examRecordId, setExamRecordId] = useState(null)
  const [profile, setProfile] = useState({})
  const [profileForm] = useState([])

  useEffect(() => {
    loadCourses()
    loadProfile()
  }, [])

  const loadCourses = async () => {
    try {
      const res = await courseAPI.list({ status: 'active' })
      setCourses(res)
    } catch (error) {
      console.error('Load courses error:', error)
    }
  }

  const loadProfile = async () => {
    try {
      const { studentAPI } = await import('../../services/api')
      const res = await studentAPI.getProfile()
      setProfile(res)
    } catch (error) {
      console.error('Load profile error:', error)
    }
  }

  const handleSelectCourse = (course) => {
    setSelectedCourse(course)
  }

  const handleStartExam = async () => {
    if (!selectedCourse) {
      message.warning('请先选择一个课程')
      return
    }

    setLoading(true)
    try {
      const res = await examAPI.generatePaper({
        course_id: selectedCourse.id,
        grade: profile.grade || 1,
        student_level: profile.ai_level || 'beginner',
        total_questions: 15
      })

      setExamData(res)

      const recordRes = await examAPI.start({
        student_id: JSON.parse(localStorage.getItem('user')).id,
        exam_paper_id: 0,
        course_id: selectedCourse.id
      })

      setExamRecordId(recordRes.record_id)
      setExamStarted(true)
      setStep(1)
      message.success('试卷已生成，开始答题吧！')
    } catch (error) {
      message.error(error.error || '生成试卷失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleNext = () => {
    if (currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    Modal.confirm({
      title: '确认提交',
      content: '提交后将无法修改答案，确定要提交吗？',
      onOk: async () => {
        setSubmitLoading(true)
        try {
          const res = await examAPI.submit(examRecordId, answers)
          message.success('测评完成！')
          setStep(2)
          setTimeout(() => {
            navigate(`/student/report/${examRecordId}`)
          }, 2000)
        } catch (error) {
          message.error('提交失败')
        } finally {
          setSubmitLoading(false)
        }
      }
    })
  }

  const getProgress = () => {
    if (!examData) return 0
    const answered = Object.keys(answers).length
    return Math.round((answered / examData.questions.length) * 100)
  }

  const renderStep0 = () => (
    <div>
      <h2 style={{ marginBottom: 24 }}>选择测评课程</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {courses.map(course => (
          <Card
            key={course.id}
            hoverable
            onClick={() => handleSelectCourse(course)}
            style={{
              borderColor: selectedCourse?.id === course.id ? '#667eea' : '#e8e8e8',
              borderWidth: selectedCourse?.id === course.id ? 2 : 1
            }}
          >
            <Card.Meta
              avatar={<BookOutlined style={{ fontSize: 32, color: '#667eea' }} />}
              title={course.name}
              description={
                <div>
                  <p style={{ color: '#666' }}>{course.description}</p>
                  <p style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    适用年级：{course.grade_range}
                  </p>
                </div>
              }
            />
            {selectedCourse?.id === course.id && (
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <CheckCircleOutlined style={{ color: '#667eea', fontSize: 20 }} />
              </div>
            )}
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          onClick={handleStartExam}
          loading={loading}
          disabled={!selectedCourse}
        >
          开始测评
        </Button>
      </div>
    </div>
  )

  const renderStep1 = () => {
    if (!examData) return null
    const question = examData.questions[currentQuestion]

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3>第 {currentQuestion + 1} / {examData.questions.length} 题</h3>
          <Progress
            percent={getProgress()}
            style={{ width: 200 }}
            status={getProgress() === 100 ? 'success' : 'active'}
          />
        </div>

        <Card className="exam-question">
          <div style={{ marginBottom: 20 }}>
            <span className="question-number">{currentQuestion + 1}</span>
            <span style={{ fontSize: 16 }}>{question.content}</span>
          </div>

          {question.type === 'single' && question.options?.length > 0 && (
            <Radio.Group
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              value={answers[question.id]}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {question.options.map(opt => (
                <Radio key={opt.key} value={opt.key} style={{ fontSize: 16 }}>
                  <span style={{ marginRight: 8 }}>{opt.key}.</span>
                  {opt.value}
                </Radio>
              ))}
            </Radio.Group>
          )}

          {question.type === 'multiple' && question.options?.length > 0 && (
            <Checkbox.Group
              onChange={(values) => handleAnswer(question.id, values.join(''))}
              value={answers[question.id]?.split('') || []}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {question.options.map(opt => (
                <Checkbox key={opt.key} value={opt.key} style={{ fontSize: 16 }}>
                  <span style={{ marginRight: 8 }}>{opt.key}.</span>
                  {opt.value}
                </Checkbox>
              ))}
            </Checkbox.Group>
          )}

          {question.type === 'judge' && (
            <Radio.Group
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              value={answers[question.id]}
            >
              <Space>
                <Radio value="A">正确</Radio>
                <Radio value="B">错误</Radio>
              </Space>
            </Radio.Group>
          )}

          {question.type === 'blank' && (
            <Input
              placeholder="请输入答案"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              style={{ maxWidth: 400 }}
            />
          )}
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Button onClick={handlePrev} disabled={currentQuestion === 0}>
            上一题
          </Button>
          {currentQuestion === examData.questions.length - 1 ? (
            <Button type="primary" onClick={handleSubmit} loading={submitLoading}>
              提交试卷
            </Button>
          ) : (
            <Button type="primary" onClick={handleNext}>
              下一题
            </Button>
          )}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space wrap>
            {examData.questions.map((q, idx) => (
              <Button
                key={q.id}
                type={answers[q.id] ? 'primary' : 'default'}
                shape="circle"
                onClick={() => setCurrentQuestion(idx)}
                style={{
                  backgroundColor: answers[q.id] ? '#667eea' : undefined
                }}
              >
                {idx + 1}
              </Button>
            ))}
          </Space>
        </div>
      </div>
    )
  }

  const renderStep2 = () => (
    <Result
      status="success"
      title="测评已完成！"
      subTitle="正在生成您的测评报告，请稍候..."
      extra={
        <Button type="primary" onClick={() => navigate(`/student/report/${examRecordId}`)}>
          查看报告
        </Button>
      }
    />
  )

  return (
    <div>
      <Card>
        <Steps
          current={step}
          items={[
            { title: '选择课程', icon: <BookOutlined /> },
            { title: '在线答题', icon: <FileTextOutlined /> },
            { title: '完成', icon: <CheckCircleOutlined /> }
          ]}
          style={{ marginBottom: 40 }}
        />

        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </Card>
    </div>
  )
}
