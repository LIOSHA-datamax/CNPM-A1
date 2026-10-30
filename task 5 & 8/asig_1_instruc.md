# HƯỚNG DẪN KỊCH BẢN DEMO - TASK 5 & TASK 8 (FRONTEND)
**Dự án:** BrewLite (Môn Công nghệ Phần mềm)

---

## Kịch bản 1: Demo Tính năng Giỏ hàng bằng Zustand (Task 5)
1. **Thêm món vào giỏ hàng:**
   * Mở Menu tại `http://localhost:3000`.
   * Chọn món *"Cà phê sữa"*, chọn Size M (+5.000₫), chọn Topping *"Trân châu đen"*, chọn số lượng = 2.
   * Bấm *"Thêm vào giỏ"*.
   * **Kết quả quan sát:**
     * Toast thông báo thành công hiển thị.
     * Badge số lượng màu cam trên icon Giỏ hàng ở Navbar lập tức nhảy lên số 2.
2. **Kiểm tra tính năng gộp món:**
   * Tiếp tục chọn lại đúng món *"Cà phê sữa"*, Size M, Topping *"Trân châu đen"*, số lượng = 1.
   * Bấm *"Thêm vào giỏ"*.
   * **Kết quả quan sát:** Badge giỏ hàng tăng lên 3, mở giỏ thấy số lượng tự động gộp thành 3 (thay vì tạo 2 dòng trùng nhau).
3. **Mở Drawer Giỏ hàng & Thao tác:**
   * Bấm vào Icon Giỏ hàng trên thanh điều hướng.
   * Drawer giỏ hàng trượt từ bên phải sang.
   * Bấm nút `[+]` để tăng số lượng lên 4. Tổng tiền món và tổng tiền thanh toán lập tức cập nhật theo thời gian thực.
   * Bấm nút `[-]` để giảm số lượng.
   * Thử bấm icon thùng rác để xóa món. Giỏ hàng chuyển sang giao diện trống thân thiện.
4. **Kiểm tra tính bền vững (Persist):**
   * Thêm món vào giỏ, bấm F5 tải lại trang. Giỏ hàng và badge số lượng vẫn được giữ nguyên vẹn từ `localStorage`.

---

## Kịch bản 2: Demo Màn hình Chọn phương thức thanh toán (Task 8)
1. Trong Drawer Giỏ hàng (hoặc trang `/cart`), bấm nút **"Tiến hành thanh toán →"**.
2. Màn hình / Modal Chọn phương thức thanh toán hiển thị:
   * **Nhóm 1 - Ví điện tử (`E_WALLET`):**
     * Chọn MoMo: Hiển thị logo hồng và hướng dẫn quét mã.
     * Chọn VNPay-QR: Hiển thị giao diện quét mã thanh toán 40 ngân hàng.
     * Chọn ZaloPay: Hiển thị giao diện ZaloPay.
   * **Nhóm 2 - Thẻ ngân hàng (`BANK_CARD`):**
     * Chọn Thẻ quốc tế (Visa / Mastercard) hoặc Thẻ nội địa (NAPAS).
     * Form thẻ tự điền dữ liệu mẫu (Số thẻ, Ngày hết hạn, CVV, Tên in trên thẻ).
3. **Demo kịch bản thất bại (DoD Task 8):**
   * Đánh dấu vào ô: *"Mô phỏng thanh toán thất bại"*.
   * Bấm *"Xác nhận thanh toán"*.
   * Hệ thống hiển thị hiệu ứng xoay đang xử lý, sau đó báo lỗi từ chối giao dịch màu đỏ.
   * **Quan sát:** Toàn bộ giỏ hàng vẫn được bảo lưu 100%, không bị mất!
4. **Demo kịch bản thành công:**
   * Bỏ chọn mô phỏng thất bại.
   * Bấm *"Xác nhận thanh toán [Số tiền]₫"*.
   * Hệ thống chạy animation xử lý bảo mật và chuyển ngay sang màn hình Xác nhận đơn.

---

## Kịch bản 3: Demo Màn hình Xác nhận đặt hàng thành công (Task 8)
1. Màn hình Xác nhận đặt hàng xuất hiện với hiệu ứng checkmark xanh lá.
2. **Quan sát các tiêu chí bắt buộc theo đề bài:**
   * Trạng thái đơn hàng: **`TRẠNG THÁI: PAID`** với đèn xanh pulse nhấp nháy.
   * Mã đơn hàng: **`#ORD-XXXXXX`** kèm nút sao chép mã tiện lợi.
   * Chi tiết giao dịch: Cổng thanh toán đã dùng, mã giao dịch `TXN-...`, ngày giờ, tên khách hàng.
   * Danh sách toàn bộ các ly đã đặt kèm Size, Topping và thành tiền.
   * Giỏ hàng đã được tự động làm sạch (`items = []`) để chuẩn bị cho lượt đặt mới.
3. Bấm **"Tiếp tục đặt món"**: Hệ thống quay trở lại Menu trang chủ, sẵn sàng phục vụ tiếp.
