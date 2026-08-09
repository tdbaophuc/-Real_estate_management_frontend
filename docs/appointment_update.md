Appointments: **2\. Khu vực điều khiển lịch trình (Calendar Controls)**

1.  **Gộp cụm điều hướng thời gian (Date Navigation):**
    Thay vì để rời rạc Previous, Calendar date và Next, hãy gộp chúng thành một cụm duy nhất (Button Group).
    Bỏ viền đen của ô chọn ngày mặc định. Thay vào đó, thiết kế một nút bấm duy nhất chứa text dạng: **"Today"** ở giữa, hai bên là hai mũi tên nhỏ < và > (như bản mẫu).
4.  **Thiết kế lại các nút chuyển đổi (Week/Day/Month):**
Đưa các nút này về cùng một group. Sử dụng màu nền xám rất nhạt (#F3F4F6) hoặc trắng, viền mờ.
Nút đang được chọn (Active) sẽ có nền trắng, đổ bóng nhẹ hoặc viền nổi bật hơn một chút, chữ màu tối. Tránh dùng màu xanh đậm nguyên khối cho nút chọn chế độ xem tuần/ngày.
7.  **Nổi bật nút hành động chính (Call to Action):**
Nút **\+ New viewing** cần được bo góc nhẹ (border-radius: 6px hoặc 8px), sử dụng màu nền đen hoặc xanh đậm hẳn (#000000 hoặc #0F172A) để tạo sự tương phản mạnh mẽ với các nút điều hướng xung quanh.

**3\. Lưới lịch trình trung tâm (Calendar Grid)**

1.  **Tối giản tiêu đề cột (Header):**
Chuyển đổi ngôn ngữ đồng nhất (tiếng Anh hoặc tiếng Việt). Nếu làm giống mẫu: dùng chữ viết hoa, cỡ chữ nhỏ (font-size: 11px hoặc 12px), màu xám (color: #6B7280).
_Ví dụ:_ Thay vì "Thứ 2, 29/06 \\n 2026-06-29" -> chỉ để **MON / 16** (với số 16 được làm to hơn và căn giữa hoàn hảo).
4.  **Căn chỉnh lại Khối lịch hẹn (Event Block):**
**Padding:** Thêm khoảng đệm bên trong khối lịch hẹn để chữ không bị dính sát mép viền (padding: 8px 12px).
**Màu sắc:** Sử dụng tông màu nhạt (Pastel) có độ trong suốt nhẹ (ví dụ: dùng mã màu rgba(...) hoặc màu Hex nhạt như #E0F2FE cho màu xanh dương, #DCFCE7 cho màu xanh lá) để giao diện trông dịu mắt và sang trọng hơn.
**Font chữ bên trong:** Giảm cỡ chữ tiêu đề lịch hẹn xuống 12px hoặc 13px, font chữ tên khách xuống 11px (màu xám nhẹ).

**4\. Bảng chi tiết bên phải (Detail Panel)**

1.  **Đập bỏ thiết kế "Đóng hộp" (Un-box các trường thông tin):**
Loại bỏ toàn bộ các khung viền xám (border) và nền xám nhạt của từng ô thông tin (Time, Customer, Agent, Property).
Đặt tất cả thông tin trên một nền trắng phẳng duy nhất.
Phân cấp thông tin bằng kích thước chữ, độ đậm (Font weight) và khoảng cách (Margin) thay vì dùng khung.
5.  **Bổ sung hình ảnh trực quan (Avatar & Icons):**
Ở mục **Attendees (Người tham gia)**:
Tạo các hàng thông tin có cấu trúc: \[Avatar tròn\] \[Tên (In đậm, màu tối)\] / \[Vai trò (Chữ nhỏ, màu xám)\].
Thêm icon nhỏ nhắn (như icon bức thư gửi mail) ở góc phải của hàng để tạo điểm nhấn tương tác.
9.  **Trình bày thông tin bất động sản (Property Details):**
Chia làm 2 cột rõ ràng như bản mẫu bằng cách sử dụng Grid hoặc Flexbox:
Cột 1: TYPE: Commercial Office và ASKING RENT: $85 / sqft
Cột 2: SIZE: 12,500 sqft và STATUS: Available (Trạng thái tô màu xanh lá nhẹ để dễ nhận biết).
13.  **Giao diện Đánh giá (Feedback):**
Sử dụng các nút bấm chọn mức độ quan tâm (Low / Medium / High) dạng bo góc nhẹ, nút được chọn sẽ tô viền đậm hơn hoặc đổi màu nền nhẹ nhàng.
Hàng đánh giá sao (Client Rating): Sử dụng các icon ngôi sao viền mảnh mảnh, ngôi sao được đánh giá thì tô màu vàng cam ấm áp.

**Gợi ý thông số CSS chung**

**1\. Hệ thống Màu sắc (Color Palette)**

Giao diện sử dụng bảng màu **Light Mode** chuyên nghiệp, tập trung vào sự phân cấp thông tin rõ ràng:

1.  **Màu Nền Chính (Surface):** #f7f9fb (Trắng xám nhạt) – Tạo cảm giác sạch sẽ, hiện đại.
2.  **Thanh Điều hướng (Sidebar):** #000000 (Đen) – Tạo sự tương phản mạnh mẽ với nội dung chính.
3.  **Màu Văn bản (Text):**
**Primary:** #1a1c1e (Đen xám) – Dùng cho tiêu đề và nội dung quan trọng.
**Secondary/Variant:** #44474e (Xám đậm) – Dùng cho thông tin phụ.
6.  **Màu Nhận diện/Hành động (Primary/Secondary):**
**Accent:** #0061a4 (Xanh dương) – Dùng cho các nút bấm chính và chỉ báo trạng thái.
**Danger:** #ba1a1a(Đỏ) – Dùng cho các cảnh báo hoặc hủy lịch.
9.  **Trạng thái Lịch hẹn (Calendar Tokens):**
**Confirmed:** Xanh dương nhạt.
**Pending:** Vàng cam nhạt.
**Completed:** Xanh lá nhạt.

**2\. Phông chữ & Typography (Font & Scale)**

Toàn bộ hệ thống sử dụng font **Inter** – một phông chữ sans-serif tối ưu cho hiển thị số liệu và giao diện quản trị.

1.  **Font Family:** Inter, system-ui, sans-serif
2.  **Cấp bậc Typography:**
**Display/Large Title:** 28px - 32px (Bold) – Dùng cho tiêu đề tháng hoặc tiêu đề lớn.
**Headline/Section Title:** 18px - 20px (Semi-bold) – Dùng cho tiêu đề các panel thông tin bên phải.
**Body (Default):** 14px (Medium/Regular) – Dùng cho nội dung chi tiết lịch hẹn.
**Label/Small:** 11px - 12px (Bold/Caps) – Dùng cho các nhãn (labels), tiêu đề cột trong lịch hoặc badge trạng thái.

**3\. Quy cách Hình khối & Khoảng cách (Shape & Spacing)**

**Bo góc (Roundness):** 4px (Round Four) – Tạo vẻ ngoài cứng cáp, chuẩn mực cho môi trường institutional/corporate.
**Khoảng cách (Spacing):**
Sử dụng hệ thống lưới căn bản 4px (Unit 4).
**Padding Container:** 24px (Gutter).
**Gaps giữa các phần tử:** 8px (Compact) hoặc 16px (Standard).
**Đường kẻ (Borders):** 1px với màu xám nhạt (#d8dadc) để phân tách các khung giờ trong lịch một cách tinh tế.

