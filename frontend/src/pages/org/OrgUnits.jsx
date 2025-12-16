import React from 'react'
import { Card, Typography } from 'antd'

export default function OrgUnits() {
    return (
        <div style={{ padding: 12 }}>
            <Card title={<Typography.Title level={4} style={{ margin: 0 }}>Đơn vị – khoa – phòng</Typography.Title>}>
                <div>Thông tin đơn vị và sơ đồ tổ chức (read-only cho hầu hết người dùng).</div>
            </Card>
        </div>
    )
}
