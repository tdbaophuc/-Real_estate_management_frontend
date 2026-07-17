# ĐẶC TẢ CHI TIẾT ĐIỀU CHỈNH GIAO DIỆN WORKSPACE: ACTIVE PIPELINE (KANBAN BOARD)
> **Mục tiêu:** Thay thế giao diện bộ lọc form và lưới trạng thái thô kệch hiện tại bằng bảng **Kanban Active Pipeline** trực quan, tinh tế và đồng bộ dữ liệu theo các thông số thiết kế chuẩn.

---

## 1. PHÔNG CHỮ & CẤP BẬC (TYPOGRAPHY ACCORDING TO SPEC)

*   **Tiêu đề chính (Active Pipeline):**
    *   *Hiện tại:* Đang để tên dự án là "Lead pipeline" (font nhỏ, thô) hoặc "Real estate management".
    *   *Sửa thành:* với các thông số:
        ```css
        font-size: 24px;
        font-weight: 600; /* Semi-bold */
        color: #1a1c1e;
        ```
*   **Tiêu đề cột (lấy các tiêu đề cột hiện taij):**
    *   *Hiện tại:* Chữ viết hoa nhỏ nhưng định dạng khoảng cách và phân lề thô, kèm theo số lượng đặt lệch sang phải.
    *   *Sửa thành:* Gom gọn tiêu đề kèm số lượng dạng `NEW (3)`. CSS bắt buộc:
        ```css
        font-size: 11px;
        font-weight: 700; /* Bold */
        text-transform: uppercase; /* All Caps */
        color: #44474e;
        ```
*   **Tên Lead trên thẻ (Apex Corp Expansion...):**
    *   *Hiện tại:* Đang hiển thị trực tiếp cả chuỗi mã code dài dòng "LEAD-LST-17827..." rất rối mắt.
    *   *Sửa thành:* Ẩn chuỗi mã ID nội bộ này đi. Chỉ hiển thị Tên công ty/Khách hàng nổi bật:
        ```css
        font-size: 14px;
        font-weight: 700;
        color: #1a1c1e;
        ```
*   **Thông tin phụ trên thẻ (Địa chỉ, giá thuê):**
    *   *Sửa thành:* Chia làm 2 khu vực rõ ràng: Giá thuê đẩy lên góc phải trên cùng, Địa chỉ nằm dưới tên Lead.
        ```css
        font-size: 13px;
        font-weight: 400; /* Regular */
        color: #44474e;
        ```
*   **Nhãn ưu tiên (HIGH, MEDIUM, LOW):**
    *   *Hiện tại:* Nền badge bo tròn quá lớn, chữ thường.
    *   *Sửa thành:* Giảm kích thước và cấu hình font siêu đậm:
        ```css
        font-size: 10px;
        font-weight: 900; /* Black font weight */
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 2px;
        ```
        *   *Màu sắc:* **HIGH** (Chữ đỏ sẫm trên nền hồng nhạt), **MEDIUM** (Chữ cam trên nền cam nhạt), **LOW** (Chữ xanh lá trên nền xanh nhạt).

---

## 2. QUY CÁCH HÌNH KHỐI & KHOẢNG CÁCH (SHAPES & SPACING)

*   **Bố cục Kanban (Cấu trúc cột dọc):**
    *   *Hiện tại:* Các khối trạng thái đang bị dàn trải thành 3 hàng x 3 cột trông giống các ô box tĩnh, phía dưới lại bị thừa ra một bảng Table danh sách Lead lặp dữ liệu.
    *   *Sửa thành:* Đập bỏ hoàn toàn bảng Table phía dưới. Đưa các trạng thái về cấu trúc **Cột dọc song song** (Kanban Board) và chỉ giữ lại 4 cột chính đang hoạt động: `NEW`, `CONTACTED`, `VIEWING SCHED`, `NEGOTIATING`.
*   **Khoảng cách cấu trúc (Gaps):**
    *   Khoảng cách giữa các cột Kanban: `gap: 24px;`
    *   Khoảng cách xếp chồng giữa các thẻ Lead trong cùng một cột: `gap: 12px;`
*   **Thẻ Lead (Cards):**
    *   *Hiện tại:* Bên trong thẻ chứa cả ô Dropdown chọn trạng thái (Pipeline status) cực kỳ rườm rà.
    *   *Sửa thành:* Loại bỏ ô Dropdown này đi (vì bản chất kéo thả Kanban đã thay đổi trạng thái). Cấu hình lại khung thẻ:
        ```css
        background-color: #ffffff;
        border: 1px solid #d8dadc;
        border-radius: 4px; /* Round Four */
        padding: 16px;
        box-shadow: none; /* Giữ phẳng phẳng flat chuyên nghiệp */
        ```

---

## 3. THÀNH PHẦN TƯƠNG TÁC & BỔ SUNG (COMPONENTS & INTERACTION)

*   **Hiệu ứng Kéo & Thả (Drag & Drop):**
    *   Tích hợp thư viện kéo thả (như *React Beautiful DND* hoặc *SortableJS*).
    *   Thêm hiệu ứng Hover chuột vào thẻ Lead để người dùng biết có thể tương tác:
        ```css
        .lead-card:hover {
          cursor: grab;
          transform: translateY(-2px); /* Nâng nhẹ cao độ */
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Shadow nhẹ */
        }
        .lead-card:active {
          cursor: grabbing;
        }
        ```
*   **Bổ sung Cột phải - Danh sách công việc (Follow-up Tasks):**
    *   *Hiện tại:* Màn hình hiện tại thiếu hoàn toàn khu vực xử lý tác vụ nhanh này.
    *   *Sửa thành:* Thu hẹp chiều rộng bảng Kanban lại để nhường một khoảng khoảng `20%` bên phải màn hình làm khu vực **Follow-up Tasks**.
    *   *Quy cách Task:* Mỗi tác vụ đi kèm 1 Checkbox. Khi click hoàn thành, áp dụng CSS:
        ```css
        .task-item.completed {
          text-decoration: line-through;
          color: #a0a3a8; /* Giảm độ đậm màu chữ */
        }
        ```
*   **Bổ sung Avatar người phụ trách (User Initials):**
    *   Ở góc dưới cùng bên trái của mỗi thẻ Lead, bổ sung một vòng tròn nhỏ ghi chữ viết tắt tên nhân viên phụ trách (Ví dụ: `JD`, `EK`, `SP`) để dễ dàng quản lý nhân sự theo từng case.