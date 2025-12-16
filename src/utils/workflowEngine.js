import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize'

// Lấy danh sách các bước duyệt cho một loại hình và trạng thái Đảng
export async function getWorkflowSteps(loaiHinhChuyenDi, laDangVien) {
  const steps = await sequelize.query(`
    SELECT c.id_buoc, c.thu_tu_duyet, b.ten_buoc, b.vai_tro_duyet, b.la_buoc_cuoi
    FROM "CAU_HINH_LUONG_DUYET" c
    JOIN "DANH_MUC_BUOC_DUYET" b ON c."id_buoc" = b."id_buoc"
    WHERE (c.loai_hinh_chuyen_di = :loaiHinhChuyenDi OR c.loai_hinh_chuyen_di IS NULL)
      AND (c.la_dang_vien = :laDangVien OR c.la_dang_vien IS NULL)
    ORDER BY c.thu_tu_duyet ASC
  `, {
    replacements: { loaiHinhChuyenDi: loaiHinhChuyenDi || null, laDangVien: laDangVien === true },
    type: QueryTypes.SELECT
  });
  return steps;
}

// Lấy bước duyệt đầu tiên
export async function getFirstWorkflowStep(loaiHinhChuyenDi, laDangVien) {
  const steps = await getWorkflowSteps(loaiHinhChuyenDi, laDangVien);
  return steps.length > 0 ? steps[0] : null;
}

// Lấy bước duyệt tiếp theo dựa vào thứ tự hiện tại
export async function getNextWorkflowStep(loaiHinhChuyenDi, laDangVien, thuTuHienTai) {
  const steps = await getWorkflowSteps(loaiHinhChuyenDi, laDangVien);
  const idx = steps.findIndex(s => s.thu_tu_duyet === thuTuHienTai);
  return idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : null;
}

// Kiểm tra đã là bước cuối chưa
export async function isLastWorkflowStep(loaiHinhChuyenDi, laDangVien, thuTuHienTai) {
  const steps = await getWorkflowSteps(loaiHinhChuyenDi, laDangVien);
  const idx = steps.findIndex(s => s.thu_tu_duyet === thuTuHienTai);
  return idx === steps.length - 1;
}
