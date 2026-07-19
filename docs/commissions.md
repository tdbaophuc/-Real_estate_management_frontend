
# ĐẶC TẢ TÁI CẤU TRÚC GIAO DIỆN: COMMISSIONS MODULE

**VẤN ĐỀ CỦA GIAO DIỆN HIỆN TẠI:** Giao diện cũ đang nhồi nhét cả bộ lọc tìm kiếm, bảng danh sách giao dịch, và form tạo/sửa chính sách hoa hồng vào cùng **một trang duy nhất**. Điều này gây quá tải thông tin, vi phạm phân quyền (RBAC) và sai lệch hoàn toàn với thiết kế chuẩn.

**Hành động cốt lõi:** Xóa bỏ trang này. Thiết lập cấu trúc Routing mới với Sidebar mở rộng và 3+1 màn hình riêng biệt.

## 1. CẬP NHẬT SIDEBAR NAVIGATION (PHÂN QUYỀN RBAC)

Thay vì một nút "Commissions" click thẳng vào trang, hãy chuyển nó thành một Menu Dropdown (Accordion) chứa các menu con sau:

1.  **My Commissions (Hoa hồng của tôi):**

    -   _Quyền truy cập:_ Tất cả người dùng (Đặc biệt là Agent).

    -   _Route:_ `/commissions/my`

2.  **Commissions Management (Quản lý giao dịch):**

    -   _Quyền truy cập:_ Admin / Kế toán / Quản lý.

    -   _Route:_ `/commissions/manage`

3.  **Commission Rules (Chính sách & Quy tắc):**

    -   _Quyền truy cập:_ Admin / Giám đốc.

    -   _Route:_ `/commissions/rules`


## 2. CHI TIẾT TÁI CẤU TRÚC TỪNG MÀN HÌNH

### A. Màn hình "My Commissions" (Agent View)

_(Tham chiếu ảnh: `...152247.png` | API: `GET /api/v1/commissions/my`)_

-   **Bố cục chung:** Nền Workspace `#f7f9fb`, khoảng cách padding `24px`.

-   **Thống kê (KPI Widgets):** Thêm 3 thẻ trắng `#ffffff` viền `#d8dadc` bo góc `4px`.

    -   Hiển thị: `TOTAL EARNED YTD`, `PENDING PAYMENT`, `PAID THIS MONTH`.

    -   Font số tiền: `28px | Bold (700) | #1a1c1e`.

-   **Khu vực Danh sách:**

    -   _Tabs:_ Thay thế bộ lọc trạng thái truyền thống bằng thanh Tab ngang tinh tế (`All`, `Pending`, `Approved`, `Paid`).

    -   _Bộ lọc phụ:_ Căn phải, gồm ô Search (`Filter by ID or Property`) và nút Export.

    -   _Bảng dữ liệu:_ Map data từ API.

        -   Cột `TRANSACTION / PROPERTY`: Lấy từ `transactionCode`. Font `14px Bold #0061a4`.

        -   Cột `BENEFICIARY`: Lấy `beneficiaryName`, kèm Avatar hình tròn nhỏ (viết tắt 2 chữ cái đầu).

        -   Cột `AMOUNT ($)`: Lấy `amount` (định dạng tiền tệ).

        -   Cột `STATUS`: Dùng Badge bo góc `4px` (`PENDING`: Vàng nhạt, `APPROVED`/`PAID`: Xanh lá nhạt).


### B. Màn hình "Commission Management" (Admin View)

_(Tham chiếu ảnh: `...151616.png` | API: `GET /api/v1/commissions` & `PATCH .../mark-paid`)_

-   **Thống kê (KPI Row):** Tương tự Agent nhưng thay đổi tiêu đề thành `TOTAL PENDING COMMISSIONS`, `YTD PAID OUT`, `PROCESSING TIME (AVG)`.

-   **Bộ lọc (Filter Bar):**

    -   Thay thế hàng ngang mờ nhạt hiện tại bằng các dropdown rõ ràng: `Beneficiary User`, `Status`, và input `Transaction ID` (`e.g. TRX-2023...`). Nút `Apply Filters` nền xám nhẹ.

-   **Bảng dữ liệu & Thao tác (Action):**

    -   Hiển thị danh sách tổng.

    -   **Nút "Mark Paid":** Ở cuối các hàng có trạng thái `PENDING` hoặc `APPROVED`, hiển thị nút chữ `Mark Paid` màu xanh `#0061a4`.

    -   **Tương tác (Interaction):** Khi click "Mark Paid", KHÔNG chuyển trang mà mở một **Modal/Drawer** (với lớp phủ overlay `#00000040`). Modal này chứa form nhập liệu để gọi API `PATCH`:

        -   `Payment Reference` (Mã giao dịch ngân hàng).

        -   `Paid Date` (Ngày thanh toán).

        -   `Notes` (Ghi chú).


### C. Màn hình "Commission Rules" (List)

_(Tham chiếu ảnh: `...151641.png` | API: `GET /api/v1/commission-rules`)_

-   **Bố cục:** Tương tự các trang quản lý với KPI Row (`Active Rules`, `Pending Effective`, `Highest Priority`).

-   **Bảng dữ liệu:**

    -   Cột `Rule Name` (`name`), `Type` (`calculationType`), `Rate / Amount` (`rate` hoặc `fixedAmount`), `Transaction Type` (`transactionType`), `Priority` (`priority`), `Status` (`active`).

    -   Cột `Actions`: Chứa Icon hình cây bút (Edit) để mở trang Update.

-   **Nút hành động chính:** Nút `+ Create New Rule` góc trên bên phải, click vào sẽ chuyển hướng sang màn hình Form (Phần D).


### D. Màn hình Form "Create/Update Commission Rule"

_(Tham chiếu ảnh: `...151811.png` | API: `POST / PUT /api/v1/commission-rules`)_

**Yêu cầu bắt buộc:** Form này phải được bóc tách hoàn toàn khỏi màn hình danh sách, thiết kế theo dạng **Focused Workspace** (Khu vực nhập liệu tập trung). Cấu trúc form chia làm 3 Section (Card trắng, viền `#d8dadc`, bo góc `4px`):

1.  **Card 1: Basic Info (Thông tin cơ bản)**

    -   Tiêu đề Card: `16px Bold` kèm Icon.

    -   Inputs: `Rule Code` (`code`), `Rule Name` (`name`), `Transaction Type` (`transactionType` - Dropdown: SALE/LEASE).

    -   Toggle Switch: `Active Status` (`active` - boolean).

2.  **Card 2: Formula & Conditions (Công thức & Điều kiện)**

    -   Inputs: `Calculation Type` (`calculationType` - Dropdown: PERCENTAGE/FIXED).

    -   Inputs tương quan: Nếu chọn PERCENTAGE thì hiện ô nhập `%` (`rate`). Nếu chọn FIXED thì hiện ô nhập tiền `$`, chọn loại tiền (`currency`).

    -   Inputs: `Execution Priority` (`priority` - Dạng số).

    -   Inputs: `Min Transaction Value` và `Max Transaction Value` (`minTransactionValue`, `maxTransactionValue`).

3.  **Card 3: Validity & Details (Hiệu lực & Chi tiết)**

    -   Inputs: `Effective From` và `Effective To` (`effectiveFrom`, `effectiveTo` - Datepicker).

    -   Textarea: `Description` (`description` - Textarea lớn).

4.  **Action Footer:** Nút `Cancel` (viền không màu) và `Save Policy` (màu `#0061a4`).