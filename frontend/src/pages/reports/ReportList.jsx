import React from 'react'
import { Card, Typography } from 'antd'

export default function ReportList() {
    return (
        <div style={{ padding: 12 }}>
            <Card title={<Typography.Title level={4} style={{ margin: 0 }}>Báo cáo đã nộp</Typography.Title>}>
                <div>Danh sách báo cáo đã nộp.</div>
            </Card>
        </div>
    )
}
