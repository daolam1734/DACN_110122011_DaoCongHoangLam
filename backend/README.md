# Backend Quản lý hồ sơ đi nước ngoài

## Khởi tạo

1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Cấu hình file `.env` (đã có mẫu, thay đổi thông tin kết nối DB nếu cần).
3. Khởi động server:
   ```bash
   npm run dev
   ```

## Cấu trúc thư mục
- `src/models`: Sequelize models
- `src/routes`: Express routes
- `src/controllers`: Controllers
- `src/middlewares`: Middleware
- `src/utils`: Tiện ích
- `migrations`: Sequelize migrations

## Ghi chú
- Sử dụng PostgreSQL
- ORM: Sequelize
- Port mặc định: 3001
