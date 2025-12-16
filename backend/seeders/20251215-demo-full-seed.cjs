/* eslint-disable */
'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Đơn vị
        await queryInterface.bulkInsert('DON_VI_TO_CHUC', [
            { id_don_vi: 1, ma_don_vi: 'TVU', ten_don_vi: 'Trường Đại học Trà Vinh', createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 2. Chức vụ
        await queryInterface.bulkInsert('CHUC_VU', [
            { id_chuc_vu: 1, ten_chuc_vu: 'Chuyên viên', cap_do_tham_quyen: 1, createdAt: new Date(), updatedAt: new Date() },
            { id_chuc_vu: 2, ten_chuc_vu: 'Trưởng phòng', cap_do_tham_quyen: 3, createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 3. Viên chức
        await queryInterface.bulkInsert('VIEN_CHUC', [
            { id_vien_chuc: 1, ma_so_vien_chuc: 'VC001', ho_va_ten: 'Nguyễn Văn A', email_cong_vu: 'a@tvu.edu.vn', ngay_sinh: '1990-01-01', id_don_vi: 1, id_chuc_vu: 1, la_dang_vien: false, trang_thai_lam_viec: 'DANG_LAM_VIEC', createdAt: new Date(), updatedAt: new Date() },
            { id_vien_chuc: 2, ma_so_vien_chuc: 'VC002', ho_va_ten: 'Trần Thị B', email_cong_vu: 'b@tvu.edu.vn', ngay_sinh: '1992-02-02', id_don_vi: 1, id_chuc_vu: 2, la_dang_vien: true, trang_thai_lam_viec: 'DANG_LAM_VIEC', createdAt: new Date(), updatedAt: new Date() }
            , { id_vien_chuc: 3, ma_so_vien_chuc: 'ADM001', ho_va_ten: 'Quản trị viên', email_cong_vu: 'admin@tvu.edu.vn', ngay_sinh: '1985-01-01', id_don_vi: 1, id_chuc_vu: 2, la_dang_vien: false, trang_thai_lam_viec: 'DANG_LAM_VIEC', createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 4. Tài khoản đăng nhập
        await queryInterface.bulkInsert('TAI_KHOAN_DANG_NHAP', [
            { id_tai_khoan: 1, id_vien_chuc: 1, email: 'a@tvu.edu.vn', mat_khau: await bcrypt.hash('123456', 10), vai_tro: 'USER', trang_thai: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
            { id_tai_khoan: 2, id_vien_chuc: 2, email: 'b@tvu.edu.vn', mat_khau: await bcrypt.hash('123456', 10), vai_tro: 'USER', trang_thai: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() }
            , { id_tai_khoan: 3, id_vien_chuc: 3, email: 'admin@tvu.edu.vn', mat_khau: await bcrypt.hash('admin123', 10), vai_tro: 'ADMIN', trang_thai: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 5. Chi bộ Đảng
        await queryInterface.bulkInsert('CHI_BO_DANG', [
            { id_chi_bo: 1, ma_chi_bo: 'CB01', ten_chi_bo: 'Chi bộ 1', id_don_vi: 1, createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 6. Hồ sơ Đảng viên
        await queryInterface.bulkInsert('HO_SO_DANG_VIEN', [
            { id_ho_so_dang: 1, id_vien_chuc: 2, id_chi_bo: 1, ngay_vao_dang: '2015-05-01', createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 7. Danh mục ngạch
        await queryInterface.bulkInsert('DANH_MUC_NGACH', [
            { id_ngach: 1, ma_ngach: '01', ten_ngach: 'Ngạch A', createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 8. Danh mục bước duyệt (LUỒNG CHÍNH)
        await queryInterface.bulkInsert('DANH_MUC_BUOC_DUYET', [
            { id_buoc: 1, ma_buoc: 'B1', ten_buoc: 'Duyệt đơn vị', vai_tro_duyet: 'truong_don_vi', la_buoc_cuoi: false, createdAt: new Date(), updatedAt: new Date() },
            { id_buoc: 2, ma_buoc: 'B2', ten_buoc: 'Duyệt Đảng', vai_tro_duyet: 'chi_bo', la_buoc_cuoi: false, createdAt: new Date(), updatedAt: new Date() },
            { id_buoc: 3, ma_buoc: 'B3', ten_buoc: 'Phòng TCNS', vai_tro_duyet: 'truong_phong', la_buoc_cuoi: false, createdAt: new Date(), updatedAt: new Date() },
            { id_buoc: 4, ma_buoc: 'B4', ten_buoc: 'Ban Giám hiệu', vai_tro_duyet: 'hieu_truong', la_buoc_cuoi: true, createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 9. Cấu hình luồng duyệt cho loại CONG_TAC
        // - Nếu là đảng viên: Duyệt đơn vị -> Duyệt Đảng -> P.TCNS -> BGH
        await queryInterface.bulkInsert('CAU_HINH_LUONG_DUYET', [
            { id_luong: 1, loai_hinh_chuyen_di: 'CONG_TAC', la_dang_vien: true, id_buoc: 1, thu_tu_duyet: 1, createdAt: new Date(), updatedAt: new Date() },
            { id_luong: 2, loai_hinh_chuyen_di: 'CONG_TAC', la_dang_vien: true, id_buoc: 2, thu_tu_duyet: 2, createdAt: new Date(), updatedAt: new Date() },
            { id_luong: 3, loai_hinh_chuyen_di: 'CONG_TAC', la_dang_vien: true, id_buoc: 3, thu_tu_duyet: 3, createdAt: new Date(), updatedAt: new Date() },
            { id_luong: 4, loai_hinh_chuyen_di: 'CONG_TAC', la_dang_vien: true, id_buoc: 4, thu_tu_duyet: 4, createdAt: new Date(), updatedAt: new Date() },
            // Nếu không phải đảng viên: skip Duyệt Đảng
            { id_luong: 5, loai_hinh_chuyen_di: 'CONG_TAC', la_dang_vien: false, id_buoc: 1, thu_tu_duyet: 1, createdAt: new Date(), updatedAt: new Date() },
            { id_luong: 6, loai_hinh_chuyen_di: 'CONG_TAC', la_dang_vien: false, id_buoc: 3, thu_tu_duyet: 2, createdAt: new Date(), updatedAt: new Date() },
            { id_luong: 7, loai_hinh_chuyen_di: 'CONG_TAC', la_dang_vien: false, id_buoc: 4, thu_tu_duyet: 3, createdAt: new Date(), updatedAt: new Date() }
        ]);
        // 10. Cấu hình giấy tờ
        await queryInterface.bulkInsert('CAU_HINH_GIAY_TO', [
            { id_cau_hinh: 1, loai_hinh_chuyen_di: 'CONG_TAC', ap_dung_cho_dang_vien: false, ma_loai_giay_to: 'GT01', ten_giay_to: 'Đơn xin phép', la_bat_buoc: true, createdAt: new Date(), updatedAt: new Date() }
        ]);
    },
    down: async (queryInterface) => {
        await queryInterface.bulkDelete('CAU_HINH_GIAY_TO', null, {});
        await queryInterface.bulkDelete('CAU_HINH_LUONG_DUYET', null, {});
        await queryInterface.bulkDelete('DANH_MUC_BUOC_DUYET', null, {});
        await queryInterface.bulkDelete('DANH_MUC_NGACH', null, {});
        await queryInterface.bulkDelete('HO_SO_DANG_VIEN', null, {});
        await queryInterface.bulkDelete('CHI_BO_DANG', null, {});
        await queryInterface.bulkDelete('TAI_KHOAN_DANG_NHAP', null, {});
        await queryInterface.bulkDelete('VIEN_CHUC', null, {});
        await queryInterface.bulkDelete('CHUC_VU', null, {});
        await queryInterface.bulkDelete('DON_VI_TO_CHUC', null, {});
    }
};
