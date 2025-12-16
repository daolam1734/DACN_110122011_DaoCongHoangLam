import React from 'react'
import { Layout } from 'antd'
import './mainLayout.css'

const { Content } = Layout

export default function AuthLayout({ children }) {
    return (
        <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <Content style={{ width: '100%', maxWidth: 480, padding: 20 }}>
                {children}
            </Content>
        </Layout>
    )
}
