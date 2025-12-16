import React from 'react'
import { Card, Typography } from 'antd'

export default function Party() {
    return (
        <div style={{ padding: 12 }}>
            <Card title={<Typography.Title level={4} style={{ margin: 0 }}>Hồ sơ Đảng viên</Typography.Title>}>
                <div>Thông tin Đảng viên (read-only cho đa số người dùng).</div>
            </Card>
        </div>
    )
}
