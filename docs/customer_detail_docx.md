### 1. Bố cục tổng thể (Overall Grid Layout)

-   **Hiện tại:** Giao diện trải dài toàn bộ chiều rộng màn hình, các ô thông tin xếp dọc vô tận khiến người dùng bị ngợp khi cuộn trang.

-   **Thiết kế mẫu:** Bố cục chia khung rất khoa học:

    -   Phần trên cùng: **Header Profile Card** (chiếm 100% chiều rộng khu vực nội dung).

    -   Phần dưới: Chia làm **3 cột** rõ ràng bằng Flexbox hoặc CSS Grid:

        -   _Cột 1 (Bên trái - rộng ~25%):_ Chứa hộp thông tin **Requirements** và **Segments**.

        -   _Cột 2 (Giữa - rộng ~45%):_ Chứa **Activity Timeline**.

        -   _Cột 3 (Bên phải - rộng ~30%):_ Chứa danh sách **Smart Matches**.


### 2. Thiết kế lại Header (Profile Card)

-   **Thay đổi cấu trúc:** Đập bỏ các ô nhập liệu dạng Form (Email, Phone, User ID...) và thay bằng một Card thông tin tĩnh.

-   **Chi tiết CSS & HTML:**

    -   **Avatar:** Tạo một thẻ `div` vuông bo góc nhẹ (`border-radius: 8px`), nền màu xanh tím pastel nhạt, chữ viết tắt tên khách hàng (ví dụ: `NV`) được căn giữa hoàn hảo.

    -   **Tên & Badge:** Đặt tên khách hàng ở cỡ chữ to, đậm (`font-size: 20px`, `font-weight: 600`). Bên cạnh là nhãn trạng thái **ACTIVE** dạng badge nhỏ, nền xanh lá nhạt, chữ xanh lá đậm.

    -   **Phân cấp thông tin:** Bên dưới tên là phân loại khách hàng và địa điểm kèm theo icon định vị nhỏ màu xám nhạt (`Ho Chi Minh City, VN`).

    -   **Thông tin liên hệ (Bên phải):** Đẩy thông tin Email và Phone sang góc phải của Card. Dùng icon phong thư và điện thoại mảnh để tăng tính trực quan.


### 3. Cột bên trái: Requirements & Segments

Thay vì các ô nhập liệu "Buying or rental needs" khổng lồ, hãy chuyển chúng thành các khối hiển thị thẻ tĩnh:

-   **Hộp Requirements:**

    -   Hiển thị các thông tin chính như _Target Budget_, _Asset Class_, _Preferred Locations_, _Target Yield_ bằng text tĩnh, phân cấp font chữ rõ ràng (Tiêu đề trường nhỏ, màu xám; giá trị thực tế in đậm, màu đen).

    -   Các địa điểm ưu tiên (_District 1, HCMC_, _Thu Thiem_) cần được bọc trong các thẻ **Badge** bo góc nhẹ, nền xám nhạt, viền mờ.

-   **Hộp Segments:**

    -   Nằm tách biệt ở ngay bên dưới.

    -   Hiển thị các phân khúc khách hàng dưới dạng Badge màu xanh dương nhạt (ví dụ: _High Net Worth_, _Foreign Capital_).


### 4. Cột ở giữa: Activity Timeline (Dòng thời gian hoạt động)

-   **Thay đổi cấu trúc:** Chuyển đổi phần "CRM Activity" thô sơ thành một Timeline dạng cây có nhánh dọc.

-   **Chi tiết UI:**

    -   **Đường trục dọc:** Dùng một đường line mỏng màu xám nhạt chạy dọc cột.

    -   **Các Node hoạt động (Icon tròn):** Trên đường line đó, đặt các vòng tròn chứa icon tương ứng với hoạt động (Ví dụ: Icon thư cho Email, điện thoại cho Call, bút cho Note...). Mỗi vòng tròn có màu nền pastel nhẹ nhàng đồng bộ.

    -   **Nội dung hoạt động:** Đặt trong một box nền xám siêu nhạt (`#F9FAFB`), bo góc `6px`. Bên trong hiển thị tên hoạt động, thời gian hoạt động (ở góc phải) và nội dung chi tiết.

    -   **Hành động:** Thêm một nút bấm chữ mảnh màu xanh dương `+ Log Activity` ở góc trên cùng bên phải của hộp Timeline để tạo hoạt động mới thay vì hiển thị các ô nhập note trực diện.


### 5. Cột bên phải: Smart Matches (Gợi ý bất động sản phù hợp)

-   **Thay đổi cấu trúc:** Loại bỏ bảng danh sách "Suggested listings" thô kệch ở dưới cùng, thay bằng cột hiển thị thẻ dọc ở góc phải.

-   **Chi tiết Card sản phẩm:**

    -   Thiết kế mỗi sản phẩm là một **Card dọc**: gồm ảnh bất động sản ở trên, thông tin ở dưới.

    -   **Tỉ lệ khớp (Match %):** Đè một badge màu đen bán trong suốt (`rgba(0,0,0,0.7)`) lên góc trên bên phải của ảnh, hiển thị mức độ phù hợp (Ví dụ: `98% Match`).

    -   **Nội dung bên dưới ảnh:**

        -   Tên tòa nhà/bất động sản in đậm (Ví dụ: `The Zenith Tower - Fl 14`).

        -   Địa chỉ/Khu vực hiển thị chữ nhỏ, màu xám.

        -   Giá tiền (`$8.5M`) hiển thị nổi bật ở góc dưới bên trái.

        -   Tỷ suất sinh lời (`7.2% Yield`) in chữ màu xanh lá ở góc dưới bên phải.