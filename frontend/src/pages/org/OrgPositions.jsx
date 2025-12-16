import React from 'react'
import { Card, Typography } from 'antd'

export default function OrgPositions() {
    return (
        <div style={{ padding: 12 }}>
            <Card title={<Typography.Title level={4} style={{ margin: 0 }}>Chức vụ – kiêm nhiệm</Typography.Title>}>
                <div>Danh sách chức vụ và thông tin kiêm nhiệm.</div>
            </Card>
        </div>
    )
}
