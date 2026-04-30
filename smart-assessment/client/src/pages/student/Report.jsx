import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Button, Statistic, Spin, message, Descriptions, Progress } from 'antd'
import { DownloadOutlined, TrophyOutlined, BookOutlined, BulbOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { reportAPI } from '../../services/api'
import { useParams } from 'react-router-dom'

export default function StudentReport() {
  const { recordId } = useParams()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)

  useEffect(() => {
    loadReport()
  }, [recordId])

  const loadReport = async () => {
    setLoading(true)
    try {
      const res = await reportAPI.getPersonal(recordId)
      setReportData(res)
    } catch (error) {
      message.error('加载报告失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await reportAPI.exportPDF(recordId)
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `测评报告_${recordId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('报告导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  const getRadarOption = () => {
    if (!reportData?.dimension_scores) return null

    const dimNames = {
      basic: '基础认知',
      logic: '逻辑思维',
      creative: '创意应用',
      comprehensive: '综合素养'
    }

    const indicators = Object.entries(reportData.dimension_scores).map(([key, val]) => {
      const percentage = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
      return { name: dimNames[key] || key, value: percentage }
    })

    return {
      radar: {
        indicator: indicators.length > 0 ? indicators : [
          { name: '基础认知', value: 0 },
          { name: '逻辑思维', value: 0 },
          { name: '创意应用', value: 0 },
          { name: '综合素养', value: 0 }
        ]
      },
      series: [{
        type: 'radar',
        data: [{
          value: indicators.length > 0 ? indicators.map(i => i.value) : [0, 0, 0, 0],
          name: '能力分布',
          areaStyle: { color: 'rgba(102, 126, 234, 0.3)' },
          lineStyle: { color: '#667eea' },
          itemStyle: { color: '#667eea' }
        }]
      }]
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#52c41a'
    if (score >= 75) return '#1890ff'
    if (score >= 60) return '#faad14'
    return '#f5222d'
  }

  const getLevelInfo = (level) => {
    const info = {
      A: { color: '#52c41a', text: '优秀', class: '培优班' },
      B: { color: '#1890ff', text: '良好', class: '基础班' },
      C: { color: '#faad14', text: '一般', class: '预备班' },
      D: { color: '#f5222d', text: '待提升', class: '基础班' }
    }
    return info[level] || info.D
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>正在加载报告...</p>
      </div>
    )
  }

  if (!reportData) {
    return <Card>报告数据不存在</Card>
  }

  const levelInfo = getLevelInfo(reportData.exam_info?.ability_level)

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div className="report-header">
          <Row gutter={24} align="middle">
            <Col span={12}>
              <h2 style={{ fontSize: 28, marginBottom: 8 }}>智能测评报告</h2>
              <p style={{ opacity: 0.9 }}>{reportData.personal_info?.name} 同学的测评结果</p>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <div
                className="score-circle"
                style={{ background: levelInfo.color, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 140, height: 140, borderRadius: '50%' }}
              >
                <span style={{ fontSize: 48, fontWeight: 'bold' }}>{reportData.exam_info?.score || 0}</span>
                <span style={{ fontSize: 16 }}>总分100</span>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="基本信息" style={{ marginBottom: 16 }}>
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="姓名">{reportData.personal_info?.name}</Descriptions.Item>
              <Descriptions.Item label="性别">{reportData.personal_info?.gender}</Descriptions.Item>
              <Descriptions.Item label="学校">{reportData.personal_info?.school || '未填写'}</Descriptions.Item>
              <Descriptions.Item label="年级">{reportData.personal_info?.grade}年级</Descriptions.Item>
              <Descriptions.Item label="测评课程">{reportData.exam_info?.course_name}</Descriptions.Item>
              <Descriptions.Item label="能力等级">
                <Tag color={levelInfo.color} style={{ fontSize: 16, padding: '4px 12px' }}>
                  {levelInfo.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="能力雷达图" style={{ marginBottom: 16 }}>
            <ReactECharts option={getRadarOption()} style={{ height: 300 }} />
          </Card>

          <Card title="各维度详细分析">
            <Row gutter={[16, 16]}>
              {reportData.dimension_scores && Object.entries(reportData.dimension_scores).map(([key, val]) => {
                const dimNames = {
                  basic: '基础认知',
                  logic: '逻辑思维',
                  creative: '创意应用',
                  comprehensive: '综合素养'
                }
                const percentage = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
                return (
                  <Col xs={24} sm={12} key={key}>
                    <Card size="small">
                      <p style={{ fontWeight: 600, marginBottom: 8 }}>{dimNames[key] || key}</p>
                      <Progress
                        percent={percentage}
                        strokeColor={getScoreColor(percentage)}
                        format={(p) => `${p}%`}
                      />
                      <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                        正确率：{val.correct}/{val.total}题
                      </p>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <TrophyOutlined style={{ fontSize: 48, color: levelInfo.color }} />
              <h3 style={{ marginTop: 16, color: levelInfo.color }}>能力等级：{levelInfo.text}</h3>
              <p style={{ color: '#666', marginTop: 8 }}>{reportData.ability_description || ''}</p>
            </div>
          </Card>

          <Card
            title={
              <span>
                <BookOutlined style={{ marginRight: 8 }} />
                学习建议
              </span>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ padding: '16px 0' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="推荐班级">
                  <Tag color="blue">{reportData.suggestions?.class || '基础班'}</Tag>
                </Descriptions.Item>
              </Descriptions>
              <p style={{ marginTop: 16, lineHeight: 1.8 }}>
                {reportData.suggestions?.suggestion || '建议按部就班学习，打好基础。'}
              </p>
            </div>
          </Card>

          <Card
            title={
              <span>
                <BulbOutlined style={{ marginRight: 8 }} />
                个性化建议
              </span>
            }
          >
            <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>建议每周保持3-4小时的学习时间</li>
              <li>多做实践练习，加深理解</li>
              <li>遇到问题及时请教老师</li>
              <li>建立错题本，总结归纳</li>
            </ul>
          </Card>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            block
            size="large"
            style={{ marginTop: 16 }}
            onClick={handleExport}
          >
            下载PDF报告
          </Button>
        </Col>
      </Row>
    </div>
  )
}
