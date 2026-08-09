
### PHẦN 1: TRANG LANDING PAGE

_(Tham chiếu thiết kế: `Screenshot 2026-07-23 150313.jpg` | Hiện tại: `image_de276e.jpg`)_

Giao diện hiện tại đang trống rỗng, thiếu hình ảnh, sai màu sắc và sai cấu trúc lưới. Bạn cần thực hiện các thay đổi sau:

**1. Hero Section (Phần trên cùng)**

-   **Hình nền & Overlay:** Giao diện hiện tại chỉ là một mảng màu xanh đen trơn. **Cần thay đổi:** Thêm hình ảnh nền tòa nhà kiến trúc full màn hình (chiều cao ~720px). Đè lên trên là một lớp overlay gradient tối màu để chữ màu trắng nổi bật.

-   **Typography (Tiêu đề):**

    -   Đưa nội dung ra **chính giữa (Center-aligned)** thay vì căn trái như hiện tại.

    -   Kích thước Tiêu đề chính (`Find Your Next...`) tăng lên **56px | Bold (700)**, màu trắng `#ffffff`.

    -   Tiêu đề phụ: **18px | Regular (400)**, màu xám nhạt.

-   **Thanh tìm kiếm (Search Bar Card):**

    -   **Xóa bỏ** hai nút bấm ("Search listings", "Agent portal") lạc lõng hiện tại.

    -   **Thêm mới:** Tạo một khối Card màu trắng `#ffffff`, bo góc 8px, đổ bóng sâu (`box-shadow: 0 4px 20px rgba(0,0,0,0.1)`). Khối này phải chứa các ô Dropdown (Location, Property Type) và nút Search màu `#081425`.

    -   **Vị trí:** Đặt khối Search này nằm đè (floating) lên ranh giới giữa ảnh Hero và phần nền bên dưới.


**2. Trust Bar (Thanh chỉ số niềm tin)**

-   **Cần thêm mới:** Hiện tại đang bị thiếu khối này ngay dưới Hero. Cần tạo một Section nền xanh nhạt `#eef4ff` chia làm 3 cột đều nhau (`142+ ACTIVE ASSETS`, `$4.2B...`, `15+ COUNTRIES`).

-   Sử dụng đường kẻ dọc tinh tế màu Soft Blue `#ccdbf2` để ngăn cách các cột.


**3. Khối Danh sách Bất động sản (Featured Opportunities)**

-   **Layout Lưới (Grid):** Đổi từ lưới 4 cột hiện tại thành **Lưới 3 cột** (Desktop) với `gap: 24px`.

-   **UI Thẻ (Card UI):** Các thẻ hiện tại quá sơ sài và dùng icon thay vì ảnh.

    -   Cần thêm vùng chứa hình ảnh thực tế (hoặc ảnh placeholder xám bo góc) ở nửa trên của thẻ.

    -   Thêm Badge "New Listing" nổi trên ảnh.

    -   **Nội dung thẻ:** Định dạng Tên (`20px Bold`), Giá nằm đối diện. Địa chỉ màu xám `#64748b` `14px`.

    -   **Footer Thẻ:** Thêm một hàng dưới cùng chia 3 cột nhỏ chứa thông số (Ví dụ: Icon + Class A, Icon + Diện tích).

    -   Viền thẻ: `1px solid #e2e8f0`.


**4. Footer (Chân trang)**

-   Cấu trúc lại thành 4 cột rõ ràng: Brand (Logo + mô tả), Services, Company, Contact. Nền `#f8f9ff`.


### PHẦN 2: TRANG CHI TIẾT & HẸN XEM NHÀ (LISTING DETAIL)

_(Hiện tại: `image_de2809.png`)_

Trang này hiện đang là một mảng trắng khổng lồ, bố cục bị vỡ và các form liên hệ bị xếp chồng lên nhau quá dài. Dù chưa có thiết kế mẫu cụ thể, nhưng dựa trên ngôn ngữ thiết kế chung, bạn **bắt buộc phải tái cấu trúc theo Grid 2 cột**:

**1. Bố cục tổng thể (Layout Grid)**

-   Chia trang thành 2 cột: **Cột Trái (Chiếm 65-70%)** dành cho Hình ảnh và Thông tin chi tiết. **Cột Phải (Chiếm 30-35%)** làm thanh Sticky Sidebar chứa Form liên hệ.

-   Áp dụng Container chuẩn (chiều rộng tối đa 1440px, padding hai bên 60px). Nền trang `#f8f9ff`.


**2. Cột Trái: Hình ảnh & Thông tin chi tiết**

-   **Hero Image (Vùng ảnh):** Thay thế khoảng trống "No images" khổng lồ bằng một khung ảnh tỷ lệ 16:9. Nếu không có ảnh, dùng nền `#e2e8f0` kèm icon camera ở giữa, bo góc 8px.

-   **Header Thông tin:** Đưa Giá tiền (`85.000.000 đ`) lên trên, nằm ngay dưới hoặc cạnh Tiêu đề ("An Phu Garden Villa for Rent"). Sử dụng font `32px Bold` màu `#081425`.

-   **Key Facts (Thông số chính):** Gom các text trôi nổi (310m2, 4 bedrooms, 4 bathrooms) thành một hàng ngang (Row) chứa các Card nhỏ nền trắng hoặc icon đi kèm để dễ nhìn.

-   **Description & Amenities:** Tạo các Tiêu đề mục (Section Titles) `20px Bold`. Căn lề và tạo khoảng cách (margin) rộng rãi, thoáng đãng.


**3. Cột Phải: Sidebar & Form Liên hệ (Gọn gàng lại)**

-   **Tình trạng hiện tại:** Các form "Assigned agent", "Send a question", "Request appointment" đang bị xếp chồng dọc thành một dải rất dài và thô.

-   **Cách khắc phục:**

    -   Đưa toàn bộ khu vực này vào một khối **Card nền trắng `#ffffff`**, viền `#e2e8f0`, đổ bóng mờ, bo góc 8px.

    -   **Sử dụng Tabs (Thẻ chuyển đổi):** Thay vì hiển thị cả 2 form cùng lúc, hãy tạo 2 Tab ngang: `[ Đặt lịch xem ]` và `[ Gửi câu hỏi ]`. Người dùng bấm tab nào sẽ hiện form đó.

    -   **UI Input:** Ô nhập liệu dùng nền xám nhạt `#f8fafc`, viền xám nhạt, chiều cao ~40px.

    -   **Nút Bấm (Submit Button):** Sử dụng màu nền đặc `#081425`, chữ trắng, bo góc 4px, font `14px Bold`. Nút phải rộng 100% (width full) của form.