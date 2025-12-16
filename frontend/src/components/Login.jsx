import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, Alert, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

export default function Login({ onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [form] = Form.useForm()

    const onFinish = async (values) => {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: values.email, password: values.password })
            })
            if (res.ok) {
                const data = await res.json().catch(() => ({}))
                let userObj = data.user || data
                // If backend didn't return user payload but set session cookie, fetch current user
                if (!userObj || Object.keys(userObj).length === 0) {
                    try {
                        const meRes = await fetch('/auth/me', { credentials: 'include' })
                        if (meRes.ok) {
                            const me = await meRes.json().catch(() => ({}))
                            userObj = me.user || me || {}
                        }
                    } catch (err) {
                        // ignore
                    }
                }
                // Fetch authoritative user info (roles, profile) from server using cookie/session
                try {
                    const meRes = await fetch('/auth/me', { credentials: 'include' })
                    if (meRes.ok) {
                        const meJson = await meRes.json().catch(() => null)
                        const meUser = meJson && (meJson.user || meJson)
                        if (meUser && Object.keys(meUser).length) userObj = { ...userObj, ...meUser }
                    }
                } catch (e) {
                    // ignore
                }
                if (onSuccess) onSuccess(userObj)
            } else if (res.status === 401) {
                setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.')
            } else {
                const body = await res.json().catch(() => ({}))
                setError(body.message || 'Lỗi hệ thống. Vui lòng thử lại sau.')
            }
        } catch (err) {
            console.error('[auth] login error', err)
            setError('Không thể kết nối tới máy chủ. Kiểm tra đường mạng hoặc thử lại sau.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-panel card" style={{ maxWidth: 420, margin: '48px auto' }}>
                <div className="login-brand" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <div className="logo" aria-hidden style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--primary)' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>Hệ thống quản lý hồ sơ đi nước ngoài</Title>
                        <Text type="secondary">Trường Đại học Trà Vinh</Text>
                    </div>
                </div>

                {error && <Alert type="error" title={error} style={{ marginBottom: 12 }} />}

                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ remember: true }}>
                    <Form.Item name="email" label="Email công vụ" rules={[{ required: true, message: 'Vui lòng nhập email công vụ' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input prefix={<UserOutlined />} placeholder="name@tvu.edu.vn" autoComplete="username" />
                    </Form.Item>

                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" autoComplete="current-password" />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Ghi nhớ phiên đăng nhập</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <div className="login-note" style={{ marginTop: 8, fontSize: 13 }}>
                    Tài khoản do quản trị viên cấp. Nếu gặp vấn đề đăng nhập, liên hệ IT: <a href="mailto:it@tvu.edu.vn">it@tvu.edu.vn</a>
                </div>
            </div>
        </div>
    )
}
