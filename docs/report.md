
### 1. BỐ CỤC & PHÂN VÙNG (LAYOUT & GRID)

**Hiện tại:** Các báo cáo (Revenue, Leads, Transactions, Commissions) bị xẻ nhỏ thành từng dải ngang chiếm 100% màn hình, chứa các ô nhập ngày tháng trùng lặp và biểu đồ rỗng. **Cần thay đổi:** Đập bỏ hoàn toàn cấu trúc dải ngang này và chia lại thành 3 hàng (Rows) chính:

-   **Hàng 1 (Header):**

    -   Xóa bỏ thanh màu xanh khổng lồ `Apply range`.

    -   Bên trái: Đặt Tiêu đề trang và dòng mô tả phụ.

    -   Bên phải: Gom bộ lọc ngày tháng (Date Range Picker) thành một nút bấm gọn gàng nền trắng, đặt cạnh hai nút chức năng mới là `Export PDF` và `Export CSV`.

-   **Hàng 2 (KPI Scorecards):**

    -   Thay vì để rải rác trong từng phần, hãy tạo **4 thẻ thống kê (Cards)** xếp hàng ngang sát nhau (khoảng cách `gap: 24px`): _Total Revenue, Commissions Disbursed, Total Transactions, Lead Conversion Rate_.

-   **Hàng 3 (Analytics - 70/30 Split):**

    -   Xóa bỏ các khối "No chart data" vô nghĩa.

    -   Thiết lập một grid chia tỷ lệ 70/30:

        -   _Bên trái (70%):_ Đặt biểu đồ đường kép (Revenue & Commission Trends).

        -   _Bên phải (30%):_ Đặt biểu đồ tròn (Asset Class Dist.).

-   **Hàng 4 (Data Table):**

    -   Gom tất cả các bảng rỗng hiện tại thành một Bảng duy nhất dưới cùng chiếm 100% chiều rộng mang tên **Agent Performance Ledger**.


### 2. HỆ THỐNG MÀU SẮC & HÌNH KHỐI (COLOR & SHAPES)

**Hiện tại:** Màu nền trắng tràn viền khiến các khối thông tin không được tách biệt rõ ràng, thiếu viền và bo góc chuẩn. **Cần thay đổi:**

-   **Nền tổng thể:** Đổi màu nền (Background) của toàn bộ trang (phía sau các thẻ) thành màu xám nhạt `#f7f9fb`.

-   **Card & Bảng:** Đặt màu nền của tất cả các khối (KPI, Biểu đồ, Bảng) thành màu trắng `#ffffff`.

-   **Viền & Bo góc:** Đồng bộ áp dụng thuộc tính `border: 1px solid #d8dadc;` và `border-radius: 4px;` cho mọi thẻ nội dung.

-   **Màu sắc dữ liệu xu hướng (KPI Trends):**

    -   Sử dụng màu Xanh lá `#1ea446` cho các mũi tên và chỉ số tăng trưởng (Ví dụ: `↗ +12.4%`).

    -   Sử dụng màu Đỏ `#d92d20` cho các chỉ số sụt giảm (Ví dụ: `↘ -1.5%`).

-   **Màu Biểu đồ:** Sử dụng hệ màu Xanh dương chủ đạo `#0061a4` và các sắc độ nhạt hơn cho biểu đồ tròn/đường, loại bỏ màu mặc định của thư viện biểu đồ.


### 3. PHÔNG CHỮ & TYPOGRAPHY (FONT & SCALE)

**Hiện tại:** Phông chữ mặc định nhỏ, nhạt nhòa, thiếu sự phân cấp chính/phụ (Visual Hierarchy). **Cần thay đổi:** Đồng bộ toàn bộ sang font **Inter** với các thông số sau:

-   **Header:** Tiêu đề trang đổi thành `Reports & Revenue` với kích thước `32px`, `Bold (700)`.

-   **Thẻ KPI:**

    -   Nhãn (Label): `11px`, `Bold (700)`, `Uppercase`, màu xám `#44474e`.

    -   Giá trị số (Value): Kích thước lớn `32px`, `Bold (700)`, màu đen xám `#1a1c1e` (Ví dụ: **$14.2M**).

-   **Bảng dữ liệu (Table):**

    -   Tiêu đề bảng (`Agent Performance Ledger`): `16px`, `Bold (700)`.

    -   Văn bản thông thường (Tên, Vùng): `13px`, `Regular (400)`.

    -   Dữ liệu tiền tệ/doanh thu: Phải in đậm `13px`, `Bold (700)`, màu `#1a1c1e`.

-   **Nhãn trạng thái (Status Badges):** Trong cột Status của bảng, thiết kế các nhãn như `TOP TIER`, `STANDARD`, `REVIEW` với font `11px`, `Bold (700)` và bo góc `4px` kèm màu nền nhạt tương ứng.


### 4. QUY CÁCH TƯƠNG TÁC (INTERACTION & CLEANUP)

-   **Dọn dẹp form thừa:** Gỡ bỏ toàn bộ các ô nhập `From` và `To` lẻ tẻ bên trong từng phần báo cáo. Chỉ sử dụng duy nhất một bộ lọc ngày tháng ở trên cùng góc phải.

-   **Thanh tìm kiếm:** Bổ sung ô input `Filter agents...` nằm ở góc trên bên phải của bảng Data Table.

-   **Phân trang (Pagination):** Thêm thanh điều hướng phân trang (1, 2, 3...) ở góc dưới cùng bên phải của bảng để quản lý danh sách nhân sự dài.

-   **Hover Table:** Đảm bảo khi di chuột qua các hàng của bảng nhân sự, hàng đó sẽ đổi sang nền màu xám nhạt `#f2f4f6`.