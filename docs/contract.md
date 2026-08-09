# ĐẶC TẢ TÁI CẤU TRÚC GIAO DIỆN: QUẢN LÝ HỢP ĐỒNG (CONTRACT MANAGEMENT)

**VẤN ĐỀ NGHIÊM TRỌNG NHẤT CỦA GIAO DIỆN HIỆN TẠI:**
Giao diện hiện tại (`image_e00df0.png`) đang gộp chung **Form tạo mới** và **Danh sách/Bộ lọc** vào cùng một màn hình (Single-page monolithic). Điều này đi ngược hoàn toàn với triết lý thiết kế UX của hệ thống.
👉 **Hành động bắt buộc:** Phải tách dứt điểm thành 2 màn hình (routes) hoàn toàn riêng biệt: **1. Contract List View** và **2. New Contract Creation Form**.

---

## PHẦN 1: MÀN HÌNH DANH SÁCH HỢP ĐỒNG (CONTRACT LIST VIEW)
*(Tham chiếu thiết kế: `Screenshot 2026-07-18 152150.png`)*

### 1. Bố cục & Hình khối (Layout & Spacing)
*   **Màu nền & Khoảng cách:** Xóa bỏ nền trắng toàn trang. Áp dụng nền Workspace `#f7f9fb` với `padding: 24px;`.
*   **Cấu trúc Lưới xếp chồng:**
    *   Tầng 1: Page Header (Tiêu đề & Nút Tạo mới).
    *   Tầng 2: Bộ lọc (Filter Card) nằm trên nền trắng.
    *   Tầng 3: Bảng dữ liệu (Data Table) chiếm 100% chiều rộng.
    *   Tầng 4: 4 Thẻ KPI (KPI Cards) nằm ngang ở dưới cùng.

### 2. Chi tiết các thành phần cần thay đổi
*   **Header & Nút hành động chính:**
    *   Sửa tiêu đề thành **`Contracts`** (`32px`, `Bold 700`, màu `#1a1c1e`). Thêm dòng phụ đề màu xám `#44474e` phía dưới.
    *   Thêm nút **`+ CREATE NEW CONTRACT`** to, rõ ràng ở góc trên bên phải (Màu nền `#0061a4`, bo góc `4px`).
*   **Khu vực Bộ lọc (Filters):**
    *   *Hiện tại:* Chỉ có 1 thanh tìm kiếm Keyword thô sơ và 2 dropdown nằm chật chội.
    *   *Sửa thành:* Đặt trong một Card trắng bo góc `4px`. Chia thành 5 trường lọc rõ ràng: `Status`, `Type`, `Property`, `Customer`, `Agent`, kèm nút cấu hình nâng cao ở góc phải.
*   **Bảng dữ liệu (Data Table):**
    *   *Tiêu đề cột:* Cấu hình font `11px`, `Bold (700)`, `Uppercase`, màu `#44474e`.
    *   *Cột ID/Code:* Không dùng text đen thường. Phải dùng font `14px`, `Bold (700)` và đổi sang màu xanh nhấn `#0061a4` (Ví dụ: `CTR-2023-892`).
    *   *Cột Trạng thái (Status):* Chuyển đổi text thường thành Badge bo góc `4px`.
        *   `SIGNED`: Chữ xanh lá đậm / Nền xanh nhạt + Icon chấm tròn.
        *   `PENDING REVIEW`: Chữ cam đậm / Nền vàng nhạt + Icon chấm tròn.
    *   *Cột Giá trị (Value):* Phải format lại định dạng tiền tệ (Ví dụ: `$245,000.00`), font `14px`, `Bold (700)`, màu `#1a1c1e`.
    *   *Hành động nhanh:* Thêm icon ba chấm dọc (`More Vert`) ở cuối mỗi hàng để thao tác (không hiển thị chữ Open trơ trọi như hiện tại).
*   **Phân trang (Pagination) & Thẻ Thống kê (KPI Cards):**
    *   *Thiếu sót hiện tại:* Đang hiển thị phân trang text thô, thiếu hoàn toàn các KPI.
    *   *Bổ sung:* Thêm dải phân trang thiết kế khối vuông dưới bảng. Kéo xuống dưới cùng, thêm lưới 4 thẻ KPI (`Total Pipeline Value`, `Average Closing Time`,...) khoảng cách giữa các thẻ là `16px`.

---

## PHẦN 2: MÀN HÌNH TẠO HỢP ĐỒNG (NEW CONTRACT CREATION)
*(Tham chiếu thiết kế: `image_e06024.png`)*

### 1. Bố cục 2 Cột (Two-Column Grid)
*   **Cấu trúc tổng thể:** Đập bỏ các thanh nhập liệu dàn ngang 100% hiện tại. Chia Workspace thành 2 cột:
    *   **Cột Trái (70%):** Vùng nhập liệu (Form Inputs).
    *   **Cột Phải (30%):** Vùng bổ trợ (Live Preview, Status, Stats).
    *   **Gutter (Khoảng cách 2 cột):** `24px`.

### 2. Cột Trái (70%): Phân khu & Form nhập liệu
*   **Phân nhóm dữ liệu (Sections):**
    *   *Hiện tại:* Các thẻ "Basic", "Value and dates", "Links" thiết kế quá sơ sài, thiếu tính phân cấp.
    *   *Sửa thành:* Bọc các trường dữ liệu vào các thẻ Card trắng (`#ffffff`), viền mờ `#d8dadc`, bo góc `4px`. Tiêu đề mỗi thẻ sử dụng font `11px`, `Bold 700`, `Uppercase`, kèm icon đại diện ở trước:
        *   `📝 CONTRACT PARTICULARS` (Code, Title, Type, Template)
        *   `🔗 ENTITY LINKING` (Property, Customer)
        *   `💵 FINANCIALS & TIMELINE` (Value, Currency, Dates)
        *   `⚖️ TERMS & CONDITIONS`
*   **Thay đổi UX/UI của các trường nhập liệu:**
    *   *Entity Linking:* Hiện tại đang bắt nhập ID (`Customer id: 2`, `Property id: 7`). Phải sửa thành thanh **Picker (Tìm kiếm chọn)**. Khi chọn xong, hiển thị dưới dạng thẻ (Card nhỏ) có hình ảnh icon, tên Property/Customer chứ không hiển thị mã số ID thô.
    *   *Terms & Conditions:* Bổ sung khu vực Text Editor (có thanh công cụ Bold, Italic, List, Link) thay vì chỉ là input text thường.
    *   *Nhãn (Labels):* Tất cả nhãn phải áp dụng quy tắc: `12px`, `Bold 700`, `Uppercase`, màu `#44474e`. Text nhập liệu bên trong là `14px Regular`.

### 3. Cột Phải (30%): Bổ sung khu vực tiện ích (Hoàn toàn mới)
Khu vực này hiện tại đang không tồn tại trong code của bạn, cần xây dựng mới hoàn toàn:
*   **Live Preview Card:** Hiển thị hình ảnh minh họa tài liệu PDF nền tối/xanh đen.
*   **Completion Status:** Thanh tiến trình hiển thị % hoàn thành (Ví dụ: `65% READY`), bên dưới là checklist tích xanh các phần đã điền.
*   **Validation Message:** Thẻ cảnh báo nền vàng nhạt (`#fff8e1`), viền vàng, chữ xám đậm. Dùng để cảnh báo các logic phê duyệt hợp đồng lớn.
*   **Asset Statistics:** Thẻ thống kê nhỏ gọn (Active Contracts, Occupancy Rate...) với font số liệu `13-14px Medium`.

### 4. Thanh hành động (Action Bar)
*   *Hiện tại:* Nút "Create contract" trôi nổi ngẫu nhiên.
*   *Sửa thành:* Tạo một thanh Footer cố định (Sticky) hoặc nằm dưới cùng, chứa cụm nút:
    *   Trái: Trạng thái Autosave (`Autosaved at 14:22 PM`).
    *   Phải: Nút `Discard Changes` (Viền xám) và nút **`Finalize & Generate Contract`** (Nền đen tuyền hoặc xanh đậm, bo góc `4px`). Bên trên Header cũng cần có nút `Cancel`, `Save Draft`, `Create Contract` tương tự thiết kế.

---
**Tóm lại:** Hãy xử lý việc **tách router** trước, sau đó áp dụng hệ thống Grid (CSS Grid) để dàn layout cho từng màn hình, cuối cùng mới tinh chỉnh typography (`Inter`) và màu sắc (`#f7f9fb`, `#0061a4`) cho từng Component.