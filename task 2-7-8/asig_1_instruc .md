Assignment 1 được chia thành 3 Sprint

Sprint 1: Nền tảng và hiển thị menu
Task 1: Khởi tạo dự án và cấu trúc. Tạo monorepo gồm 2 thư mục frontend (Next.js) và backend (NestJS), chạy được "Hello World", có file .env.example, README.md, cấu hình Git.
Task 2: API danh sách sản phẩm. Backend NestJS viết API GET /products trả về danh sách món (id, tên, giá, ảnh, tồn kho) từ CSDL/mock data.
Task 3: Trang Menu (Frontend). Next.js gọi API GET /products, hiển thị danh sách sản phẩm dạng lưới, có xử lý trạng thái đang tải (loading) và không có dữ liệu (empty).
Task 4: Chi tiết và tùy chọn sản phẩm (Frontend). Màn hình/modal chi tiết món, cho chọn Size (S/M/L) và Topping, tự tính lại tổng giá theo tùy chọn.

Sprint 2: Giỏ hàng, đặt đơn và đăng nhập
Task 5: Giỏ hàng (Frontend). Quản lý state bằng Zustand/Context, cho thêm/sửa số lượng/xóa món, tự tính tổng tiền, hiển thị badge số lượng món trên icon giỏ hàng.
Task 6: API tạo đơn hàng (Backend). NestJS viết API POST /orders nhận giỏ hàng, validate dữ liệu (class-validator), lưu đơn ở trạng thái PENDING, trả về mã đơn.
Task 7: Đăng ký / Đăng nhập (Frontend + Backend). Viết API POST /auth/register, /auth/login, băm mật khẩu bằng bcrypt, cấp JWT token, guard bảo vệ route đặt đơn và dựng form đăng nhập ở frontend.

Sprint 3: Thanh toán, bàn giao và nghiệp vụ
Task 8: Thanh toán không tiền mặt. Tích hợp cổng thanh toán giả lập (mock payment Momo/VNPay/Thẻ), gọi POST /payments, đơn chuyển PAID khi thành công hoặc PAYMENT_FAILED khi lỗi (giữ nguyên giỏ hàng).
Task 9: Xác nhận đơn, lịch sử đơn và bàn giao. Màn hình và API xem lịch sử đơn hàng GET /orders/me, viết docker-compose chạy cùng lúc (frontend, backend, DB), viết README và kịch bản demo.
Task 10: Nghiệp vụ backend nâng cao. Cài đặt State Machine đơn hàng (PENDING -> PAID -> PREPARING -> READY -> COMPLETED), thanh toán idempotent dùng Idempotency-Key chống trừ tiền 2 lần, kiểm soát tồn kho đồng thời (transaction + optimistic locking), mã giảm giá và tích điểm loyalty, viết Unit/Integration test chứng minh.