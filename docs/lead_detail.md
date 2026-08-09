# ĐẶC TẢ HOÀN THIỆN GIAO DIỆN CHI TIẾT LEAD & AI INSIGHTS
> **Mục tiêu:** Chuyển đổi giao diện chi tiết Lead hiện tại từ các biểu mẫu (Form) nhập liệu thô sơ, rời rạc sang cấu trúc Dashboard 3 cột hiện đại, tinh tế, tích hợp các chỉ số AI và dòng thời gian hoạt động chuẩn xác theo thiết kế.

---

## 1. CẤU TRÚC BỐ CỤC CHUNG (LAYOUT GRID 3 CỘT)

*   **Hiện tại:** Các khối thông tin (`Profile`, `Lead scoring`, `Assignment`, `Lead notes`, `Lead activity`, `Tasks`) xếp chồng thành các thanh dài trải ngang hết màn hình, gây loãng thông tin và tạo nhiều khoảng trống thừa.
*   **Sửa thành:** Cấu hình lại layout vùng nội dung chính bằng **CSS Grid** dưới một nền trung tính thống nhất:
    *   **Màu nền Workspace:** Đổi toàn bộ nền phía sau các Card thành `#f7f9fb`.
    *   **Tỷ lệ chia cột:** Chia thành 3 cột rõ rệt với khoảng cách `gap: 24px;`.
        *   *Cột 1 (Trái - 25%):* Chứa `Contact Details`, `Preferences`, và Bất động sản quan tâm (`Primary Interest`).
        *   *Cột 2 (Giữa - 50%):* Chứa khu vực nhập ghi chú nhanh (`Add Note or Log Activity`) và Dòng lịch sử (`Activity History`).
        *   *Cột 3 (Phải - 25%):* Chứa khối điểm số `AI Lead Score`, `Quick Actions` và danh sách công việc `Tasks`.

```css
/* Gợi ý CSS Layout chung */
.lead-detail-workspace {
  background-color: #f7f9fb;
  display: grid;
  grid-template-columns: 25fr 50fr 25fr;
  gap: 24px;
  padding: 24px;
}

.white-card {
  background-color: #ffffff;
  border-radius: 8px; /* Đúng bo góc 8px */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Elevation Level 1 */
  padding: 24px;
}

```

## 2. CHI TIẾT THAY ĐỔI THEO CẤP BẬC PHÔNG CHỮ & THÀNH PHẦN

### A. Vùng Header Trên Cùng (Lead Profile Header)

-   **Tên Lead:**

    -   _Hiện tại:_ Đang hiển thị text thô "Unnamed lead" cỡ chữ nhỏ.

    -   _Sửa thành:_ Đặt tên Lead (`Sarah Jenkins`) in đậm nổi bật: `font-size: 28px; font-weight: 700; color: #1a1c1e;`.

-   **Nhãn trạng thái (Badges):**

    -   _Hiện tại:_ Hiển thị hai tag chữ thường `new` và `medium` đặt lệch phía trên góc trái.

    -   _Sửa thành:_ Di chuyển các nhãn này sang ngay bên cạnh tên Lead. Định dạng thành các Badge vuông vắn: `font-size: 11px; font-weight: 700; border-radius: 4px; padding: 4px 8px;`.

        -   `Interested`: Chữ màu xanh lá cây trên nền xanh nhạt.

        -   `High Priority`: Chữ màu đỏ/hồng sẫm trên nền hồng nhạt.

-   **Nút hành động nhanh:**

    -   Đẩy hai nút bấm `Edit Profile` và `Email Lead` sang góc phải trên cùng. Nút `Email Lead` phải dùng màu chủ đạo `#0061a4` kèm icon bức thư màu trắng.


### B. Cột 1: Thông tin & Bất động sản quan tâm (25% Width)

-   **Contact Details & Preferences:**

    -   _Hiện tại:_ Đang phơi bày các ô input dạng text box trống (Email, Phone, Customer id...).

    -   _Sửa thành:_ Thay bằng hiển thị văn bản tĩnh sạch sẽ (`font-size: 14px; color: #1a1c1e;`). Các tiêu đề mục nhỏ như `CONTACT DETAILS`, `PREFERENCES` cấu hình: `font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #44474e;`.

-   **Khối Bất động sản quan tâm (Primary Interest):**

    -   _Thiếu sót:_ Giao diện hiện tại thiếu hoàn toàn phần này.

    -   _Bổ sung:_ Thêm một khối hiển thị hình ảnh tòa nhà thực tế có bo góc nhẹ. Đè một dải tag đen mờ chữ trắng ghi `Primary Interest`. Phía dưới ghi tên dự án (`The Apex Residency`) và một đường link tương tác `View Listing →` màu xanh dương.


### C. Cột 2: Hoạt động & Ghi chú (50% Width)

-   **Khối nhập ghi chú (Add Note or Log Activity):**

    -   _Hiện tại:_ Ô nhập note trải ngang toàn bộ màn hình một cách lãng phí.

    -   _Sửa thành:_ Thu gọn vào cột giữa. Thiết kế ô `textarea` gọn gàng (`font-size: 14px; border: 1px solid #d8dadc;`). Khi nhấn chọn (Focus), đổi màu đường viền sang xanh dương `#0061a4`. Nút `Save Note` đặt ở góc dưới bên phải hộp.

-   **Dòng thời gian (Activity History):**

    -   _Hiện tại:_ Đang hiển thị danh sách dạng bảng tĩnh "Status Change, Assignment" với các chuỗi ngày tháng ISO (2026-07-01...) rất khó đọc.

    -   _Sửa thành:_ Tái cấu trúc thành một trục dọc Timeline. Mỗi hoạt động (Thêm ghi chú, Đổi trạng thái, Gọi điện) được bọc trong một box xám nhạt chỉn chu, hiển thị ngày giờ thân thiện dạng `Today, 10:45 AM` hoặc `Yesterday, 3:12 PM`.


### D. Cột 3: AI Lead Score, Quick Actions & Tasks (25% Width)

-   **Widget Điểm số AI (AI Lead Score):**

    -   _Hiện tại:_ Đang là một hộp trống trải rộng lớn mang tên "Lead scoring".

    -   _Sửa thành:_ Thiết kế thành một widget phân tích sắc nét:

        -   Con số điểm `85` hiển thị kích thước lớn: `font-size: 36px; font-weight: 700; color: #0061a4;`. Phía sau là cụm chữ `/ 100`.

        -   Các dòng đánh giá bổ trợ phía dưới đi kèm các icon dấu tích xanh lá (`#2e7d32`) biểu thị trạng thái thành công như: `High budget match for Apex`, `Frequent portal activity`.

-   **Hành động nhanh (Quick Actions):**

    -   Bổ sung danh sách các nút thao tác nhanh dạng dòng chữ đi kèm icon trực quan bao gồm: `Create Appointment`, `Change Status`, `Reassign Lead`.

-   **Danh sách công việc (Tasks):**

    -   _Hiện tại:_ Ô tạo task đang bắt nhập liệu cồng kềnh với các trường input kéo dài dưới đáy trang.

    -   _Sửa thành:_ Thu gọn thành danh sách Task check-list phẳng. Mỗi công việc đi kèm một checkbox, nhãn thời hạn (`Due Today` màu đỏ, `Due Oct 18` màu xám). Thêm dấu cộng nhỏ `+` ở góc phải tiêu đề `TASKS` để mở pop-up thêm tác vụ nhanh thay vì làm form trực diện.