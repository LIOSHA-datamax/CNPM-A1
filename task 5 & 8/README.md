# THƯ MỤC BÀN GIAO: TASK 5 & TASK 8 (FRONTEND)
**Dự án:** BrewLite - Hệ thống đặt đồ uống & Thanh toán không tiền mặt  
**Sinh viên phụ trách:** Nguyễn Tuấn Khôi (Frontend State & Checkout)

---

## Danh mục tài liệu và mã nguồn trong folder `task 5 & 8`:

```
task 5 & 8/
├── README.md               # Tổng quan và hướng dẫn chạy
├── asig_1_role.md          # Bảng phân công nhiệm vụ của Thành viên 3 (Task 5 & 8)
├── asig_1_tech.md          # Báo cáo kiến trúc công nghệ & giải pháp kỹ thuật
├── asig_1_instruc.md       # Hướng dẫn chi tiết các kịch bản demo cho Giảng viên
└── src/
    ├── types.ts            # Kiểu dữ liệu giỏ hàng, đơn hàng, phương thức thanh toán
    ├── cartStore.ts        # Zustand Store quản lý toàn bộ giỏ hàng & đơn hàng
    ├── components/
    │   ├── CartDrawer.tsx          # Drawer Giỏ hàng trượt từ phải sang (Task 5)
    │   ├── CheckoutModal.tsx       # Màn hình chọn thanh toán: Ví điện tử / Thẻ (Task 8)
    │   ├── OrderSuccessModal.tsx   # Màn hình xác nhận đặt hàng (#..., PAID) (Task 8)
    │   └── Navbar.tsx              # Thanh điều hướng tích hợp Badge số lượng cam
    └── app/
        ├── page.tsx                # Trang Menu chính tích hợp toàn bộ luồng
        ├── cart/page.tsx           # Trang Giỏ hàng độc lập (/cart)
        ├── checkout/page.tsx       # Trang Thanh toán độc lập (/checkout)
        └── order-success/page.tsx  # Trang Thành công độc lập (/order-success)
```

---

## Hướng dẫn chạy thử nghiệm
1. Di chuyển vào thư mục `frontend`:
   ```powershell
   cd frontend
   npm run dev
   ```
2. Mở trình duyệt tại: `http://localhost:3000`
3. Thực hiện theo các kịch bản tại file `asig_1_instruc.md` để kiểm tra toàn bộ tính năng Task 5 & Task 8.
