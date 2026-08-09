
### I. CHUẨN HÓA UI TOÀN CỤC (GLOBAL STYLES) CẦN LÀM NGAY

1.  **Màu nền:** Đổi màu nền của thẻ `<body>` hoặc thẻ bao ngoài cùng (Main Container) thành màu xám nhạt **`#f7f9fb`**.

2.  **Khối Nội Dung (Cards):** Bất kỳ nhóm dữ liệu nào cũng phải được bọc trong một thẻ div có nền trắng **`#ffffff`**, viền **`1px solid #d8dadc`** và bo góc **`border-radius: 4px`**. _Tuyệt đối không để nội dung trôi nổi trên nền xám._

3.  **Phông chữ:** Áp dụng đồng bộ font **`Inter`**.


### II. CHI TIẾT TÁI CẤU TRÚC THEO TỪNG MÀN HÌNH

#### 1. Màn hình Internal Listing Management (Danh sách Tin đăng)

_(Tham chiếu thiết kế: `Screenshot 2026-07-22 144259.png`)_

**Tình trạng hiện tại (`...143736.png`):** Bạn đang dùng các thẻ (Card) xếp chồng lên nhau theo chiều dọc. Các thẻ này quá to, quá nhiều khoảng trắng, chữ quá nhỏ. **Hành động chỉnh sửa:** Đập bỏ layout Card xếp chồng, chuyển hoàn toàn sang dạng **Data Table (Bảng dữ liệu)**.

-   **Header:** Thêm nút `+ New Listing` (Màu xanh `#0061a4`, chữ trắng, bo góc 4px) và nút `Export` (Nền trắng viền xám) ở góc trên bên phải.

-   **Filter Bar (Thanh lọc):** Gom bộ lọc thành 1 hàng ngang nằm trong một khối nền trắng. Chia làm 3 cột rõ ràng: `STATUS` (Dropdown), `PURPOSE` (Dropdown), và `PROPERTY ID` (Ô Search).

-   **Bảng Dữ Liệu (Bắt buộc làm chuẩn):**

    -   **Tiêu đề cột (Headers):** `11px | Bold | Uppercase | #44474e`. Các cột gồm: `PROPERTY ID`, `TITLE & LOCATION`, `STATUS`, `PURPOSE`, `ASKING PRICE`, `CREATOR`, `ACTIONS`.

    -   **Mã Property ID:** Phải dùng font `13px Bold` và màu xanh `#0061a4` (thể hiện đây là link có thể bấm vào).

    -   **Cột Status:** Phải dùng Badge bo góc 4px (Ví dụ: `Published` màu xanh lá, `Pending Review` màu vàng cam, `Draft` màu xám).

    -   **Cột Actions:** Căn phải. Hiển thị các text link hành động nhanh như `Submit for Review` (Màu xanh), `Publish` (Màu xanh lá) / `Reject` (Màu đỏ), hoặc icon 3 chấm `...`.


#### 2. Màn hình Create New Listing (Soạn thảo Tin đăng mới)

_(Tham chiếu thiết kế: `Screenshot 2026-07-22 144318.png`)_

**Hành động chỉnh sửa:** Không sử dụng form tràn 100% chiều rộng. Phải chia bố cục màn hình thành 2 cột **(Grid 70/30)**.

-   **Cột Trái (70% - Form Content):**

    -   Chia form thành các Card nền trắng riệng biệt: `Target Asset`, `Listing Content`, `Pricing & Terms`. Tiêu đề các Card này dùng font `16px Bold`.

    -   Các ô Input: Chiều cao chuẩn `40px`, viền xám `#d8dadc`, bo góc `4px`.

    -   Label (Nhãn input): `12px Bold`.

-   **Cột Phải (30% - Live Preview):**

    -   Tạo một cột dính (Sticky Sidebar) nền xám hoặc trắng chứa giao diện Xem trước (Preview). Khi người dùng gõ text bên trái, giao diện bên phải sẽ cập nhật realtime để họ thấy tin đăng lúc lên web sẽ trông như thế nào.

-   **Top Actions:** Nút `Save Draft` và `Publish Listing` đặt cố định ở góc trên bên phải.


#### 3. Màn hình Listing Detail & Workflow (Chi tiết Tin đăng)

_(Tham chiếu thiết kế: `Screenshot 2026-07-22 144331.jpg`)_

**Tình trạng hiện tại (`...143744.png`):** Bạn đang dùng một thanh quy trình (Review and publish lifecycle) khổng lồ nằm ngang cắt ngang màn hình, các thông tin bên dưới lại dàn trải 100% màn hình rất rời rạc. **Hành động chỉnh sửa:** Xóa thanh quy trình ngang. Chia lại layout thành **Grid 70/30**.

-   **Header:** Tiêu đề tin đăng cực to (`32px Bold`). Kế bên là Badge trạng thái (`Pending Review`). Góc phải là Toggle `Preview Public View`, nút `Reject` và `Approve`.

-   **Cột Trái (70% - Nội dung tin):**

    -   **Khối Ảnh:** Dùng layout 1 ảnh lớn ở trên, 3 ảnh nhỏ ở dưới.

    -   **Property Details:** Bỏ các hộp viền xám thừa thãi. Xếp các thông số thành 1 hàng ngang (Asset Type, Total RSF, Asking Rate, Lease Type) với Label chữ nhỏ in hoa màu xám, Value in đậm màu đen. Bên dưới là đoạn Text Marketing.

-   **Cột Phải (30% - Metadata & Workflow):**

    -   Khối 1 - KPI: Lượt Views và Favorites.

    -   Khối 2 - Team Roles: Ai tạo tin, ai duyệt tin (Có Avatar nhỏ).

    -   **Khối 3 - Workflow History:** Chuyển thanh quy trình ngang cũ thành một **Timeline trục dọc** ở đây. Dùng các dấu chấm và đường kẻ dọc mờ để hiển thị lịch sử: Tin tạo lúc nào -> Cập nhật lúc nào -> Gửi duyệt lúc nào.


#### 4. Màn hình Listing Review Queue (Hàng đợi Phê duyệt)

_(Tham chiếu thiết kế: `Screenshot 2026-07-22 144337.png`)_

Đây là một màn hình chuyên dụng cho Manager mà hệ thống hiện tại của bạn chưa có, cần phải xây mới:

-   **Layout:** Bảng danh sách (Table) có hỗ trợ Checkbox ở đầu mỗi hàng để thao tác hàng loạt (Bulk Actions: `Approve Selected` / `Reject Selected`).

-   **Cấu trúc cột so sánh (Cực kỳ quan trọng):**

    -   Cột 1: Mã ID, Trạng thái, và Hình ảnh Thumbnail + Tên tài sản.

    -   Cột 2: `PROPOSED LISTING CONTENT`: Hiển thị tiêu đề và mô tả do Agent đề xuất.

    -   **Cột 3: `FINANCIALS (MASTER VS PROPOSED)`:** Đây là điểm ăn tiền. Phải hiển thị 2 dòng đối chiếu: Giá gốc (Master Rent) màu xám mờ so sánh với Giá đề xuất xuất bản (Proposed) màu xanh lá. Nếu giá đề xuất chênh lệch sai so với quy định, bôi chữ màu Đỏ (`Variance: $1,500/mo`).

    -   Cột 4: Cụm nút bấm duyệt nhanh từng dòng (`Approve` / `Reject / Edit`).