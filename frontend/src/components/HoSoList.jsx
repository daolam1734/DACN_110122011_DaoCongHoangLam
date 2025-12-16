import React, { useEffect, useState } from 'react'

export default function HoSoList({ onView }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')

    useEffect(() => { fetchList() }, [])

    async function fetchList(params = {}) {
        setLoading(true); setError(null)
        try {
            const qs = new URLSearchParams()
            if (params.trangThaiChung) qs.set('trangThaiChung', params.trangThaiChung)
            // use relative path so dev proxy or production host handles the base URL
            const url = '/ho-so' + (qs.toString() ? `?${qs.toString()}` : '')
            const res = await fetch(url, { credentials: 'include' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const json = await res.json()
            setData(json)
        } catch (err) {
            console.error('[HoSoList] fetch error', err)
            setError('Không thể tải danh sách hồ sơ')
        } finally { setLoading(false) }
    }

    const uniqueStatuses = Array.from(new Set(data.map(d => d.trang_thai_chung).filter(Boolean)))
    const uniqueTypes = Array.from(new Set(data.map(d => d.loai_hinh_chuyen_di).filter(Boolean)))

    const applyFilters = () => {
        fetchList({ trangThaiChung: statusFilter || undefined })
    }

    return (
        <div>
            <div className="page-header">
                <h1>Danh sách hồ sơ đi nước ngoài</h1>
                <div className="page-actions">
                    <div className="d-flex" style={{ gap: 8 }}>
                        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="">-- Lọc trạng thái --</option>
                            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="">-- Lọc loại hình --</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button className="btn btn-primary" onClick={applyFilters}>Áp dụng</button>
                        <button className="btn" onClick={() => { setStatusFilter(''); setTypeFilter(''); fetchList() }}>Xóa</button>
                    </div>
                </div>
            </div>

            <div className="card">
                {loading && <div className="p-3">Đang tải...</div>}
                {error && <div className="p-3 text-danger">{error}</div>}
                {!loading && !error && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mã hồ sơ</th>
                                    <th>Họ tên</th>
                                    <th>Đơn vị</th>
                                    <th>Loại hình</th>
                                    <th>Trạng thái</th>
                                    <th>Bước xử lý</th>
                                    <th>Ngày tạo</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length ? data.map((r, i) => (
                                    <tr key={r.id_ho_so || i}>
                                        <td>{i + 1}</td>
                                        <td>{r.ma_ho_so || '-'}</td>
                                        <td>{r.ho_va_ten || '-'}</td>
                                        <td>{r.don_vi || '-'}</td>
                                        <td>{r.loai_hinh_chuyen_di || '-'}</td>
                                        <td><span className="badge info">{r.trang_thai_chung || '-'}</span></td>
                                        <td>{r.buoc_hien_tai || r.id_buoc_hien_tai || '-'}</td>
                                        <td>{r.thoi_gian_tao ? new Date(r.thoi_gian_tao).toLocaleString() : '-'}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => onView ? onView(r) : alert('Xem: ' + (r.ma_ho_so || r.id_ho_so))}>
                                                <i className="bi bi-eye" aria-hidden></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={9}>Không có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
