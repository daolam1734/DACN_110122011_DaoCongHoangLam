// Enum cho trạng thái hồ sơ, kết quả xử lý, hành động audit

const HO_SO_TRANG_THAI = Object.freeze({
  MOI_TAO: 'MOI_TAO',
  CHO_DUYET: 'CHO_DUYET',
  DANG_XU_LY: 'DANG_XU_LY',
  DA_DUYET: 'DA_DUYET',
  TU_CHOI: 'TU_CHOI',
  TRA_LAI: 'TRA_LAI',
  HOAN_THANH: 'HOAN_THANH',
});

const KET_QUA_XU_LY = Object.freeze({
  DONG_Y: 'DONG_Y',
  TU_CHOI: 'TU_CHOI',
  TRA_LAI: 'TRA_LAI',
});

const AUDIT_HANH_DONG = Object.freeze({
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
});

module.exports = {
  HO_SO_TRANG_THAI,
  KET_QUA_XU_LY,
  AUDIT_HANH_DONG,
};
