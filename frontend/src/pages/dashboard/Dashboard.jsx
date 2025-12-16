import React, { useEffect, useState } from 'react'
import './dashboard.css'
import { Row, Col, Card, Statistic } from 'antd'
import { FileOutlined, HourglassOutlined, CheckCircleOutlined, ScheduleOutlined } from '@ant-design/icons'

export default function Dashboard(props) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            setLoading(true)
            try {
                const headers = { 'Content-Type': 'application/json' }
                if (props && props.user && props.user.email) headers['x-user-email'] = props.user.email
                const res = await fetch('/dashboard', { credentials: 'include', headers })
                if (!res.ok) throw new Error(await res.text())
                const json = await res.json()
                if (mounted) setData(json)
            } catch (err) {
                console.error('[dashboard] fetch error', err)
                if (mounted) setError(err.message || 'Không thể tải dữ liệu dashboard')
            } finally { if (mounted) setLoading(false) }
        }
        fetchData()
        return () => { mounted = false }
    }, [])

    if (loading) return <div className="dash-loading">Loading dashboard…</div>
    if (error) return <div className="dash-error">{error}</div>

    const counts = data.myHoSoCounts || {}
    const recent = data.recentHoSo || []
    const pending = data.myPendingApprovals || []
    const activities = data.recentActivities || []

    return (
        <div className="dashboard-root">
            <section className="dash-cards">
                <Row gutter={16} style={{ width: '100%' }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" loading={loading}>
                            <Statistic
                                title="Tổng hồ sơ"
                                value={data.total || Object.values(counts).reduce((s, v) => s + (Number(v) || 0), 0)}
                                prefix={<FileOutlined style={{ color: '#0f3c7a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" loading={loading}>
                            <Statistic
                                title="Đang xử lý"
                                value={counts.DANG_XU_LY || 0}
                                prefix={<HourglassOutlined style={{ color: '#faad14' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" loading={loading}>
                            <Statistic
                                title="Đã duyệt"
                                value={counts.HOAN_THANH || 0}
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card" loading={loading}>
                            <Statistic
                                title="Chờ báo cáo"
                                value={counts.CHO_BAO_CAO || counts.CHO_DUYET || 0}
                                prefix={<ScheduleOutlined style={{ color: '#1890ff' }} />}
                            />
                        </Card>
                    </Col>
                </Row>
            </section>

            <section className="dash-grid">
                <div className="left">
                    <div className="panel">
                        <div className="panel-head">Hồ sơ của tôi</div>
                        <div className="panel-body">
                            <table className="tbl">
                                <thead><tr><th>Mã</th><th>Loại</th><th>Trạng thái</th><th>Bước</th></tr></thead>
                                <tbody>
                                    {recent.length === 0 && <tr><td colSpan="4">Chưa có hồ sơ</td></tr>}
                                    {recent.map(r => (
                                        <tr key={r.id_ho_so}><td>{r.ma_ho_so}</td><td>{r.loai_hinh_chuyen_di}</td><td>{r.trang_thai_chung}</td><td>{r.id_buoc_hien_tai || '-'}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-head">Việc chờ xử lý</div>
                        <div className="panel-body">
                            {pending.length === 0 && <div className="empty">Không có tác vụ đang chờ</div>}
                            <ul className="pending-list">
                                {pending.map(p => (
                                    <li key={p.id_ho_so} className="pending-item">
                                        <div className="p-title">{p.ma_ho_so || p.id_ho_so}</div>
                                        <div className="p-meta">Loại: {p.loai_hinh_chuyen_di} • Bước: {p.id_buoc_hien_tai}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="right">
                    <div className="panel">
                        <div className="panel-head">Hoạt động gần đây</div>
                        <div className="panel-body">
                            <ul className="activity-list">
                                {activities.length === 0 && <li className="empty">Chưa có hoạt động</li>}
                                {activities.map(a => (
                                    <li key={a.id_tien_do} className="activity-item">
                                        <div className="act-desc">{a.ket_qua_xu_ly} • Hồ sơ: {a.id_ho_so}</div>
                                        <div className="act-meta">{new Date(a.thoi_gian_xu_ly).toLocaleString()}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="panel quick-actions">
                        <div className="panel-head">Tác vụ nhanh</div>
                        <div className="panel-body">
                            <button className="btn primary">Tạo hồ sơ mới</button>
                            <button className="btn">Quản lý tài liệu</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
