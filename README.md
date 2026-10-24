# BrewLite - Ứng dụng đặt cà phê và thanh toán không tiền mặt

Dự án bài tập lớn môn **Công nghệ Phần mềm (Software Engineering)**.  
Hệ thống gồm: Backend (NestJS + Prisma + PostgreSQL) và Frontend (Next.js + TailwindCSS).

---

## 🛠️ Hướng dẫn cài đặt & Chạy cơ sở dữ liệu (Dành cho thành viên trong nhóm)

Sau khi `git clone` hoặc `git pull` repository về máy, các bạn làm theo các bước dưới đây để chạy CSDL và nạp dữ liệu kiểm thử.

### Bước 1: Khởi động PostgreSQL (Chọn 1 trong 2 cách)

* **Cách A (Nếu dùng Docker):**  
  Mở terminal tại thư mục gốc dự án và chạy:
  ```bash
  docker compose up -d
  ```

* **Cách B (Nếu dùng PostgreSQL cài trực tiếp trên máy / pgAdmin):**  
  Mở pgAdmin hoặc SQL Shell (psql), tạo một database tên là `brewlite`:
  ```sql
  CREATE DATABASE brewlite;
  ```

---

### Bước 2: Cấu hình biến môi trường

Vào thư mục `backend`, tạo file `.env` từ file mẫu:
```bash
cd backend
copy .env.example .env     # Trên Windows PowerShell / CMD
# hoặc: cp .env.example .env (trên macOS / Linux)
```

Mở file `backend/.env` và kiểm tra chuỗi kết nối:
```env
DATABASE_URL="postgresql://postgres:<mat_khau_cua_ban>@localhost:5432/brewlite?schema=public"
```
*(Thay `<mat_khau_cua_ban>` bằng mật khẩu postgres trên máy của bạn, ví dụ `admin` hoặc `postgrespassword` nếu dùng Docker).*

---

### Bước 3: Cài đặt thư viện & Đẩy bảng vào CSDL

Tại thư mục `backend`, chạy:
```bash
# 1. Cài đặt các package cần thiết
npm install

# 2. Tạo toàn bộ 8 bảng vào PostgreSQL
npx prisma db push

# 3. Nạp dữ liệu mẫu ban đầu (Menu cà phê, Topping, Mã giảm giá, User)
npx prisma db seed
```

---

### Bước 4: Kiểm tra và xem dữ liệu đã tạo

Có 2 cách để xem dữ liệu sau khi nạp:

* **Cách 1 - Trực quan nhất (Prisma Studio):**
  ```bash
  npx prisma studio
  ```
  Trình duyệt sẽ tự mở trang `http://localhost:5555`. Bạn có thể click vào từng bảng (`Product`, `User`, `Order`, `Topping`...) để xem hoặc sửa dữ liệu.

* **Cách 2 - Dùng pgAdmin:**  
  Mở **pgAdmin 4** $\rightarrow$ `Servers` $\rightarrow$ `Databases` $\rightarrow$ `brewlite` $\rightarrow$ `Schemas` $\rightarrow$ `public` $\rightarrow$ `Tables` $\rightarrow$ Chuột phải vào `products` chọn **View/Edit Data** $\rightarrow$ **All Rows**.
