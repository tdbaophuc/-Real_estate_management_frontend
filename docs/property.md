
### 1. CẬP NHẬT GIAO DIỆN CHUNG (GLOBAL STYLES)

Trước khi đi vào từng trang, bạn cần chuẩn hóa các thuộc tính CSS toàn cục đang bị sai lệch:

-   **Màu nền:** Toàn bộ nền Workspace (ngoài các thẻ nội dung) phải được đổi sang màu xám nhạt `#f7f9fb`. Hiện tại giao diện của bạn đang dùng màu trắng tràn viền khiến các khối thông tin bị chìm vào nhau.

-   **Thẻ nội dung (Cards):** Bọc các nhóm thông tin bằng thẻ có nền trắng `#ffffff`, viền mảnh `1px solid #d8dadc`, và bo góc chuẩn `4px`.

-   **Đổ bóng:** Loại bỏ các hiệu ứng đổ bóng đậm, chỉ sử dụng Elevation Level 1 rất nhẹ (Flat design).


### 2. MÀN HÌNH DANH SÁCH (PROPERTIES LIBRARY)

_(Mục tiêu: Đạt chuẩn như `Screenshot 2026-07-19 172201.png`)_

Giao diện hiện tại (`Screenshot 2026-07-19 172329.png`) đang thiếu cấu trúc phân khối. Cần thực hiện các bước sau:

-   **Header & Bộ lọc:**

    -   Gom thanh tìm kiếm và các dropdown hiện tại vào trong một Thẻ (Card) nền trắng. Bố cục lại thành 1 hàng ngang chứa 4 Dropdown: `Location`, `Type`, `Purpose`, `Status` kèm nút `Clear Filters`.

-   **Bảng dữ liệu (Data Table):**

    -   **Tiêu đề cột:** Cấu hình phông chữ `11px`, `Bold (700)`, in hoa (`Uppercase`).

    -   **Mã tài sản (Code):** Phải định dạng màu xanh dương `#0061a4` và font `13px Bold` để báo hiệu đây là link có thể nhấp vào.

    -   **Giá tiền:** Cập nhật font thành `14px Bold`.

    -   **Badge Trạng thái:** Chuyển từ dạng viên thuốc (bo tròn hoàn toàn) hiện tại sang dạng bo góc `4px`.

    -   **Cột Actions:** Thay thế nút `View` có viền thô kệch hiện tại bằng một chữ `View` màu xanh dương tối giản.

    -   **Tương tác:** Thêm hiệu ứng hover đổi màu nền hàng sang `#f2f4f6`.


### 3. MÀN HÌNH CHI TIẾT TÀI SẢN (PROPERTY DETAIL)

_(Mục tiêu: Đạt chuẩn như `Screenshot 2026-07-19 172213.jpg`)_

**Lỗi nghiêm trọng:** Màn hình chi tiết hiện tại (`Screenshot 2026-07-19 172448.jpg`, `Screenshot 2026-07-19 172458.png`) đang nhồi nhét tất cả hình ảnh khổng lồ, form quản lý ảnh, form tài liệu pháp lý và các thông số vào một trang dài sọc dọc. Bạn **bắt buộc phải chia Tab**.

-   **Cấu trúc Lưới (Layout):** Chia vùng nội dung dưới tiêu đề thành cấu trúc 70/30.

-   **Thanh Tabs (Tabs Section):** Tạo thanh Tab ngang gồm: `Overview`, `Images`, `Legal Documents`, `Amenities`, `History` để phân loại thông tin.

-   **Tab Overview (Tổng quan):**

    -   _Khu vực Hero Gallery (Bên trái - 70%):_ Hiển thị 1 ảnh lớn và 4 ảnh nhỏ (thumbnail) bên dưới. Xóa bỏ bức ảnh kéo dãn dị dạng hiện tại.

    -   _Khu vực Key Facts:_ Tổ chức lại các thông số (Giá, Diện tích, Phòng ngủ...) với Label màu xám `#74777f` (`12px Bold`) và Giá trị in đậm (`14px Bold`).

    -   _Sidebar (Bên phải - 30%):_ Đưa Bản đồ (Map), Các thực thể liên kết (Linked Entities), và Tiện ích (Amenities) vào cột này.


### 4. QUẢN LÝ HÌNH ẢNH (IMAGES MANAGEMENT)

_(Mục tiêu: Đạt chuẩn như `Screenshot 2026-07-19 172238.png`)_

Di chuyển toàn bộ form "Image management" lộn xộn hiện tại vào bên trong Tab **Images**.

-   **Cột Trái (Upload Zone):**

    -   Tạo khu vực kéo thả file (Drag & drop) với hướng dẫn `14px Bold`.

    -   Thêm thanh tiến độ hiển thị dung lượng "Storage Usage" (Ví dụ: `45 MB Used / 100 MB Limit`).

-   **Cột Phải (Image Grid):**

    -   Hiển thị ảnh đã tải lên theo dạng lưới 2 cột.

    -   Mỗi ảnh nằm trong một Card, phía dưới ảnh có ô Input nhập "Alt Text" với font `13px Regular`.


### 5. MÀN HÌNH THÊM MỚI (ADD NEW PROPERTY)

_(Mục tiêu: Đạt chuẩn như `Screenshot 2026-07-19 172256.png`)_

-   **Bố cục Form:** Áp dụng quy trình nhập liệu theo bước (Multi-step form).

-   **Thanh tiến độ (Stepper):** Đặt dưới tiêu đề trang dòng chữ báo hiệu bước hiện tại (VD: `Step 1 of 5: Basic Information`) cùng một thanh progress bar mỏng.

-   **Căn giữa:** Form nhập liệu không được kéo tràn màn hình mà phải nằm gọn trong một Card được căn giữa màn hình.

-   **Typography:** Nhãn trường (Field Labels) phải dùng font `12px Bold` màu `#1a1c1e`. Mọi input box phải có góc bo `4px`.