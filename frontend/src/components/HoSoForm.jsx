import React, { useState } from 'react'
import { Form, Input, Button, Select, DatePicker, Upload, message, Card, Row, Col, Typography, Space, List } from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker
const { Option } = Select

export default function HoSoForm({ onCreated }) {
    const [form] = Form.useForm()
    const [fileList, setFileList] = useState([])
    const [submitting, setSubmitting] = useState(false)

    const handleUploadChange = ({ fileList: newList }) => setFileList(newList)
    const beforeUpload = (file) => false

    const submit = async () => {
        try {
            const values = await form.validateFields()
            setSubmitting(true)
            const fd = new FormData()
            fd.append('loai_hinh_chuyen_di', values.loai_hinh_chuyen_di)
            fd.append('muc_dich', values.muc_dich)
            fd.append('quoc_gia', values.quoc_gia)
            if (values.thoi_gian && values.thoi_gian.length === 2) {
                fd.append('tu_ngay', values.thoi_gian[0].toISOString())
                fd.append('den_ngay', values.thoi_gian[1].toISOString())
            }
            fileList.forEach((f) => { if (f.originFileObj) fd.append('files', f.originFileObj, f.name) })

            // use relative path so Vite proxy can forward to backend during dev
            const res = await fetch('/ho-so', { method: 'POST', credentials: 'include', body: fd })
            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt || 'Lỗi khi tạo hồ sơ')
            }
            const json = await res.json().catch(() => null)
            message.success('Tạo hồ sơ thành công')
            form.resetFields()
            setFileList([])
            onCreated && onCreated(json)
        } catch (err) {
            console.error(err)
            message.error(err.message || 'Lỗi gửi dữ liệu')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Typography.Title level={4} style={{ margin: 0 }}>Tạo hồ sơ — Viên chức</Typography.Title></div>}>
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="loai_hinh_chuyen_di" label="Loại chuyến đi" rules={[{ required: true, message: 'Chọn loại chuyến đi' }]}>
                                <Select placeholder="Chọn loại chuyến đi">
                                    <Option value="nghi">Nghiên cứu</Option>
                                    <Option value="cong_tac">Công tác</Option>
                                    <Option value="hoctap">Học tập</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="muc_dich" label="Mục đích" rules={[{ required: true, message: 'Nhập mục đích chuyến đi' }]}>
                                <Input placeholder="Mô tả mục đích" />
                            </Form.Item>

                            <Form.Item name="quoc_gia" label="Quốc gia" rules={[{ required: true, message: 'Chọn quốc gia' }]}>
                                <Select showSearch placeholder="Chọn quốc gia">
                                    <Option value="VN">Việt Nam</Option>
                                    <Option value="US">Hoa Kỳ</Option>
                                    <Option value="JP">Nhật Bản</Option>
                                    <Option value="KR">Hàn Quốc</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="thoi_gian" label="Thời gian" rules={[{ required: true, message: 'Chọn ngày' }]}>
                                <RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card type="inner" title="Tải giấy tờ" style={{ height: '100%' }}>
                                <Upload.Dragger
                                    multiple
                                    fileList={fileList}
                                    beforeUpload={beforeUpload}
                                    onChange={handleUploadChange}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    showUploadList={false}
                                >
                                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                                    <p className="ant-upload-text">Kéo thả hoặc nhấn để chọn file</p>
                                    <p className="ant-upload-hint">Định dạng: pdf, jpg, png, docx</p>
                                </Upload.Dragger>

                                <div style={{ marginTop: 12 }}>
                                    <List
                                        bordered
                                        dataSource={fileList}
                                        locale={{ emptyText: 'Chưa có file được chọn' }}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                    <div>{item.name}</div>
                                                    <div>
                                                        <Button size="small" type="link" onClick={() => setFileList(fileList.filter(f => f.uid !== item.uid))}>Xóa</Button>
                                                    </div>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Space>
                            <Button onClick={() => { form.resetFields(); setFileList([]) }}>Xóa</Button>
                            <Button type="primary" loading={submitting} onClick={submit}>Gửi và tạo hồ sơ</Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    )
}
