import React from 'react'
import { Layout, Menu, Avatar, Button, Space, Grid, Typography } from 'antd'
import { hasPermission } from '../utils/permissions'
import { DashboardOutlined, FileTextOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import './mainLayout.css'

const { Header, Sider, Content, Footer } = Layout
const { useBreakpoint } = Grid

export default function MainLayout({ user, children, onMenuSelect }) {
    const screens = useBreakpoint()

    // determine admin status from common user fields
    const isAdmin = !!(user && (
        user.role === 'ADMIN' ||
        user.isAdmin ||
        user.is_admin ||
        (Array.isArray(user.roles) && user.roles.some(r => (r || '').toString().toLowerCase() === 'admin')) ||
        (typeof user.chuc_vu === 'string' && user.chuc_vu.toLowerCase().includes('admin')) ||
        (typeof user.chuc_danh === 'string' && user.chuc_danh.toLowerCase().includes('admin'))
    ))

    const hasPerm = (perm) => hasPermission(user, perm)

    // build structured menu (few items, admin config at bottom)
    const menuItems = [
        {
            key: 'hoso-group',
            label: 'Hồ sơ đi nước ngoài',
            children: [
                { key: 'hoso:create', label: 'Tạo hồ sơ' },
                { key: 'hoso:mine', label: 'Hồ sơ của tôi' },
                // only show 'Hồ sơ cần xử lý' when user has processing permission
                ...(hasPerm('DUYET_HO_SO') ? [{ key: 'hoso:todo', label: 'Hồ sơ cần xử lý' }] : [])
            ]
        },
        {
            key: 'baocao-group',
            label: 'Báo cáo & kết quả',
            children: [
                { key: 'bao-cao:submit', label: 'Nộp báo cáo' },
                { key: 'bao-cao:my', label: 'Báo cáo đã nộp' }
            ]
        },
        {
            key: 'ns-group',
            label: 'Tổ chức & nhân sự',
            children: [
                { key: 'org:units', label: 'Đơn vị – khoa – phòng' },
                { key: 'org:positions', label: 'Chức vụ – kiêm nhiệm' },
                { key: 'org:party', label: 'Hồ sơ Đảng viên' }
            ]
        }
    ]

    // admin-only configuration block (placed last)
    if (isAdmin || hasPerm('CAU_HINH_LUONG')) {
        menuItems.push({
            key: 'config-group',
            label: 'Cấu hình hệ thống',
            children: [
                { key: 'config:luong', label: 'Luồng duyệt hồ sơ' },
                { key: 'config:giayto', label: 'Danh mục giấy tờ' },
                { key: 'config:roles', label: 'Phân quyền vai trò' },
                { key: 'config:audit', label: 'Nhật ký thay đổi' }
            ]
        })
    }

    return (
        <Layout className="app-layout">
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                style={{ background: '#0f3c7a' }}
            >
                <div className="logo">
                    <div className="logo-mark">TVU</div>
                    <div className="logo-text">Quản lý hồ sơ</div>
                </div>

                <div className="sidebar-profile">
                    <div className="profile-top">
                        <Avatar src={user?.avatar} size={48} />
                        <div className="profile-info">
                            <div className="profile-name">{user?.ho_ten || user?.name || 'Khách'}</div>
                            <div className="profile-email">{user?.email || ''}</div>
                            {user?.chuc_vu && <div className="profile-role">{user.chuc_vu}</div>}
                        </div>
                    </div>
                    <div className="profile-actions">
                        <Button type="link" onClick={() => onMenuSelect && onMenuSelect('profile:info')} style={{ color: '#fff', padding: 0 }}>Thông tin cá nhân</Button>
                    </div>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['hoso:create']}
                    items={menuItems.map(g => ({ key: g.key, label: g.label, children: g.children }))}
                    onClick={(e) => onMenuSelect && onMenuSelect(e.key)}
                />

                <div style={{ position: 'absolute', bottom: 12, width: '100%', padding: '0 12px' }}>
                    <Button type="link" style={{ color: '#fff', padding: 0 }} onClick={() => onMenuSelect && onMenuSelect('profile:logout')}>Đăng xuất</Button>
                </div>
            </Sider>

            <Layout>
                <Header className="app-header">
                    <div className="header-left">
                        <Typography.Title level={4} className="app-title">Cổng quản lý hồ sơ</Typography.Title>
                    </div>
                    <div className="header-right">
                        <Space size="middle">
                            <div className="user-info">
                                <span className="user-name">{user?.ho_ten || user?.name || 'Khách'}</span>
                            </div>
                            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                            <Button type="link" icon={<LogoutOutlined />}>Đăng xuất</Button>
                        </Space>
                    </div>
                </Header>

                <Content className="app-content">
                    {children}
                </Content>

                <Footer className="app-footer">© {new Date().getFullYear()} - Trung tâm CNTT - TVU</Footer>
            </Layout>
        </Layout>
    )
}
