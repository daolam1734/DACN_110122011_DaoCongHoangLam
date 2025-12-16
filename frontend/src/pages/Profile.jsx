import React from 'react'
import { Card, Typography, Button } from 'antd'

export default function Profile({ user, onLogout }) {
    return (
        <div style={{ padding: 12 }}>
            <Card title={<Typography.Title level={4} style={{ margin: 0 }}>Thông tin cá nhân</Typography.Title>}>
                <div style={{ marginBottom: 12 }}>
                    <div><b>Họ tên:</b> {user?.ho_ten || user?.name || '—'}</div>
                    <div><b>Email:</b> {user?.email || '—'}</div>
                    <div><b>Chức vụ:</b> {user?.chuc_vu || '—'}</div>
                </div>
                <Button danger onClick={onLogout}>Đăng xuất</Button>
            </Card>
        </div>
    )
}
