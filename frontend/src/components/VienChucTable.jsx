import React, { useEffect, useState } from 'react'

export default function VienChucTable() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // use relative path so dev proxy or host handles base URL
                const res = await fetch('/vien-chuc', { credentials: 'include' })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const json = await res.json()
                setData(json)
                console.log('[frontend] GET /vien-chuc success, records=', json.length)
            } catch (err) {
                console.error('[frontend] GET /vien-chuc failed:', err.message || err)
                setError(err.message || 'Lỗi')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="card">Đang tải...</div>
    if (error) return <div className="card">Lỗi: {error}</div>

    return (
        <>
            <div className="page-header">
                <h1>Hồ sơ đi nước ngoài</h1>
                <div className="page-actions">
                    <label className="filter">Tìm: <input type="search" placeholder="Tìm theo mã hồ sơ hoặc tên" /></label>
                    <button className="btn primary">Tạo hồ sơ mới</button>
                </div>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Mã hồ sơ</th>
                            <th>Viên chức</th>
                            <th>Loại chuyến đi</th>
                            <th>Quốc gia</th>
                            <th>Ngày đi</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length ? data.map((r, idx) => (
                            <tr key={r.id_vien_chuc || idx}>
                                <td>{r.ma_so_vien_chuc || '-'}</td>
                                <td>{r.ho_va_ten || '-'}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td><span className="badge info">{r.trang_thai_lam_viec || '-'}</span></td>
                                <td className="actions"><button className="btn">Xem</button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7}>Không có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="help">
                <h3>Ghi chú nhanh</h3>
                <ul>
                    <li>Giao diện dành cho cán bộ hành chính; các thao tác chính: lọc, xem chi tiết, duyệt, in báo cáo.</li>
                    <li>Không dùng hiệu ứng động phức tạp; ưu tiên rõ ràng và dễ thao tác.</li>
                </ul>
            </div>
        </>
    )
}
