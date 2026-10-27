Do nhóm mình có 5 người nên mỗi người phụ trách 2 task chính như sau:

Thành viên 1
Task nhận: Task 1 và Task 9
Chi tiết việc cần làm:
- Khởi tạo khung dự án Next.js và NestJS, cấu hình Git repo, file .env.example, viết README.md ban đầu hướng dẫn các bạn kéo về chạy.
- Viết docker-compose.yml đóng gói chạy 1 lệnh lên cả frontend, backend, PostgreSQL.
- Làm màn hình và API xem danh sách lịch sử các đơn hàng cũ (GET /orders/me).
- Theo dõi tiến độ Sprint, vẽ Burndown Chart và chuẩn bị kịch bản demo bàn giao cho giảng viên.

Thành viên 2
Task nhận: Task 3 và Task 4
Chi tiết việc cần làm:
- Quản lý danh sách backlog, phác thảo wireframe các màn hình.
- Dựng trang Menu (Next.js) hiển thị lưới sản phẩm, xử lý đầy đủ trạng thái loading và empty.
- Dựng màn hình/popup chi tiết sản phẩm, làm chức năng chọn Size (S/M/L) và chọn Topping, viết logic tính lại tiền khi khách đổi tùy chọn.

Thành viên 3
Task nhận: Task 5 và Task 8 (phần Frontend)
Chi tiết việc cần làm:
- Xây dựng toàn bộ tính năng Giỏ hàng bằng Zustand: thêm món, tăng giảm số lượng, xóa món, tính tổng tiền, badge số lượng ở icon giỏ hàng.
- Dựng màn hình chọn phương thức thanh toán (Ví điện tử / Thẻ).
- Dựng màn hình Xác nhận đặt hàng thành công (hiển thị mã đơn #..., trạng thái PAID ngay sau khi thanh toán).

Thành viên 4
Task nhận: Task 2, Task 7 và hỗ trợ Task 8 (phần Backend)
Chi tiết việc cần làm:
- Khởi tạo Prisma kết nối PostgreSQL, tạo bảng Product và nạp dữ liệu mẫu ban đầu, viết API GET /products.
- Viết toàn bộ hệ thống Auth: API đăng ký, đăng nhập băm mật khẩu bcrypt, cấp JWT token, viết Guard bảo vệ route đặt đơn và form đăng nhập FE.
- Viết API cổng thanh toán giả lập POST /payments cho Task 8 (chuyển trạng thái đơn sang PAID hoặc PAYMENT_FAILED).

Thành viên 5 (Backend Core & Logic)
Task nhận: Task 6 và Task 10
Chi tiết việc cần làm:
- Viết API tạo đơn hàng POST /orders nhận giỏ hàng, validate dữ liệu đầu vào và lưu đơn trạng thái PENDING.
- Xử lý toàn bộ Task 10: Cài đặt State Machine kiểm soát trạng thái đơn hàng, dùng Idempotency-Key chống thanh toán trùng lặp, dùng Optimistic Locking chống bán âm tồn kho khi nhiều khách đặt cùng lúc, áp mã giảm giá và tích điểm loyalty.
- Viết Unit/Integration test tự động để chứng minh các logic trên chạy đúng theo yêu cầu đề bài.