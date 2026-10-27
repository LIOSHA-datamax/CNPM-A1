# CÔNG NGHỆ SỬ DỤNG - THÀNH VIÊN 3 (FRONTEND)
**Dự án:** BrewLite (Môn Công nghệ Phần mềm - ĐH Sài Gòn)  
**Phạm vi phụ trách:** Task 5 (Sprint 2 - Giỏ hàng Zustand) và Task 8 (Sprint 3 - Thanh toán không tiền mặt & Xác nhận đơn hàng Frontend)

---

## 1. Ngăn xếp công nghệ cốt lõi (Core Stack)

| Công nghệ | Phiên bản / Chi tiết | Vai trò trong dự án |
| :--- | :--- | :--- |
| **Next.js** | `14.2.35` (App Router) | Framework React phía client, quản lý các màn hình và định tuyến (`/`, `/cart`, `/checkout`, `/order-success`) |
| **TailwindCSS** | `v3.4.1` | Thư viện tạo kiểu dáng Utility-First, đồng bộ bảng màu quán cà phê BrewLite |
| **Zustand** | `v5.0.16` | Thư viện quản lý state toàn cục gọn nhẹ, quản lý giỏ hàng và đơn hàng |
| **TypeScript** | `v5.x` | Đảm bảo tính toàn vẹn dữ liệu (Type-safe) cho Payload, CartItem, OrderConfirmation |

---

## 2. Chi tiết giải pháp kỹ thuật theo từng Task

### A. Task 5: Toàn bộ tính năng Giỏ hàng bằng Zustand (Sprint 2)
* **Zustand Store (`src/cartStore.ts`)**:
  * `items: CartItem[]`: Mảng lưu trữ danh sách món trong giỏ hàng.
  * `addItem(payload)`: Tự động gộp số lượng và tính lại tổng tiền nếu trùng `productId + size + toppings`.
  * `increaseQuantity(id)` / `decreaseQuantity(id)`: Tăng / giảm số lượng, tự động xóa món khi số lượng về 0.
  * `removeItem(id)`: Xóa một món cụ thể.
  * `clearCart()`: Xóa sạch toàn bộ giỏ hàng (khi khách hủy giỏ hoặc hoàn tất thanh toán).
  * `getTotalItems()`: Tính tổng số lượng ly món trong giỏ hàng.
  * `getTotalAmount()`: Tính tổng số tiền cả giỏ hàng (Giá cơ bản + Chênh lệch Size + Giá Toppings).
  * `persist`: Tích hợp middleware lưu vào `localStorage` (`brewlite_app_storage`), giữ giỏ hàng không bị mất khi tải lại trang F5.
* **Badge số lượng Giỏ hàng (`src/components/Navbar.tsx`)**:
  * Hiển thị số lượng cam nổi bật trên icon giỏ hàng ở cả Header Desktop và Drawer Mobile khi `totalItems > 0`.
* **Drawer Giỏ hàng trượt (`src/components/CartDrawer.tsx`)**:
  * Trượt từ phải sang với hiệu ứng mượt mà, cho phép xem danh sách món, chỉnh số lượng, xóa món và bấm *"Tiến hành thanh toán"*.
* **Trang Giỏ hàng độc lập (`src/app/cart/page.tsx`)**:
  * Đường dẫn `/cart` hỗ trợ xem toàn màn hình.

---

### B. Task 8: Màn hình chọn phương thức thanh toán (Ví điện tử / Thẻ) (Sprint 3)
* **Thành phần (`src/components/CheckoutModal.tsx` & `src/app/checkout/page.tsx`)**:
  * Chuẩn hóa theo `PaymentMethod` của NestJS:
    1. **Ví điện tử (`E_WALLET`)**:
       * Hỗ trợ chọn **Ví MoMo** (hồng), **VNPay-QR** (đỏ/xanh), **ZaloPay** (xanh).
       * Khung hiển thị mô phỏng mã QR thanh toán nhanh tại quầy.
    2. **Thẻ thanh toán (`BANK_CARD`)**:
       * Hỗ trợ **Thẻ quốc tế (Visa / Mastercard)** và **Thẻ ATM nội địa (NAPAS)**.
       * Form nhập thông tin thẻ trực quan (Số thẻ, Hạn dùng MM/YY, CVV, Tên chủ thẻ in hoa).
  * Nhập thông tin bàn phục vụ / mang đi và ghi chú cho Barista (*ít đá, nhiều sữa...*).
  * **Kịch bản kiểm thử lỗi (Task 8 DoD)**: Checkbox *"Mô phỏng thanh toán thất bại"* — khi bật, giao dịch bị từ chối và **bảo lưu nguyên vẹn giỏ hàng** để khách thử lại.
  * Nút bấm *"Xác nhận thanh toán [Số tiền]₫"* với trạng thái loading spinner kết nối cổng thanh toán.

---

### C. Task 8: Màn hình Xác nhận đặt hàng thành công (Sprint 3)
* **Thành phần (`src/components/OrderSuccessModal.tsx` & `src/app/order-success/page.tsx`)**:
  * Icon checkmark thành công xanh lá lớn.
  * **Trạng thái PAID nổi bật**: Badge `TRẠNG THÁI: PAID` xanh lá với hiệu ứng đèn tín hiệu nhấp nháy.
  * **Mã đơn hàng**: Hiển thị dạng `#ORD-XXXXXX` kèm nút sao chép nhanh.
  * **Chi tiết giao dịch**: Cổng thanh toán đã dùng (Ví MoMo / Thẻ Visa...), Mã giao dịch ngân hàng (`TXN-...`), Thời gian thanh toán, Tên khách hàng, Ghi chú pha chế.
  * **Bảng danh sách chi tiết các món**: Size, Topping, Số lượng x Đơn giá, Thành tiền.
  * Nút điều hướng *"Tiếp tục đặt món"* (reset giỏ hàng về Menu).

---

## 3. Tiêu chuẩn hoàn thành (Definition of Done - DoD)

1. **Chất lượng mã nguồn:**
   * Không có lỗi biên dịch TypeScript (`npx tsc --noEmit` thoát mã 0).
   * Tạo bản build production Next.js thành công (`npm run build`).
2. **Trải nghiệm người dùng:**
   * Giao diện responsive hoạt động hoàn hảo trên cả Mobile và Desktop.
   * Cập nhật số lượng và tổng tiền theo thời gian thực (Zero Lag).
   * Không bị mất dữ liệu giỏ hàng khi người dùng tải lại trang.
   * Đúng chuẩn yêu cầu đề bài: thanh toán thành công chuyển sang `PAID`, thanh toán thất bại bảo lưu giỏ hàng.
