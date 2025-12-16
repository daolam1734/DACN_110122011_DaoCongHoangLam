/* eslint-disable */
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 0. Enable pgcrypto for UUID
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    // 1. DON_VI_TO_CHUC
    await queryInterface.createTable('DON_VI_TO_CHUC', {
      id_don_vi: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ma_don_vi: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      ten_don_vi: { type: Sequelize.STRING(200), allowNull: false },
      id_don_vi_cha: { type: Sequelize.INTEGER, allowNull: true },
      loai_don_vi: { type: Sequelize.STRING(50), allowNull: true },
      trang_thai_hoat_dong: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('DON_VI_TO_CHUC', {
      fields: ['id_don_vi_cha'],
      type: 'foreign key',
      name: 'fk_don_vi_cha',
      references: { table: 'DON_VI_TO_CHUC', field: 'id_don_vi' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. CHUC_VU
    await queryInterface.createTable('CHUC_VU', {
      id_chuc_vu: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ten_chuc_vu: { type: Sequelize.STRING(100), allowNull: false },
      cap_do_tham_quyen: { type: Sequelize.INTEGER, defaultValue: 0 },
      mo_ta: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // 3. DANH_MUC_NGACH
    await queryInterface.createTable('DANH_MUC_NGACH', {
      id_ngach: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ma_ngach: { type: Sequelize.STRING(20), unique: true, allowNull: false },
      ten_ngach: { type: Sequelize.STRING(200), allowNull: false },
      nhom_ngach: { type: Sequelize.STRING(50), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // 4. VIEN_CHUC
    await queryInterface.createTable('VIEN_CHUC', {
      id_vien_chuc: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      ma_so_vien_chuc: { type: Sequelize.STRING(20), unique: true, allowNull: false },
      ho_va_ten: { type: Sequelize.STRING(100), allowNull: false },
      email_cong_vu: { type: Sequelize.STRING(100), unique: true, allowNull: false },
      ngay_sinh: { type: Sequelize.DATEONLY, allowNull: false },
      so_cccd: { type: Sequelize.STRING(20), allowNull: true },
      dia_chi: { type: Sequelize.STRING(255), allowNull: true },
      id_don_vi: { type: Sequelize.INTEGER, allowNull: false },
      id_chuc_vu: { type: Sequelize.INTEGER, allowNull: false },
      id_ngach: { type: Sequelize.INTEGER, allowNull: true },
      la_dang_vien: { type: Sequelize.BOOLEAN, defaultValue: false },
      so_ho_chieu_pho_thong: { type: Sequelize.STRING(20), allowNull: true },
      so_ho_chieu_cong_vu: { type: Sequelize.STRING(20), allowNull: true },
      ngay_het_han_ho_chieu: { type: Sequelize.DATEONLY, allowNull: true },
      trang_thai_lam_viec: { type: Sequelize.STRING(50), defaultValue: 'DANG_LAM_VIEC' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('VIEN_CHUC', {
      fields: ['id_don_vi'],
      type: 'foreign key',
      name: 'fk_vienchuc_donvi',
      references: { table: 'DON_VI_TO_CHUC', field: 'id_don_vi' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('VIEN_CHUC', {
      fields: ['id_chuc_vu'],
      type: 'foreign key',
      name: 'fk_vienchuc_chucvu',
      references: { table: 'CHUC_VU', field: 'id_chuc_vu' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('VIEN_CHUC', {
      fields: ['id_ngach'],
      type: 'foreign key',
      name: 'fk_vienchuc_ngach',
      references: { table: 'DANH_MUC_NGACH', field: 'id_ngach' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 5. VIEN_CHUC_KIEM_NHIEM
    await queryInterface.createTable('VIEN_CHUC_KIEM_NHIEM', {
      id_kiem_nhiem: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_vien_chuc: { type: Sequelize.BIGINT, allowNull: false },
      id_don_vi: { type: Sequelize.INTEGER, allowNull: false },
      id_chuc_vu: { type: Sequelize.INTEGER, allowNull: false },
      la_chuc_vu_chinh: { type: Sequelize.BOOLEAN, defaultValue: false },
      so_quyet_dinh: { type: Sequelize.STRING(50), allowNull: true },
      ngay_bat_dau: { type: Sequelize.DATEONLY, allowNull: false },
      ngay_ket_thuc: { type: Sequelize.DATEONLY, allowNull: true },
      trang_thai: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('VIEN_CHUC_KIEM_NHIEM', {
      fields: ['id_vien_chuc'],
      type: 'foreign key',
      name: 'fk_kiemnhiem_vienchuc',
      references: { table: 'VIEN_CHUC', field: 'id_vien_chuc' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('VIEN_CHUC_KIEM_NHIEM', {
      fields: ['id_don_vi'],
      type: 'foreign key',
      name: 'fk_kiemnhiem_donvi',
      references: { table: 'DON_VI_TO_CHUC', field: 'id_don_vi' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('VIEN_CHUC_KIEM_NHIEM', {
      fields: ['id_chuc_vu'],
      type: 'foreign key',
      name: 'fk_kiemnhiem_chucvu',
      references: { table: 'CHUC_VU', field: 'id_chuc_vu' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // 6. CHI_BO_DANG
    await queryInterface.createTable('CHI_BO_DANG', {
      id_chi_bo: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ma_chi_bo: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      ten_chi_bo: { type: Sequelize.STRING(200), allowNull: false },
      id_don_vi: { type: Sequelize.INTEGER, allowNull: false },
      id_bi_thu: { type: Sequelize.BIGINT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('CHI_BO_DANG', {
      fields: ['id_don_vi'],
      type: 'foreign key',
      name: 'fk_chibo_donvi',
      references: { table: 'DON_VI_TO_CHUC', field: 'id_don_vi' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('CHI_BO_DANG', {
      fields: ['id_bi_thu'],
      type: 'foreign key',
      name: 'fk_chibo_bithu',
      references: { table: 'VIEN_CHUC', field: 'id_vien_chuc' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 7. HO_SO_DANG_VIEN
    await queryInterface.createTable('HO_SO_DANG_VIEN', {
      id_ho_so_dang: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_vien_chuc: { type: Sequelize.BIGINT, unique: true, allowNull: false },
      id_chi_bo: { type: Sequelize.INTEGER, allowNull: false },
      ngay_vao_dang: { type: Sequelize.DATEONLY, allowNull: true },
      ngay_chinh_thuc: { type: Sequelize.DATEONLY, allowNull: true },
      chuc_vu_trong_dang: { type: Sequelize.STRING(100), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('HO_SO_DANG_VIEN', {
      fields: ['id_vien_chuc'],
      type: 'foreign key',
      name: 'fk_hosodangvien_vienchuc',
      references: { table: 'VIEN_CHUC', field: 'id_vien_chuc' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('HO_SO_DANG_VIEN', {
      fields: ['id_chi_bo'],
      type: 'foreign key',
      name: 'fk_hosodangvien_chibo',
      references: { table: 'CHI_BO_DANG', field: 'id_chi_bo' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // 8. DANH_MUC_BUOC_DUYET
    await queryInterface.createTable('DANH_MUC_BUOC_DUYET', {
      id_buoc: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      ma_buoc: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      ten_buoc: { type: Sequelize.STRING(100), allowNull: false },
      vai_tro_duyet: { type: Sequelize.STRING(50), allowNull: true },
      la_buoc_cuoi: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // 9. CAU_HINH_LUONG_DUYET
    await queryInterface.createTable('CAU_HINH_LUONG_DUYET', {
      id_luong: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      loai_hinh_chuyen_di: { type: Sequelize.STRING(50), allowNull: true },
      la_dang_vien: { type: Sequelize.BOOLEAN, allowNull: true },
      id_buoc: { type: Sequelize.INTEGER, allowNull: false },
      thu_tu_duyet: { type: Sequelize.INTEGER, allowNull: false },
      thoi_gian_xu_ly_gio: { type: Sequelize.INTEGER, defaultValue: 24 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('CAU_HINH_LUONG_DUYET', {
      fields: ['id_buoc'],
      type: 'foreign key',
      name: 'fk_luongduyet_buoc',
      references: { table: 'DANH_MUC_BUOC_DUYET', field: 'id_buoc' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    // Unique constraint cho workflow
    await queryInterface.addConstraint('CAU_HINH_LUONG_DUYET', {
      fields: ['loai_hinh_chuyen_di', 'la_dang_vien', 'thu_tu_duyet'],
      type: 'unique',
      name: 'uq_luongduyet_thutu'
    });

    // 10. CAU_HINH_GIAY_TO
    await queryInterface.createTable('CAU_HINH_GIAY_TO', {
      id_cau_hinh: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      loai_hinh_chuyen_di: { type: Sequelize.STRING(50), allowNull: true },
      ap_dung_cho_dang_vien: { type: Sequelize.BOOLEAN, allowNull: true },
      ma_loai_giay_to: { type: Sequelize.STRING(50), allowNull: true },
      ten_giay_to: { type: Sequelize.STRING(200), allowNull: true },
      la_bat_buoc: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // 11. HO_SO_DI_NUOC_NGOAI
    await queryInterface.createTable('HO_SO_DI_NUOC_NGOAI', {
      id_ho_so: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      ma_ho_so: { type: Sequelize.STRING(50), unique: true, allowNull: false },
      id_vien_chuc: { type: Sequelize.BIGINT, allowNull: false },
      id_chuc_vu_khi_di: { type: Sequelize.INTEGER, allowNull: true },
      loai_hinh_chuyen_di: { type: Sequelize.STRING(50), allowNull: false },
      muc_dich_chuyen_di: { type: Sequelize.TEXT, allowNull: false },
      quoc_gia_den: { type: Sequelize.STRING(100), allowNull: true },
      ngay_di_du_kien: { type: Sequelize.DATEONLY, allowNull: true },
      ngay_ve_du_kien: { type: Sequelize.DATEONLY, allowNull: true },
      trang_thai_chung: { type: Sequelize.STRING(50), defaultValue: 'MOI_TAO' },
      id_buoc_hien_tai: { type: Sequelize.INTEGER, allowNull: true },
      thoi_gian_tao: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('HO_SO_DI_NUOC_NGOAI', {
      fields: ['id_vien_chuc'],
      type: 'foreign key',
      name: 'fk_hosodinuocngoai_vienchuc',
      references: { table: 'VIEN_CHUC', field: 'id_vien_chuc' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('HO_SO_DI_NUOC_NGOAI', {
      fields: ['id_buoc_hien_tai'],
      type: 'foreign key',
      name: 'fk_hosodinuocngoai_buoc',
      references: { table: 'DANH_MUC_BUOC_DUYET', field: 'id_buoc' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    // FK cho id_chuc_vu_khi_di
    await queryInterface.addConstraint('HO_SO_DI_NUOC_NGOAI', {
      fields: ['id_chuc_vu_khi_di'],
      type: 'foreign key',
      name: 'fk_hoso_chucvu_khidi',
      references: { table: 'CHUC_VU', field: 'id_chuc_vu' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    // CHECK constraint: ngay_ve_du_kien >= ngay_di_du_kien
    await queryInterface.sequelize.query(`
      ALTER TABLE "HO_SO_DI_NUOC_NGOAI"
      ADD CONSTRAINT check_ngay_ve_du_kien
      CHECK (ngay_ve_du_kien IS NULL OR ngay_di_du_kien IS NULL OR ngay_ve_du_kien >= ngay_di_du_kien)
    `);

    // 12. HO_SO_TIEN_DO
    await queryInterface.createTable('HO_SO_TIEN_DO', {
      id_tien_do: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_ho_so: { type: Sequelize.UUID, allowNull: false },
      id_buoc: { type: Sequelize.INTEGER, allowNull: false },
      ket_qua_xu_ly: { type: Sequelize.STRING(50), allowNull: true },
      nguoi_xu_ly: { type: Sequelize.BIGINT, allowNull: true },
      thoi_gian_xu_ly: { type: Sequelize.DATE, allowNull: true },
      y_kien: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('HO_SO_TIEN_DO', {
      fields: ['id_ho_so'],
      type: 'foreign key',
      name: 'fk_tiendo_hoso',
      references: { table: 'HO_SO_DI_NUOC_NGOAI', field: 'id_ho_so' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('HO_SO_TIEN_DO', {
      fields: ['id_buoc'],
      type: 'foreign key',
      name: 'fk_tiendo_buoc',
      references: { table: 'DANH_MUC_BUOC_DUYET', field: 'id_buoc' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    // FK cho nguoi_xu_ly
    await queryInterface.addConstraint('HO_SO_TIEN_DO', {
      fields: ['nguoi_xu_ly'],
      type: 'foreign key',
      name: 'fk_tiendo_nguoi_xuly',
      references: { table: 'VIEN_CHUC', field: 'id_vien_chuc' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 13. TAI_LIEU_HO_SO
    await queryInterface.createTable('TAI_LIEU_HO_SO', {
      id_tai_lieu: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_ho_so: { type: Sequelize.UUID, allowNull: false },
      ma_loai_giay_to: { type: Sequelize.STRING(50), allowNull: true },
      ten_tap_tin: { type: Sequelize.STRING(255), allowNull: true },
      duong_dan: { type: Sequelize.STRING(500), allowNull: true },
      la_tai_lieu_bao_mat: { type: Sequelize.BOOLEAN, defaultValue: false },
      thoi_gian_tai_len: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('TAI_LIEU_HO_SO', {
      fields: ['id_ho_so'],
      type: 'foreign key',
      name: 'fk_tailieu_hoso',
      references: { table: 'HO_SO_DI_NUOC_NGOAI', field: 'id_ho_so' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 14. BAO_CAO_KET_QUA
    await queryInterface.createTable('BAO_CAO_KET_QUA', {
      id_bao_cao: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_ho_so: { type: Sequelize.UUID, unique: true, allowNull: false },
      noi_dung_chuyen_mon: { type: Sequelize.TEXT, allowNull: true },
      noi_dung_dang: { type: Sequelize.TEXT, allowNull: true },
      ngay_ve_thuc_te: { type: Sequelize.DATEONLY, allowNull: true },
      han_nop_bao_cao: { type: Sequelize.DATEONLY, allowNull: true },
      ngay_nop: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('BAO_CAO_KET_QUA', {
      fields: ['id_ho_so'],
      type: 'foreign key',
      name: 'fk_baocao_hoso',
      references: { table: 'HO_SO_DI_NUOC_NGOAI', field: 'id_ho_so' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // 15. AUDIT_HE_THONG
    await queryInterface.createTable('AUDIT_HE_THONG', {
      id_audit: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      ten_bang: { type: Sequelize.STRING(100), allowNull: true },
      khoa_chinh: { type: Sequelize.STRING(100), allowNull: true },
      hanh_dong: { type: Sequelize.STRING(10), allowNull: true },
      du_lieu_cu: { type: Sequelize.JSONB, allowNull: true },
      du_lieu_moi: { type: Sequelize.JSONB, allowNull: true },
      nguoi_thuc_hien: { type: Sequelize.BIGINT, allowNull: true },
      thoi_gian: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // 16. TAI_KHOAN_DANG_NHAP
    await queryInterface.createTable('TAI_KHOAN_DANG_NHAP', {
      id_tai_khoan: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING(100), unique: true, allowNull: false },
      mat_khau: { type: Sequelize.STRING(255), allowNull: false },
      id_vien_chuc: { type: Sequelize.BIGINT, allowNull: false },
      vai_tro: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'USER' },
      trang_thai: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
      lan_dang_nhap_cuoi: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('TAI_KHOAN_DANG_NHAP', {
      fields: ['id_vien_chuc'],
      type: 'foreign key',
      name: 'fk_taikhoan_vienchuc',
      references: { table: 'VIEN_CHUC', field: 'id_vien_chuc' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    // Index cho audit
    await queryInterface.addIndex('AUDIT_HE_THONG', ['ten_bang']);
    await queryInterface.addIndex('AUDIT_HE_THONG', ['khoa_chinh']);
    await queryInterface.addIndex('AUDIT_HE_THONG', ['nguoi_thuc_hien']);
    await queryInterface.addIndex('AUDIT_HE_THONG', ['thoi_gian']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('TAI_KHOAN_DANG_NHAP');
    await queryInterface.dropTable('TAI_KHOAN_DANG_NHAP');
    await queryInterface.dropTable('AUDIT_HE_THONG');
    await queryInterface.dropTable('BAO_CAO_KET_QUA');
    await queryInterface.dropTable('TAI_LIEU_HO_SO');
    await queryInterface.dropTable('HO_SO_TIEN_DO');
    await queryInterface.dropTable('HO_SO_DI_NUOC_NGOAI');
    await queryInterface.dropTable('CAU_HINH_GIAY_TO');
    await queryInterface.dropTable('CAU_HINH_LUONG_DUYET');
    await queryInterface.dropTable('DANH_MUC_BUOC_DUYET');
    await queryInterface.dropTable('HO_SO_DANG_VIEN');
    await queryInterface.dropTable('CHI_BO_DANG');
    await queryInterface.dropTable('VIEN_CHUC_KIEM_NHIEM');
    await queryInterface.dropTable('VIEN_CHUC');
    await queryInterface.dropTable('DANH_MUC_NGACH');
    await queryInterface.dropTable('CHUC_VU');
    await queryInterface.dropTable('DON_VI_TO_CHUC');
  }
};
