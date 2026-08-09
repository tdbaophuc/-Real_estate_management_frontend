
## 1. MÀN HÌNH DANH SÁCH (SYSTEM AUDIT LOGS)

_(Tham chiếu ảnh thiết kế: `...163352.png` | Ảnh hiện tại: `...163433.png`)_

### A. Sửa lỗi Dữ liệu & Bố cục chung

-   **Lỗi Text Concatenation (Dính chữ):** Cột Action hiện tại bị dính chữ (Ví dụ: `FILE_DOWNLOADEDNo IP`). Cột Actor cũng bị lỗi tương tự (`Adminadmin@realestate.local`). Cần tách bạch các trường dữ liệu này ra các cột tương ứng (Action riêng, IP riêng, Email ẩn đi hoặc tách xuống dòng phụ).

-   **Màu nền & Viền:** Toàn trang sử dụng nền trắng tràn viền rất khó nhìn. Cần đổi nền trang thành `#f7f9fb`. Đặt bảng dữ liệu và bộ lọc vào các thẻ Card màu trắng `#ffffff`, viền `#d8dadc`, bo góc `4px`.


### B. Header & Bộ lọc (Filter Bar)

-   **Tiêu đề:** Đổi thành **`Internal Audit Logs`** (`32px`, `Bold 700`). Thêm dòng phụ đề: `System activities and security events.` kèm nhãn `ADMIN CLEARANCE` màu vàng/cam nhạt.

-   **Nút hành động:** Ở góc phải trên cùng, thay thế nút Search/Reset hiện tại bằng 2 nút: `Export CSV` (Nền trắng) và `Advanced Filters` (Nền đen tuyền).

-   **Khu vực Bộ lọc:** Thay vì các ô input thô kệch dàn hàng ngang, hãy thiết kế lại thành một Card trắng bo góc.

    -   Chuyển các ô nhập liệu thành Dropdown chuyên nghiệp: `DATE RANGE` (Có icon lịch), `ACTOR (USER)`, `ACTION TYPE`. Thêm nút `Clear All` dạng text link ở góc phải.


### C. Bảng dữ liệu (Data Grid)

-   **Tiêu đề cột (Headers):** Định dạng lại toàn bộ: `11px`, `Bold (700)`, `Uppercase`, màu `#44474e`. Các cột chuẩn: `TIMESTAMP (UTC)`, `ACTOR`, `ACTION`, `RESOURCE TYPE`, `RESOURCE ID`, `IP ADDRESS`, `DETAILS`.

-   **Định dạng Dữ liệu (Row Data):**

    -   _Timestamp:_ Chuyển từ định dạng tiếng Việt (`18 thg 7, 2026`) sang chuẩn quốc tế (`YYYY-MM-DD HH:mm:ss`).

    -   _Actor:_ Thêm Avatar hình tròn nhỏ chứa 2 chữ cái đầu của tên (Ví dụ: `SJ` trên nền xanh dương) đặt cạnh tên người dùng.

    -   _Action:_ **Bắt buộc** chuyển text thường thành các **Status Badges**. `UPDATE` (Chữ/Nền xanh dương), `CREATE`/`APPROVE` (Xanh lá), `LOGIN_FAILED` (Đỏ). Bo góc badge `4px`.

    -   _Resource ID:_ Sử dụng font **Monospace (JetBrains Mono)**, kích thước `12px`, màu xanh nhấn `#0061a4` để thể hiện đây là mã hệ thống.

    -   _Details:_ Thay nút "Mắt + Detail" thô kệch bằng một icon code brackets `< >` tinh tế.

-   **Phân trang:** Chuyển bộ phân trang xuống góc dưới bên phải, dạng các ô vuông nhỏ bo góc `4px`. Thêm dòng `Showing 1 to 5 of X entries` ở góc dưới bên trái.


## 2. MÀN HÌNH CHI TIẾT (AUDIT LOG DETAIL)

_(Tham chiếu ảnh thiết kế: `...163402.png` | Ảnh hiện tại: `...163449.png`)_

👉 **Đập bỏ hoàn toàn Drawer bên phải.** Xây dựng một trang mới với bố cục Grid chia 2 cột (Trái: ~70%, Phải: ~30%), khoảng cách (gap) `24px`.

### A. Thanh điều hướng & Header

-   Thêm Breadcrumb: `Admin > Audit Logs > Entry #LOG-90210`.

-   Tiêu đề trang: Nút Back `<-` kèm chữ **`Audit Log Detail`** (`32px`, `Bold 700`). Bên cạnh là Badge trạng thái (VD: `SUCCESS` màu xanh lá). Có nút `Export Log` ở góc phải.


### B. Cột Trái (Main Content)

-   **Card 1: Event Metadata**

    -   Hiển thị theo dạng lưới 2x3. Các Label (`12px`, `Bold 700`, `#74777f`) bao gồm: `TIMESTAMP`, `ACTOR (USER)`, `ACTION TYPE`, `RESOURCE TYPE`, `RESOURCE ID` (Font Monospace xanh), `IP ADDRESS`.

-   **Card 2: Data Changes (Quan trọng nhất)**

    -   Đây là nơi hiển thị JSON Diff. Chia làm 2 cột song song: `Previous State` (Trạng thái cũ) và `New State` (Trạng thái mới).

    -   _Typography JSON:_ Phải dùng font **JetBrains Mono** hoặc Consolas, kích thước `12px`, `line-height: 1.5`.

    -   _Highlighting (Bắt buộc):_ Dữ liệu cũ bị xóa/thay đổi tô nền đỏ nhạt (chữ đỏ). Dữ liệu mới được thêm vào tô nền xanh lá nhạt (chữ xanh lá).


### C. Cột Phải (Sidebar)

-   **Card 1: Actor Context**

    -   Hiển thị Avatar lớn, Tên người dùng và Chức vụ (Ví dụ: `Senior Asset Manager`).

    -   Hiển thị các thông tin phụ: `USER ID`, `DEPARTMENT`, `LOCATION`. Căn chỉnh Label bên trái, Value bên phải. Thêm nút `View Full Profile` ở dưới cùng.

-   **Card 2: System Info**

    -   Hiển thị trạng thái bảo mật kèm Icon: `MFA Verified` (Icon khiên bảo vệ), `API Source` (Tên thiết bị/trình duyệt).