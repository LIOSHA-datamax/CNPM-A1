# CÔNG NGHỆ SỬ DỤNG - THÀNH VIÊN 4 (BACKEND)
**Dự án:** BrewLite (Môn Công nghệ Phần mềm - ĐH Sài Gòn)  
**Nhánh Git:** `chicong-task-2-7-8-(backend)`  
**Phạm vi phụ trách:** Task 2 (Sprint 1), Task 7 (Sprint 2) và Task 8 (Backend - Sprint 3)

---

## 1. Ngăn xếp công nghệ cốt lõi (Core Stack)

| Công nghệ | Phiên bản / Chi tiết | Vai trò trong dự án |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x` (Máy hiện tại: `v24.14.1`) | Môi trường thực thi JavaScript/TypeScript phía server |
| **NestJS** | Framework v10+ (TypeScript) | Framework Backend chính, cung cấp kiến trúc Module - Controller - Service |
| **PostgreSQL** | Database Engine v16/v17 | Hệ quản trị cơ sở dữ liệu quan hệ chính của toàn bộ dự án |
| **Prisma ORM** | v5+ / v6+ | Công cụ quản lý schema CSDL, sinh mã Type-safe client và thực hiện migration |

---

## 2. Thư viện chuyên dụng theo từng Task

### A. Task 2: API Danh sách sản phẩm (Sprint 1)
* **`@prisma/client`**: Truy vấn danh sách món ăn/nước uống (`findMany`, `findUnique`).
* **Prisma Seed Script (`ts-node` + `prisma/seed.ts`)**: Tự động nạp dữ liệu mẫu ban đầu (Cà phê sữa, Americano, Cappuccino, Trà đào...) để sẵn sàng cho Frontend kết nối.
* **`class-validator` & `class-transformer`**: Validate các query params (phân trang, lọc danh mục nếu có).

### B. Task 7: Đăng ký & Đăng nhập (JWT Authentication) (Sprint 2)
* **`bcrypt` (hoặc `bcryptjs`)**: Băm mật khẩu một chiều (one-way salt hashing), chống rò rỉ mật khẩu thô trong database.
* **`@nestjs/jwt` & `passport-jwt`**: Cấp phát mã định danh `access_token` (JWT) có chữ ký số (secret key) và kiểm tra tính hợp lệ của token.
* **`@nestjs/passport`**: Framework tích hợp Passport vào NestJS.
* **`JwtAuthGuard`**: Guard của NestJS dùng để bảo vệ các route nhạy cảm (như API tạo đơn hàng, thanh toán), chỉ cho phép request có đính kèm Bearer Token hợp lệ đi qua.
* **DTO Validation**: Kiểm tra tính hợp lệ của dữ liệu gửi lên:
  * Email đúng định dạng (`@IsEmail()`).
  * Mật khẩu tối thiểu độ dài (`@MinLength(6)`).

### C. Task 8: Thanh toán không tiền mặt (Mock Payment Gateway) (Sprint 3)
* **Mock Payment Service**: Viết service nội bộ giả lập hành vi của các cổng thanh toán Momo / VNPay / Thẻ ngân hàng.
* **Xử lý trạng thái thanh toán**:
  * Thành công: Chuyển trạng thái đơn hàng sang `PAID`, tạo bản ghi trong bảng `Payment`.
  * Thất bại: Chuyển trạng thái đơn sang `PAYMENT_FAILED` và giữ nguyên giỏ hàng để người dùng thử lại.

---

## 3. Công cụ hỗ trợ phát triển & Kiểm thử (Dev Tools)

* **Prisma Studio (`npx prisma studio`)**: Giao diện web trực quan để kiểm tra bảng `Product`, `User`, `Payment` mà không cần cài thêm phần mềm ngoài.
* **Postman / Thunder Client (VS Code)**: Kiểm thử các endpoint REST API:
  * `GET /products`
  * `GET /products/:id`
  * `POST /auth/register`
  * `POST /auth/login`
  * `POST /payments`
* **Command Line Tools (`psql`)**: Công cụ dòng lệnh tương tác trực tiếp với PostgreSQL Server.

---

## 4. Kiến trúc & Tiêu chuẩn chất lượng (DoD)

1. **Mô hình kiến trúc NestJS:**
   * **Module**: `ProductsModule`, `AuthModule`, `PaymentsModule`.
   * **Controller**: Tiếp nhận request, gọi service, trả response chuẩn HTTP.
   * **Service**: Chứa nghiệp vụ kinh doanh và truy xuất CSDL qua Prisma.
   * **DTO & Pipe**: `ValidationPipe` toàn cục chặn dữ liệu rác từ client.
   * **Guard**: Chặn các request chưa xác thực.
2. **Tiêu chuẩn hoàn thành (Definition of Done):**
   * Code chạy không lỗi build TypeScript.
   * Có commit Git rõ ràng theo từng Story trên branch `chicong-task-2-7-8-(backend)`.
   * Thời gian phản hồi API `< 500ms` với dữ liệu mẫu.
   * Dữ liệu nhạy cảm (mật khẩu) luôn được mã hóa chuẩn bcrypt.
