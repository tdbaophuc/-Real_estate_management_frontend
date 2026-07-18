
Markdown

```
# ĐẶC TẢ CHI TIẾT ĐIỀU CHỈNH GIAO DIỆN: CONTRACT DETAIL (HỒ SƠ HỢP ĐỒNG)
> **Mục tiêu:** Tái cấu trúc trang chi tiết hợp đồng hiện tại từ dạng **"Form chỉnh sửa dữ liệu tràn màn hình"** sang dạng **"Bảng thông tin tổng quan phẳng"** phân cấp 2 phần (75% - 25%) kết hợp quản lý tệp đính kèm và lịch sử phiên bản.

---

## 1. CẤU TRÚC BỐ CỤC CHUNG (WORKSPACE LAYOUT)

*   **Hiện tại:** Các khối nội dung (`Metadata`, `Workflow`, `Edit contract`, `Contract documents`, `Contract parties`) phân bố rời rạc thành các ô biểu mẫu (inputs) xếp tầng từ trên xuống dưới, làm loãng thông tin quan trọng.
*   **Sửa thành:** Cấu hình lại layout vùng nội dung chính bằng **CSS Grid** dưới một nền trung tính thống nhất theo đúng tỉ lệ thiết kế:
    *   **Màu nền Workspace:** Áp dụng mã màu `#f7f9fb` cho toàn bộ vùng nền trang.
    *   **Bố cục Grid 2 vùng chính:** Khoảng cách giữa các khối lớn là `gap: 24px;`.
        *   *Vùng bên trái (Chiếm 75% chiều rộng):* Chứa khối thông tin cốt lõi hợp đồng (`Contract Particulars`) và khu vực tệp đính kèm (`Associated Documents`).
        *   *Vùng bên phải (Chiếm 25% chiều rộng):* Chứa bảng hành động (`Workflow Actions`) và nhật ký chỉnh sửa (`Version History`).

```css
/* Gợi ý CSS Layout */
.contract-detail-workspace {
  background-color: #f7f9fb;
  display: grid;
  grid-template-columns: 75fr 25fr;
  gap: 24px;
  padding: 24px;
}

.contract-card-surface {
  background-color: #ffffff;
  border: 1px solid #d8dadc;
  border-radius: 4px; /* Đồng bộ góc bo Round Four */
  padding: 24px;
}

```

## 2. CHI TIẾT THAY ĐỔI THEO TỪNG THÀNH PHẦN

### A. Thanh tiêu đề trên cùng (Page Header)

-   **Tiêu đề hợp đồng:**

    -   _Hiện tại:_ Tên hợp đồng nhỏ, bị đẩy lệch hẳn lên góc trái đi kèm các badge trạng thái nhỏ rải rác.

    -   _Sửa thành:_ Đặt font cỡ lớn **`24px`** in đậm (`font-weight: 700; color: #1a1c1e;`). Dưới tiêu đề chính hiển thị địa chỉ tài sản bằng màu xám phụ (`#44474e`, `13px - 14px`).

-   **Nhóm nút chức năng:**

    -   Đẩy hai nút bấm **`Export PDF`** (nền trắng, viền mờ) và **`Edit Contract`** (nền xanh nhấn thương hiệu `#0061a4` phối chữ trắng) sang góc phải trên cùng của tiêu đề để tối ưu diện tích.


### B. Vùng bên trái (75% Width): Thông tin chi tiết & Tài liệu

#### Khối `Contract Particulars` (Thay thế cho Form Edit cũ)

-   **Xóa bỏ hoàn toàn biểu mẫu nhập liệu:** Đập bỏ các ô input, text box và dropdown cồng kềnh. Thay thế bằng các trường hiển thị văn bản tĩnh sạch sẽ.

-   **Bố cục thông tin:** Chia thành 2 cột dữ liệu song song:

    -   _Cột 1:_ Đối tác (`Counterparty`), Ngày có hiệu lực (`Effective Date`).

    -   _Cột 2:_ Tổng giá trị (`Total Value` - hiển thị font to, đậm màu đen xám `#1a1c1e`), Ngày hết hạn (`Expiration Date`).

-   **Điều kiện đặc biệt (Special Conditions):** Đặt ở phần dưới cùng của khối này trong một hộp viền mờ, chữ màu `#1a1c1e` (`font-size: 14px; regular 400`).

-   **Badge trạng thái chữ ký:** Đặt ở góc phải tiêu đề card dạng badge chữ chữ chữ nhật bo góc nhẹ `4px`: `PENDING SIGNATURE` (Chữ màu cam sẫm trên nền cam/vàng nhạt).


#### Khối `Associated Documents` (Thay thế cho Contract Documents cũ)

-   **Vùng kéo thả (Upload Zone):** Thiết kế vùng kéo thả tệp đính kèm gọn gàng có viền nét đứt mờ (`border: 1px dashed #d8dadc`), chứa icon đám mây và text hướng dẫn: _"Drag & drop files here or click to browse (PDF, DOCX)"_.

-   **Danh sách tệp tin đính kèm:**

    -   Hiển thị danh sách các tệp đã tải lên dạng thanh ngang có nền trắng hoặc xanh nhạt.

    -   Bên trái có icon định dạng tệp (`PDF`, `DOCX`), ở giữa là tên file kèm dung lượng/ngày tải lên (`font-size: 13px; color: #44474e`).

    -   Bên phải là các icon tương tác nhanh (Xem chi tiết `Con mắt`, Tải xuống `Mũi tên`).


### C. Vùng bên phải (25% Width): Quy trình & Nhật ký phiên bản

#### Khối `Workflow Actions` (Quy trình xử lý)

-   _Hiện tại:_ Chỉ có duy nhất một nút "Cancel" màu hồng đỏ rất lạc lõng.

-   _Sửa thành:_ Đổi màu nền hộp sang xám siêu nhạt để tách biệt. Thiết kế các nút bấm hành động theo tiến trình dạng hàng dọc phẳng, bo góc `4px`, viền mảnh:

    -   Nút 1: `Submit for Legal Review` (Có icon mũi tên gửi đi).

    -   Nút 2: `Approve Contract` (Có icon tích v tròn).

    -   Nút chính dưới cùng: **`Mark as Signed`** dùng nền đen hoàn toàn hoặc xanh đậm `#0061a4` chữ trắng để làm nổi bật hành động chốt duyệt.


#### Khối `Version History` (Nhật ký chỉnh sửa)

-   _Hiện tại:_ Dưới cùng trang hiển thị dòng text thô "Status timeline - No timeline returned".

-   _Sửa thành:_ Tái cấu trúc thành cây dòng thời gian dọc (Timeline).

    -   Sử dụng trục dọc mảnh `#d8dadc` kết nối các chấm tròn màu sắc.

    -   Mỗi mốc lịch sử gồm tiêu đề hoạt động in đậm `13px`, thời gian thực hiện (`Oct 12, 2023`) và đoạn mô tả chi tiết ngắn gọn bên dưới (`font-size: 13px; color: #44474e;`) thể hiện rõ ai đã chỉnh sửa và cập nhật nội dung gì vào hệ thống.


## 3. THÔNG SỐ CSS ĐỒNG BỘ ĐỂ ÁP DỤNG NHANH

CSS

```
/* Màu chữ và Phông chữ chuẩn Inter */
.contract-text-primary {
  font-family: 'Inter', sans-serif;
  color: #1a1c1e;
}

.contract-text-secondary {
  font-family: 'Inter', sans-serif;
  color: #44474e;
}

/* Tiêu đề phân khu nhỏ (All Caps) */
.contract-section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #44474e;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Định dạng số tiền lớn trong Đặc tả */
.contract-total-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1c1e;
  margin-top: 4px;
}
```