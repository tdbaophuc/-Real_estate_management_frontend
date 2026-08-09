# ĐẶC TẢ CHUYỂN ĐỔI GIAO DIỆN: NOTIFICATION CENTER
> **Mục tiêu:** Loại bỏ trang thông báo tĩnh (Full-page) hiện tại. Chuyển đổi thành dạng Cửa sổ nổi (Popover/Dropdown) gắn trực tiếp vào biểu tượng chuông trên thanh TopBar để tăng tính tiện dụng và tiết kiệm không gian.

---

## 1. THAY ĐỔI CẤU TRÚC COMPONENT & BỐ CỤC (LAYOUT & SHAPES)

*   **Loại bỏ Trang độc lập:** Xóa bỏ route `/notifications` hiện tại (hoặc giữ lại làm trang quản lý full nếu cần, nhưng không dùng làm UI chính).
*   **Tạo Component Popover mới:** Xây dựng một component `NotificationPopover` được kích hoạt (toggle) khi click vào icon chuông trên TopBar.
*   **Vị trí & Kích thước (Position & Size):**
    *   Khai báo cửa sổ dạng `absolute` hoặc sử dụng thư viện Popper.js/Floating UI neo ngay dưới icon chuông, căn lề phải (Right-aligned).
    *   Kích thước chuẩn: `width: 320px;`, `max-height: 480px;`.
    *   Nội dung bên trong (list thông báo) đặt thuộc tính `overflow-y: auto;` để cho phép cuộn.
*   **Hình khối & Đổ bóng:**
    *   Bo góc: `border-radius: 4px;`.
    *   Đường viền: `border: 1px solid #d8dadc;`.
    *   Đổ bóng: Áp dụng Shadow-lg (Elevation Level 3) `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);`.
*   **Lớp phủ (Overlay):** Phía sau Popover, thêm một lớp div overlay bao phủ toàn màn hình với hiệu ứng làm mờ nhẹ: `backdrop-filter: blur(2px); background-color: rgba(255, 255, 255, 0.1);` để người dùng tập trung vào thông báo.

---

## 2. HỆ THỐNG MÀU SẮC (COLOR PALETTE)

*   **Màu nền & Text mặc định:**
    *   Nền Popover: `#ffffff`.
    *   Tiêu đề chính (Notifications): `#1a1c1e`.
    *   Văn bản nội dung: `#44474e`.
*   **Định dạng Trạng thái chưa đọc (Unread State):**
    *   Áp dụng màu nền cực nhạt cho hàng thông báo chưa đọc: `background-color: #f0f7ff;` (Xanh nhạt).
    *   Thêm một chấm tròn nhỏ (Unread indicator) kích thước `8px x 8px`, màu `#0061a4` nằm ở rìa trái của item thông báo.
*   **Màu sắc Icon theo loại thông báo:**
    *   Mỗi item thông báo cần có một khối hình tròn chứa icon (kích thước `32px x 32px` hoặc `40px x 40px`).
    *   `New Lead`: Nền xanh dương cực nhạt, Icon màu `#0061a4`.
    *   `Contract`: Nền xám nhạt, Icon màu xám đậm `#44474e`.
    *   `System`: Nền xám nhạt, Icon bánh răng.

---

## 3. PHÔNG CHỮ & CẤP BẬC (TYPOGRAPHY)

Toàn bộ sử dụng phông chữ **Inter**. Cấu hình chi tiết cho từng phần tử bên trong Popover:

*   **Khu vực Header:**
    *   Tiêu đề `Notifications`: `font-size: 14px; font-weight: 700; color: #1a1c1e;`.
    *   Nút `Mark all as read`: `font-size: 12px; font-weight: 500; color: #0061a4; cursor: pointer;`.
*   **Khu vực Hàng thông báo (Notification Item):**
    *   Tiêu đề thông báo (`New Lead Assigned`): `font-size: 13px; font-weight: 700; color: #1a1c1e;`.
    *   Nội dung chi tiết: `font-size: 12px; font-weight: 400; color: #44474e; line-height: 1.4;`.
    *   Thời gian (`2 mins ago`): Nằm ở góc phải trên cùng của item, `font-size: 11px; font-weight: 400; color: #74777f;`.
*   **Khu vực Footer:**
    *   Nút `View all notifications`: Căn giữa (Center-aligned), `font-size: 12px; font-weight: 700; color: #0061a4; padding: 12px 0; border-top: 1px solid #d8dadc;`.

---

## 4. QUY CÁCH TƯƠNG TÁC (INTERACTION)

*   **Hover State (Khi lướt chuột):** Khi người dùng di chuột qua bất kỳ hàng thông báo nào (đã đọc hoặc chưa đọc), nền của hàng đó phải chuyển sang màu xám cực nhạt `#f2f4f6` và con trỏ chuột đổi thành `cursor: pointer;`.
*   **Thanh cuộn (Thin Scrollbar):** Tùy chỉnh thanh cuộn bên trong danh sách thông báo để nó thanh mảnh, không làm thô giao diện:
    *   Sử dụng `::-webkit-scrollbar` (chiều rộng khoảng `4px`).
*   **Chuyển hướng (Navigation):** Click vào item thông báo sẽ đóng Popover và redirect người dùng đến URL của chi tiết Lead hoặc Contract tương ứng.

---

## 5. MÃ CSS GỢI Ý ÁP DỤNG NHANH

```css
/* Container của Popover */
.notification-popover {
  position: absolute;
  top: 56px; /* Tùy thuộc vào chiều cao Topbar */
  right: 16px;
  width: 320px;
  max-height: 480px;
  background-color: #ffffff;
  border: 1px solid #d8dadc;
  border-radius: 4px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
}

/* Header */
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #d8dadc;
}

.notif-header-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1c1e;
}

.notif-mark-read {
  font-size: 12px;
  font-weight: 500;
  color: #0061a4;
  cursor: pointer;
}

/* Scrollable List */
.notif-list {
  overflow-y: auto;
  flex-grow: 1;
}

/* Tùy chỉnh thanh cuộn mỏng */
.notif-list::-webkit-scrollbar {
  width: 4px;
}
.notif-list::-webkit-scrollbar-thumb {
  background: #d8dadc;
  border-radius: 4px;
}

/* Từng Hàng Thông báo */
.notif-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f4f6;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notif-item:hover {
  background-color: #f2f4f6;
}

/* Trạng thái chưa đọc */
.notif-item.unread {
  background-color: #f0f7ff;
}
.notif-item.unread::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background-color: #0061a4;
  border-radius: 50%;
}