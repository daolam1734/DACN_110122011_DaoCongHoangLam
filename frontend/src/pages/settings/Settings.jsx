import React, { useEffect, useState } from 'react'
import { Card, Typography, Tabs, Table, Button, Modal, Form, Input, Space, Popconfirm, message, Switch, Tag, Select, Checkbox } from 'antd'

const { Title, Text } = Typography
const { TabPane } = Tabs

function PlainCard({ title, children }) {
    return (
        <Card size="small" style={{ border: '1px solid #e6e6e6' }} bodyStyle={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Title level={5} style={{ margin: 0 }}>{title}</Title>
            </div>
            {children}
        </Card>
    )
}

export default function Settings({ initialTab } = {}) {
    // Workflow
    const [workflows, setWorkflows] = useState([])
    const [wfLoading, setWfLoading] = useState(false)
    const [wfModal, setWfModal] = useState({ visible: false, record: null })

    // Document types
    const [docs, setDocs] = useState([])
    const [docsLoading, setDocsLoading] = useState(false)
    const [docModal, setDocModal] = useState({ visible: false, record: null })

    // Units / Positions are managed under Tổ chức & nhân sự (sidebar). Removed from system config to align with sidebar.

    // Roles / Permissions (simple mapping)
    const [roles, setRoles] = useState([])
    const [rolesLoading, setRolesLoading] = useState(false)
    const [roleModal, setRoleModal] = useState({ visible: false, record: null })
    const [rolePerms, setRolePerms] = useState([])

    const BUSINESS_PERMS = [
        { key: 'DUYET_HO_SO', label: 'Duyệt hồ sơ' },
        { key: 'CAU_HINH_LUONG', label: 'Cấu hình luồng' },
        { key: 'XEM_BAO_CAO', label: 'Xem báo cáo' },
        { key: 'QUAN_LY_GIAY_TO', label: 'Quản lý danh mục giấy tờ' },
        { key: 'QUAN_LY_DON_VI', label: 'Quản lý đơn vị - chức vụ' }
    ]

    // Audit logs
    const [audit, setAudit] = useState([])
    const [auditLoading, setAuditLoading] = useState(false)

    useEffect(() => {
        loadAll()
    }, [])

    // map incoming initialTab keys from menu (e.g. 'giayto','luong') to tab keys used here
    const tabMap = {
        luong: 'workflow',
        giayto: 'documents',
        roles: 'roles',
        audit: 'audit'
    }
    const [activeTab, setActiveTab] = useState(tabMap[initialTab] || 'workflow')

    async function loadAll() {
        loadWorkflows()
        loadDocs()
        // units/positions are loaded in Org pages; skip here to match sidebar
        loadRoles()
        loadAudit()
    }

    async function loadWorkflows() {
        setWfLoading(true)
        try {
            const res = await fetch('/api/workflows', { credentials: 'include' })
            if (!res.ok) { setWorkflows([]); return }
            const json = await res.json()
            setWorkflows(json || [])
        } catch (e) { setWorkflows([]) }
        finally { setWfLoading(false) }
    }

    // Workflow actions
    async function createWorkflow(values) {
        try {
            const res = await fetch('/api/workflows', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
            if (!res.ok) throw new Error(await res.text())
            message.success('Đã thêm bước')
            setWfModal({ visible: false, record: null })
            loadWorkflows()
        } catch (e) { message.error('Không thể thêm bước: ' + (e.message || e)) }
    }

    async function updateWorkflow(id, values) {
        try {
            const res = await fetch(`/api/workflows/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
            if (!res.ok) throw new Error(await res.text())
            message.success('Cập nhật thành công')
            setWfModal({ visible: false, record: null })
            loadWorkflows()
        } catch (e) { message.error('Không thể cập nhật: ' + (e.message || e)) }
    }

    async function moveStep(id, dir) {
        // dir = 'up' | 'down'
        try {
            // perform optimistic local reorder then persist by sending new thu_tu to backend
            const idx = workflows.findIndex(w => (w.id_luong || w.id) == id)
            if (idx === -1) return
            const targetIdx = dir === 'up' ? idx - 1 : idx + 1
            if (targetIdx < 0 || targetIdx >= workflows.length) return
            const a = workflows[idx]
            const b = workflows[targetIdx]
            // swap thu_tu_duyet (or order)
            const aOrder = a.thu_tu_duyet || a.order || (idx + 1)
            const bOrder = b.thu_tu_duyet || b.order || (targetIdx + 1)
            await updateWorkflow(a.id_luong || a.id, { thu_tu_duyet: bOrder })
            await updateWorkflow(b.id_luong || b.id, { thu_tu_duyet: aOrder })
            loadWorkflows()
        } catch (e) { message.error('Không thể thay đổi thứ tự: ' + (e.message || e)) }
    }

    async function toggleWorkflow(id, enabled) {
        Modal.confirm({
            title: 'Xác nhận',
            content: `Xác nhận ${(enabled) ? 'bật' : 'tắt'} bước?`,
            onOk: async () => {
                try {
                    const res = await fetch(`/api/workflows/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) })
                    if (!res.ok) throw new Error(await res.text())
                    message.success('Cập nhật')
                    loadWorkflows()
                } catch (e) { message.error('Không thể cập nhật: ' + (e.message || e)) }
            }
        })
    }

    async function softDeleteWorkflow(id) {
        try {
            // soft-delete: prefer PATCH marking deleted; backend may implement
            const res = await fetch(`/api/workflows/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deleted: true }) })
            if (!res.ok) throw new Error(await res.text())
            message.success('Đã xóa (ẩn)')
            loadWorkflows()
        } catch (e) { message.error('Không thể xóa: ' + (e.message || e)) }
    }

    async function loadDocs() {
        setDocsLoading(true)
        try {
            const res = await fetch('/api/documents', { credentials: 'include' })
            if (!res.ok) { setDocs([]); return }
            const json = await res.json()
            setDocs(json || [])
        } catch (e) { setDocs([]) }
        finally { setDocsLoading(false) }
    }

    // Org management (units/positions) intentionally omitted from Settings — see Tổ chức & nhân sự pages

    async function loadRoles() {
        setRolesLoading(true)
        try {
            const res = await fetch('/api/roles', { credentials: 'include' })
            if (!res.ok) { setRoles([]); return }
            const json = await res.json()
            setRoles(json || [])
        } catch (e) { setRoles([]) }
        finally { setRolesLoading(false) }
    }

    async function loadAudit() {
        setAuditLoading(true)
        try {
            const res = await fetch('/api/audit?limit=50', { credentials: 'include' })
            if (!res.ok) { setAudit([]); return }
            const json = await res.json()
            setAudit(json || [])
        } catch (e) { setAudit([]) }
        finally { setAuditLoading(false) }
    }

    // Actions: simple create/delete via POST/DELETE to the endpoints above. If endpoints missing, show message
    async function createDoc(values) {
        Modal.confirm({
            title: 'Xác nhận',
            content: 'Xác nhận thêm loại giấy tờ?',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await fetch('/api/documents', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
                    if (!res.ok) throw new Error(await res.text())
                    message.success('Đã thêm loại giấy tờ')
                    setDocModal({ visible: false, record: null })
                    loadDocs()
                } catch (e) { message.error('Không thể thêm loại giấy tờ: ' + (e.message || e)) }
            }
        })
    }

    async function deleteDoc(id) {
        try {
            const res = await fetch(`/api/documents/${id}`, { method: 'DELETE', credentials: 'include' })
            if (!res.ok) throw new Error(await res.text())
            message.success('Xóa thành công')
            loadDocs()
        } catch (e) { message.error('Không thể xóa: ' + (e.message || e)) }
    }

    // minimal table columns for each section
    const docCols = [
        { title: 'Mã', dataIndex: 'ma_loai', key: 'ma_loai' },
        { title: 'Tên', dataIndex: 'ten_giay_to', key: 'ten_giay_to' },
        {
            title: 'Áp dụng cho', key: 'ap_dung', render: (_, r) => {
                const map = { CONG_TAC: 'Công tác', HOC_TAP: 'Học tập', NGHIEN_CUU: 'Nghiên cứu', KHAC: 'Khác' }
                const lh = r.loai_hinh_chuyen_di ? (map[r.loai_hinh_chuyen_di] || r.loai_hinh_chuyen_di) : 'Tất cả'
                return (
                    <div>
                        <div style={{ fontSize: 12 }}>{lh}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{(r.ap_dung_cho_dang_vien || r.ap_dung_cho_dang_vien === true) ? <Tag color="blue">Đảng viên</Tag> : <Tag>Không Đảng viên</Tag>}</div>
                    </div>
                )
            }
        },
        { title: 'Bắt buộc', dataIndex: 'la_bat_buoc', key: 'la_bat_buoc', render: v => v ? <Tag color="green">Có</Tag> : <Tag>Không</Tag> },
        {
            title: 'Hành động', key: 'actions', render: (_, r) => (
                <Space>
                    <Button size="small" onClick={() => setDocModal({ visible: true, record: r })}>Sửa</Button>
                    <Popconfirm title="Xóa?" onConfirm={() => deleteDoc(r.id_cau_hinh)}>
                        <Button size="small" danger> Xóa </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    const auditCols = [
        { title: 'Thời gian', dataIndex: 'thoi_gian', key: 'thoi_gian', render: (v, r) => new Date(v || r.createdAt || r.thoi_gian).toLocaleString() },
        { title: 'Người thực hiện', dataIndex: 'nguoi_thuc_hien', key: 'nguoi_thuc_hien' },
        { title: 'Bảng', dataIndex: 'ten_bang', key: 'ten_bang' },
        { title: 'Hành động', dataIndex: 'hanh_dong', key: 'hanh_dong' },
        { title: 'Chi tiết', dataIndex: 'du_lieu_moi', key: 'du_lieu_moi', render: (d, r) => <Text style={{ fontSize: 12 }}>{JSON.stringify(r.du_lieu_cu || d)}</Text> }
    ]

    return (
        <div style={{ padding: 12 }}>
            <PlainCard title="Cấu hình hệ thống">
                <Text type="secondary">Trang quản trị nghiệp vụ — chỉ dành cho quản trị viên. Giữ giao diện đơn giản, không màu mè, mọi thay đổi đều được ghi nhận.</Text>
            </PlainCard>

            <div style={{ marginTop: 12 }}>
                <Tabs activeKey={activeTab} onChange={k => setActiveTab(k)} type="line">
                    <TabPane tab="Luồng duyệt hồ sơ" key="workflow">
                        <PlainCard title="Luồng duyệt">
                            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Button size="small" type="primary" onClick={() => setWfModal({ visible: true, record: null })}>Thêm luồng mới</Button>
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>Nguyên tắc: không xóa cứng nếu đã dùng; mọi thay đổi được ghi nhận</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {wfLoading && <div>Đang tải...</div>}
                                {!wfLoading && workflows.length === 0 && <div>Chưa có luồng cấu hình</div>}
                                {!wfLoading && workflows.sort((a, b) => (a.thu_tu_duyet || a.order || 0) - (b.thu_tu_duyet || b.order || 0)).map((w, idx) => (
                                    <div key={w.id_luong || w.id || idx} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
                                        <div style={{ width: 48, textAlign: 'center', fontWeight: 700 }}>{w.thu_tu_duyet || w.order || (idx + 1)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{w.ten_buoc || w.name || ('Bước ' + (idx + 1))}</div>
                                            <div style={{ color: '#555', fontSize: 13 }}>{w.vai_tro_duyet || w.role || w.chuc_danh || '—'} • Thời gian: {w.thoi_gian_xu_ly || w.processing_time || '—'}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <Button size="small" onClick={() => setWfModal({ visible: true, record: w })}>Sửa</Button>
                                            <Button size="small" onClick={() => moveStep(w.id_luong || w.id, 'up')} disabled={idx === 0}>↑</Button>
                                            <Button size="small" onClick={() => moveStep(w.id_luong || w.id, 'down')} disabled={idx === workflows.length - 1}>↓</Button>
                                            <Button size="small" onClick={() => {
                                                Modal.confirm({ title: 'Xác nhận', content: `Bạn có chắc muốn ${(w.enabled || w.ap_dung || w.active) ? 'tắt' : 'bật'} bước này?`, onOk: () => toggleWorkflow(w.id_luong || w.id, !(w.enabled || w.ap_dung || w.active)) })
                                            }}>{(w.enabled || w.ap_dung || w.active) ? 'Tắt' : 'Bật'}</Button>
                                            <Popconfirm title="Ẩn bước này? (không xóa cứng)" onConfirm={() => softDeleteWorkflow(w.id_luong || w.id)}>
                                                <Button size="small" danger>Ẩn</Button>
                                            </Popconfirm>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PlainCard>
                    </TabPane>

                    <TabPane tab="Danh mục giấy tờ" key="documents">
                        <PlainCard title="Danh mục giấy tờ">
                            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Button size="small" type="primary" onClick={() => setDocModal({ visible: true, record: null })}>Thêm loại giấy tờ</Button>
                                </div>
                                <div style={{ fontSize: 12, color: '#777' }}>Lưu ý: Chỉ cấu hình yêu cầu — tránh upload file tại đây.</div>
                            </div>
                            <Table size="small" columns={docCols} dataSource={docs} loading={docsLoading} rowKey={r => r.id_cau_hinh || r.ma_loai || JSON.stringify(r)} pagination={false} />
                        </PlainCard>
                    </TabPane>

                    {/* Đơn vị - chức vụ được quản lý trong mục Tổ chức & nhân sự (sidebar) */}

                    <TabPane tab="Phân quyền vai trò" key="roles">
                        <PlainCard title="Vai trò & phân quyền">
                            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Button size="small" type="primary" onClick={() => message.info('Thêm vai trò sẽ được bổ sung')}>Thêm vai trò</Button>
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>Quyền là theo nghiệp vụ, không theo màn hình.</div>
                            </div>
                            <Table size="small" columns={[
                                { title: 'Vai trò', dataIndex: 'name' },
                                { title: 'Mô tả', dataIndex: 'description' },
                                {
                                    title: 'Quyền', key: 'perms', render: (_, r) => (
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {(r.permissions || []).slice(0, 3).map(p => <Tag key={p}>{BUSINESS_PERMS.find(x => x.key === p)?.label || p}</Tag>)}
                                            {(r.permissions || []).length > 3 ? <Tag>+{(r.permissions || []).length - 3}</Tag> : null}
                                        </div>
                                    )
                                },
                                { title: 'Kích hoạt', dataIndex: 'active', render: v => v ? <Tag color="green">ON</Tag> : <Tag>OFF</Tag> },
                                {
                                    title: 'Hành động', key: 'action', render: (_, r) => (
                                        <Space>
                                            <Button size="small" onClick={() => { setRoleModal({ visible: true, record: r }); setRolePerms(r.permissions || []) }}>Sửa quyền</Button>
                                            <Button size="small" onClick={() => message.info('Phân quyền theo nghiệp vụ — xóa vai trò cần kiểm tra tham chiếu')}>Xóa</Button>
                                        </Space>
                                    )
                                }
                            ]} dataSource={roles} loading={rolesLoading} rowKey={r => r.id || r.name} pagination={false} />
                        </PlainCard>
                    </TabPane>

                    <TabPane tab="Nhật ký thay đổi" key="audit">
                        <PlainCard title="Nhật ký thay đổi (Audit)">
                            <Table size="small" columns={auditCols} dataSource={audit} loading={auditLoading} rowKey={r => r.id || JSON.stringify(r)} pagination={{ pageSize: 20 }} />
                        </PlainCard>
                    </TabPane>
                </Tabs>
            </div>

            {/* Modals */}
            <Modal title={docModal.record ? 'Sửa loại giấy tờ' : 'Thêm loại giấy tờ'} open={docModal.visible} onCancel={() => setDocModal({ visible: false, record: null })} footer={null}>
                <Form layout="vertical" onFinish={createDoc} initialValues={docModal.record || { la_bat_buoc: false, ap_dung_cho_dang_vien: false }}>
                    <Form.Item name="ma_loai" label="Mã loại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="ten_giay_to" label="Tên giấy tờ" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="loai_hinh_chuyen_di" label="Áp dụng cho loại chuyến đi">
                        <Select allowClear placeholder="Chọn loại chuyến đi (để trống = mọi loại)">
                            <Select.Option value="CONG_TAC">Công tác</Select.Option>
                            <Select.Option value="HOC_TAP">Học tập</Select.Option>
                            <Select.Option value="NGHIEN_CUU">Nghiên cứu</Select.Option>
                            <Select.Option value="KHAC">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="ap_dung_cho_dang_vien" label="Áp dụng cho Đảng viên" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="la_bat_buoc" label="Bắt buộc" valuePropName="checked"><Switch /></Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={() => setDocModal({ visible: false, record: null })}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Workflow modal */}
            <Modal title={wfModal.record ? 'Sửa bước duyệt' : 'Thêm bước duyệt'} open={wfModal.visible} onCancel={() => setWfModal({ visible: false, record: null })} footer={null}>
                <Form layout="vertical" onFinish={(vals) => { if (wfModal.record) updateWorkflow(wfModal.record.id_luong || wfModal.record.id, vals); else createWorkflow(vals) }} initialValues={wfModal.record || { la_dang_vien: false, thu_tu_duyet: workflows.length + 1 }}>
                    <Form.Item name="ten_buoc" label="Tên bước" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="vai_tro_duyet" label="Vai trò duyệt" rules={[{ required: true }]}><Input placeholder="ví dụ: truong_don_vi" /></Form.Item>
                    <Form.Item name="thu_tu_duyet" label="Thứ tự" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="thoi_gian_xu_ly" label="Thời gian xử lý (ngày)"><Input /></Form.Item>
                    <Form.Item name="la_dang_vien" label="Áp dụng Đảng viên" valuePropName="checked"><Switch /></Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={() => setWfModal({ visible: false, record: null })}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Role permissions modal */}
            <Modal title={roleModal.record ? `Sửa quyền: ${roleModal.record.name}` : 'Sửa quyền'} open={roleModal.visible} onCancel={() => setRoleModal({ visible: false, record: null })} footer={null}>
                <Form layout="vertical" onFinish={(vals) => {
                    Modal.confirm({
                        title: 'Xác nhận',
                        content: 'Xác nhận lưu thay đổi quyền cho vai trò?',
                        onOk: async () => {
                            try {
                                const id = roleModal.record && (roleModal.record.id || roleModal.record.name)
                                if (!id) throw new Error('Vai trò không xác định')
                                const res = await fetch(`/api/roles/${id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissions: rolePerms }) })
                                if (!res.ok) throw new Error(await res.text())
                                message.success('Cập nhật quyền thành công')
                                setRoleModal({ visible: false, record: null })
                                loadRoles()
                            } catch (e) { message.error('Không thể cập nhật quyền: ' + (e.message || e)) }
                        }
                    })
                }}>
                    <Form.Item label="Chọn quyền nghiệp vụ">
                        <Checkbox.Group style={{ width: '100%' }} value={rolePerms} onChange={(vals) => setRolePerms(vals)}>
                            <Space direction="vertical">
                                {BUSINESS_PERMS.map(p => (
                                    <Checkbox key={p.key} value={p.key}>{p.label}</Checkbox>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={() => setRoleModal({ visible: false, record: null })}>Hủy</Button>
                            <Button type="primary" htmlType="submit">Lưu</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    )
}
