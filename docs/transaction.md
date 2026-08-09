
## 1. MÀN HÌNH DANH SÁCH (TRANSACTION LIST)

_(Tách phần nửa dưới của ảnh `...160528.png` thành một route riêng, tham chiếu `...160440.png`)_

### Bố cục & Thành phần

-   **Tiêu đề & Nút Tạo:**

    -   Đổi tên trang thành **`Transactions`** (`32px`, `Bold 700`, `#1a1c1e`).

    -   Thêm nút **`+ Create Transaction`** ở góc trên cùng bên phải (`#0061a4`, bo góc `4px`).

-   **KPI Widgets (Bổ sung mới):**

    -   Thêm 3 thẻ KPI (Thống kê) nằm ngang phía trên bảng: `Total Volume (YTD)`, `Pending Payments`, `Avg Days to Close`.

    -   Giá trị số bên trong dùng font lớn (`28px`, `Bold 700`). Nền thẻ màu trắng `#ffffff`, viền `#d8dadc`, bo góc `4px`.

-   **Khu vực Bộ lọc (Filters):**

    -   Gom các trường lọc (Status, Type, Customer/Agent, Property ID) vào một thanh ngang duy nhất có nền trắng, viền xám mờ. Thêm nút chữ `Clear Filters` ở góc phải.

-   **Bảng dữ liệu (Data Table):**

    -   **Cột ID/Code:** Không dùng chữ đen thường. Chuyển sang font `13px`, `Bold 700`, màu xanh nhấn `#0061a4` (Ví dụ: `TRX-8902`).

    -   **Cột Trạng thái (Status):** Đổi thành Badge bo góc `4px` (Completed = Chữ xanh/Nền xanh nhạt, Payment in Progress = Chữ cam/Nền vàng nhạt).

    -   **Hành động nhanh:** Xóa nút `Open` thô kệch. Thay bằng biểu tượng 3 chấm dọc (`More Vert`) ở cuối mỗi hàng.

-   **Phân trang:** Thiết kế lại thành các khối ô vuông số (`1`, `2`, `3`) bo góc `4px`, ô đang chọn tô màu xanh `#0061a4`.


## 2. MÀN HÌNH TẠO MỚI (CREATE NEW TRANSACTION)

_(Tách phần nửa trên của ảnh `...160528.png` thành route riêng `/transactions/create`, tham chiếu `...160456.png`)_

### Bố cục 2 Cột (Grid Layout 70/30)

-   **Nguyên tắc chung:** Giữ lại toàn bộ các trường dữ liệu cần thiết cho API của bạn, nhưng phải sắp xếp lại theo cấu trúc 2 cột. Vùng nền bên ngoài là `#f7f9fb`.

-   **Cột Trái (70%) - Form nhập liệu:**

    -   Nhóm các trường input vào từng Thẻ trắng (Card) riêng biệt, bo góc `4px`. Các nhóm gợi ý: `Transaction Particulars`, `Contract Linkage`, `Financials & Timeline`, `Internal Notes`.

    -   **Typography:** Tiêu đề nhóm (`12px`, `Bold 700`, `Uppercase`), Nhãn trường/Labels (`12px`, `Bold 700`), Text input (`14px Regular`).

    -   _Lưu ý API:_ Nếu form của bạn cần thêm các trường như Customer ID, Property ID, hãy đặt chúng vào nhóm `Contract Linkage` nhưng nên dùng thanh tìm kiếm (Picker) thay vì bắt nhập số ID thủ công.

-   **Cột Phải (30%) - Thông tin bổ trợ:**

    -   Tạo một Card cố định mang tên `Linked Entity Summary`. Khi người dùng chọn Contract/Customer ở cột trái, thông tin tóm tắt sẽ hiển thị ở đây.

-   **Thanh hành động (Footer):** Căn phải các nút `Cancel`, `Save Draft`, và `Finalize Transaction` (Nút chính màu `#0061a4`).


## 3. MÀN HÌNH CHI TIẾT (TRANSACTION & PAYMENT DETAIL)

_(Tái cấu trúc hoàn toàn ảnh `...160543.png`, tham chiếu `...160422.png`)_

**Lỗi hiện tại:** Trang chi tiết đang là một tập hợp các form nhập liệu (Update status, Add deposit, Payment schedules, Offline payment...). Điều này gây rủi ro sai lệch dữ liệu và trải nghiệm rất kém. **Giải pháp:** Chuyển đổi thành một **Read-only Dashboard** (Bảng điều khiển chỉ đọc). Các thao tác nhập liệu phải được đẩy vào các **Modal (Cửa sổ bật lên)**.

### Header & Actions

-   **Tiêu đề:** Đặt tên động theo mã, ví dụ: **`Transaction #TX-8924A`** (`28px`, `Bold 700`).

-   **Nút thao tác:** Đặt 2 nút ở góc phải: `Generate Invoice` (Viền xám) và `Mark as Paid` (Nền `#0061a4`).


### Cột Trái (Khu vực Tóm tắt & Đối tác)

-   **Card 1 - Current Status (Trạng thái hiện tại):**

    -   Hiển thị icon trạng thái lớn (Ví dụ: Đồng hồ cát màu cam).

    -   Hiển thị các dòng thông số cốt lõi: `Total Amount`, `Amount Paid` (Chữ màu xanh lá), `Remaining Balance`. Dùng font to, rõ ràng.

-   **Card 2 - Counterparty Info (Thông tin đối tác):**

    -   Hiển thị Avatar dạng khối vuông đậm màu (Ví dụ: `AC`), Tên đối tác, Liên hệ chính (Email màu xanh link), và Chi tiết ngân hàng (Bank Details). Text nội dung dùng size `14px`.


### Cột Phải (Khu vực Lịch trình & Tài liệu)

-   **Card 1 - Payment Schedule (Lịch thanh toán):**

    -   _Thay đổi cốt lõi:_ Đập bỏ form "Add deposit" và "Payment schedules" hiện tại. Thay bằng một **Bảng tĩnh (Table)** hiển thị: _Installment, Due Date, Amount, Status_.

    -   Nếu người dùng có quyền thêm/sửa, hãy đặt một nút chữ nhỏ `✎ Edit Terms` ở góc trên bên phải Card để mở Modal chỉnh sửa, thay vì phơi bày ô input ra ngoài màn hình.

-   **Card 2 - Payment Records & Evidence (Chứng từ):**

    -   Tạo nút `Upload Document` ở góc phải.

    -   Hiển thị các file đã tải lên dưới dạng các Card nhỏ liền kề nhau. Bên trong có icon file màu xanh lá nhạt, tên file, dung lượng và icon tải xuống.

    -   Thêm một khối viền nét đứt (Dashed border) màu cam/vàng để nhắc nhở các chứng từ còn thiếu (Ví dụ: `Awaiting Q2 Transfer Receipt`).