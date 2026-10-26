# ☕ BrewLite - Ứng dụng đặt cà phê và thanh toán không tiền mặt

> **Đồ án môn học: Công nghệ Phần mềm**  
> **Quy trình áp dụng:** Agile Scrum (3 Sprints, 10 Tasks)  
> **Công nghệ chủ đạo:** NestJS (Backend) + Next.js (Frontend) + Prisma ORM + PostgreSQL + Docker

---

## 📌 1. Tổng quan dự án & Cấu trúc Monorepo

BrewLite giải quyết bài toán đặt món và thanh toán không dùng tiền mặt tại quầy cà phê chỉ trong vài chạm, giảm thiểu thời gian xếp hàng cho khách và tối ưu hóa luồng pha chế của Barista.

### Cấu trúc mã nguồn:
```text
CNPM-A1/
├── backend/                   # Backend NestJS REST API
│   ├── prisma/
│   │   ├── schema.prisma      # 8 thực thể CSDL (User, Product, Topping, Order, Payment...)
│   │   └── seed.ts            # Dữ liệu kiểm thử mẫu (Menu, Topping, Coupon, Orders)
│   ├── src/
│   │   ├── prisma/            # Prisma Module & Service toàn cục
│   │   ├── products/          # Task 2: API Danh sách & Chi tiết sản phẩm
│   │   ├── orders/            # Task 9: API Lịch sử đơn hàng (GET /orders/me)
│   │   ├── app.controller.ts  # Task 1: Endpoint Hello World
│   │   └── main.ts            # Khởi tạo NestJS, CORS, Swagger Docs
│   ├── Dockerfile             # Multi-stage build container cho Backend
│   └── package.json
│
├── frontend/                  # Frontend Next.js 14 App Router + TailwindCSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Task 1: Trang chủ Hello World & Giới thiệu
│   │   │   ├── orders/        # Task 9: Màn hình Lịch sử đơn hàng
│   │   │   └── order-confirmation/ # Task 9: Màn hình Xác nhận đặt đơn
│   │   └── components/
│   │       └── Navbar.tsx     # Thanh điều hướng chuẩn UI
│   ├── Dockerfile             # Container hóa Frontend
│   └── package.json
│
├── docker-compose.yml         # Chạy đồng thời Postgres, Backend, Frontend bằng 1 lệnh
├── .env.example               # Biến môi trường mẫu của dự án
└── README.md                  # Tài liệu hướng dẫn cài đặt, vận hành và bàn giao
```

---

## 🚀 2. Hướng dẫn chạy Cơ sở dữ liệu từng bước

Bạn có thể chọn **Cách 1 (Khuyên dùng - Nhanh nhất qua Docker)** hoặc **Cách 2 (Cài trực tiếp qua pgAdmin/PostgreSQL)**.

### ➤ Cách 1: Khởi động PostgreSQL qua Docker (Khuyên dùng)
Nếu máy bạn đã cài **Docker Desktop**:
1. Mở Terminal tại thư mục gốc `D:\CNPM-A1`.
2. Chạy lệnh:
   ```bash
   docker compose up -d postgres
   ```
3. PostgreSQL sẽ khởi chạy ngầm trên cổng `5432` với thông tin:
   - Host: `localhost`
   - Port: `5432`
   - User: `postgres`
   - Password: `postgrespassword`
   - Database: `brewlite`

---

### ➤ Cách 2: Khởi động bằng PostgreSQL cài trực tiếp trên máy (pgAdmin)
Nếu máy bạn không dùng Docker:
1. Mở **pgAdmin 4** hoặc **SQL Shell (psql)** trên Windows.
2. Đăng nhập vào tài khoản quản trị PostgreSQL của bạn.
3. Tạo một Database mới tên là `brewlite`:
   ```sql
   CREATE DATABASE brewlite;
   ```
4. Ghi nhớ mật khẩu `postgres` mà bạn đã đặt lúc cài PostgreSQL.

---

### ➤ Bước tiếp theo: Nạp bảng và Dữ liệu mẫu vào CSDL (Bắt buộc)

Sau khi PostgreSQL đã hoạt động theo Cách 1 hoặc Cách 2:

1. **Cấu hình biến môi trường:**
   Vào thư mục `backend`, tạo file `.env` từ file mẫu:
   ```bash
   cd D:\CNPM-A1\backend
   copy .env.example .env
   ```
   *Mở file `.env` vừa tạo, nếu dùng mật khẩu khác `postgrespassword`, hãy sửa lại mật khẩu trong chuỗi kết nối:*
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/brewlite?schema=public"
   ```

2. **Cài đặt thư viện và đẩy cấu trúc bảng vào CSDL:**
   Tại thư mục `backend`, mở PowerShell / CMD và chạy:
   ```bash
   # Cài đặt các thư viện cần thiết
   npm install

   # Đẩy 8 bảng từ schema.prisma vào database
   npx prisma db push

   # Nạp dữ liệu mẫu ban đầu (Menu, Topping, Voucher, Đơn hàng mẫu)
   npx prisma db seed
   ```

3. **Kiểm tra trực quan dữ liệu đã tạo:**
   Chạy lệnh Prisma Studio:
   ```bash
   npx prisma studio
   ```
   Trình duyệt sẽ mở `http://localhost:5555`. Bạn có thể bấm vào các bảng `products`, `orders`, `toppings` để thấy dữ liệu mẫu đã được nạp thành công 100%!

---

## 💻 3. Hướng dẫn chạy dự án trên máy phát triển (Local Dev)

### 1. Khởi động Backend (NestJS):
```bash
cd D:\CNPM-A1\backend
npm run start:dev
```
- **Hello World (Task 1):** Mở trình duyệt truy cập `http://localhost:4000/api`
- **Swagger API Docs:** `http://localhost:4000/api/docs` (Dùng để test trực tiếp tất cả API)
- **API Lịch sử đơn hàng (Task 9):** `http://localhost:4000/api/orders/me`

### 2. Khởi động Frontend (Next.js):
Mở một cửa sổ Terminal mới:
```bash
cd D:\CNPM-A1\frontend
npm install
npm run dev
```
- **Trang chủ Hello World (Task 1):** `http://localhost:3000`
- **Màn hình Lịch sử đơn hàng (Task 9):** `http://localhost:3000/orders`
- **Màn hình Xác nhận đặt đơn (Task 9):** `http://localhost:3000/order-confirmation?orderNumber=BL-1042&status=PAID`

---

## 🐳 4. Chạy toàn bộ hệ thống bằng Docker Compose (Task 9 Bàn giao)

Chỉ với **1 câu lệnh duy nhất**, toàn bộ CSDL, Backend và Frontend sẽ tự động build và chạy:
```bash
cd D:\CNPM-A1
docker compose up --build -d
```
Khi khởi động xong:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`
- Swagger Docs: `http://localhost:4000/api/docs`

Để dừng hệ thống:
```bash
docker compose down
```

---

## 📋 5. Kịch bản Demo Bàn giao cho Giảng viên (End-to-End Demo)

| Bước | Hành động | Kết quả mong đợi |
| :--- | :--- | :--- |
| **1. Khởi tạo** | Mở `http://localhost:3000` | Trang chủ hiển thị thông điệp Hello World, giới thiệu dự án và công nghệ. |
| **2. Xem Menu** | Gọi API `GET /api/products` hoặc test qua Swagger `http://localhost:4000/api/docs` | Trả về danh sách 4 món cà phê kèm danh mục topping và tồn kho. |
| **3. Thanh toán** | Người dùng thực hiện thanh toán qua ví MoMo/Thẻ ngân hàng | Hệ thống tạo đơn và chuyển trạng thái sang `PAID`. |
| **4. Xác nhận đơn** | Điều hướng sang `/order-confirmation` | Hiển thị màn hình chuẩn Wireframe với mã đơn `#BL-1042`, trạng thái `PAID` và thông báo tới quầy nhận nước. |
| **5. Lịch sử đơn (Task 9)** | Bấm vào "Xem lịch sử đơn" (`/orders`) | Gọi `GET /api/orders/me`, hiển thị toàn bộ đơn hàng theo thẻ, lọc theo trạng thái (`PAID`, `PREPARING`, `COMPLETED`), hiển thị chi tiết size, topping, tổng tiền và mã giao dịch. |

---

## 📊 6. Bảng phân công 5 Thành viên & Sprint Burndown Chart

### Phân công công việc:
- **Thành viên 1:** Task 1 (Khởi tạo dự án, monorepo, Git, .env) & Task 9 (API `GET /orders/me`, màn hình lịch sử đơn, docker-compose full, tài liệu demo).
- **Thành viên 2:** Task 3 (Giao diện Menu Next.js) & Task 4 (Modal chi tiết món, chọn size/topping, tính giá).
- **Thành viên 3:** Task 5 (Giỏ hàng Zustand, badge số lượng) & Task 8 (Giao diện thanh toán & màn hình xác nhận).
- **Thành viên 4:** Task 2 (Prisma + API `GET /products`), Task 7 (Auth JWT/bcrypt) & Hỗ trợ Task 8 (API `POST /payments`).
- **Thành viên 5:** Task 6 (API `POST /orders` validation) & Task 10 (Order State Machine, Idempotent, Optimistic Locking, Unit/Integration test).

### Biểu đồ Sprint Burndown Chart mẫu (10 ngày làm việc - 20 Story Points):
```text
Story Points
20 | ●
18 |   \   * (Thực tế)
16 |     \   \
14 |       \   ●
12 |         \   \
10 |           \   ●
 8 |             \   \
 6 |               \   ●
 4 |                 \   \
 2 |                   \   ●
 0 +-------------------------●---> Ngày
   0   1   2   3   4   5   6   7   8   9  10
       [--- Đường lý tưởng (Ideal) ---]
       [●●● Đường thực tế của nhóm (Actual)]
```

### Sprint Retrospective (Mẫu đánh giá cuối Sprint):
* **Điều làm tốt (What went well):**
  - Khởi tạo kiến trúc Monorepo chuẩn chỉ, tách biệt rõ ràng giữa Next.js và NestJS.
  - Thiết kế Schema Prisma tối ưu, bao quát từ sớm các yêu cầu phức tạp (Optimistic locking version, Idempotency key).
  - Tích hợp sẵn Swagger UI giúp các thành viên frontend dễ dàng kiểm thử API.
* **Điều cần cải thiện (What can be improved):**
  - Cần thống nhất quy ước định dạng giá tiền (VND) và kiểu dữ liệu Decimal giữa FE và BE.
  - Tăng cường viết Unit Test song song khi code để tránh dồn việc kiểm thử vào cuối Sprint 3.
