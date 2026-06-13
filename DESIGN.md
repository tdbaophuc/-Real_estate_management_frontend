---
version: "alpha"
name: "HeritageEstate"
description: "Visual identity and design system tokens for the Real Estate Management and CRM Platform."

colors:
  # Brand Colors
  primary: "#0B192C"           # Deep Ink Navy - Xanh mực sẫm (Chữ chính, Sidebar, tạo sự đầm, cao cấp)
  secondary: "#4A5568"         # Slate Gray - Xám đá (Phụ đề, icon, caption, metadata thứ cấp)
  tertiary: "#10B981"          # Mint Emerald - Xanh ngọc mint (Sole interaction driver - chỉ dùng cho nút chốt cọc, nút quan trọng)
  
  # Structural Colors
  neutral-light: "#F8FAFC"     # Limestone Foundation - Trắng thạch vôi (Nền tổng thể dịu mắt hơn màu trắng tinh)
  neutral-dark: "#0F172A"      # Charcoal Dark - Text chính (Đỡ mỏi mắt hơn màu đen tuyền #000)
  surface: "#FFFFFF"           # Pure White - Nền của các thẻ Card thông tin, khối bảng biểu
  border: "#E2E8F0"            # Light Slate - Màu của đường kẻ mảnh, tinh tế
  
  # Semantic States (CRM Pipeline & Alerts)
  state-new: "#64748B"         # Muted Slate (Trạng thái Lead mới)
  state-contacted: "#F59E0B"   # Warm Amber (Trạng thái Đang liên hệ)
  state-negotiating: "#EF4444" # Crimson Red (Trạng thái Đang thương lượng / Cần chú ý)

typography:
  h1:
    fontFamily: Plus Jakarta Sans, sans-serif
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: Plus Jakarta Sans, sans-serif
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Inter, sans-serif
    fontSize: 0.9375rem        # 15px tiêu chuẩn công nghiệp giúp giao diện thanh thoát
    fontWeight: 400
    lineHeight: 1.6
  label-caps:
    fontFamily: Space Grotesk, sans-serif
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: 0.05em

rounded:
  none: 0px
  sm: 6px                      # Bo góc nhẹ cho nút bấm nhỏ, ô nhập liệu Input
  md: 12px                     # Bo góc vừa cho các nút lớn, thanh điều hướng
  lg: 16px                     # Bo góc lớn mềm mại cho các khối Card BĐS, khối Kanban

spacing:
  xs: 8px
  sm: 12px
  md: 24px                     # Padding rộng rãi giúp giao diện có "khoảng thở" sang trọng
  lg: 32px                     # Khoảng cách giữa các cấu phần lớn trên Dashboard

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#112239"
  button-action:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 12px
  kanban-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
---

## Overview

Architectural Minimalism meets Journalistic Gravitas. Giao diện được định hình theo phong cách tối giản cao cấp, hướng tới sự rõ ràng tuyệt đối của dữ liệu. Hệ thống loại bỏ hoàn toàn các chi tiết trang trí thừa thãi của AI (như bôi màu lòe loẹt, đổ bóng dày đặc) để tạo ra không gian làm việc chuyên nghiệp cho Agent và Manager.

## Colors

Bảng màu tập trung vào độ tương phản cao của các sắc độ trung tính, kết hợp duy nhất một màu nhấn có chủ đích.
- **Primary (#0B192C):** Sắc xanh mực sẫm hoàng gia. Dùng cho tiêu đề lớn, Sidebar điều hướng và các vùng nhấn thương hiệu.
- **Secondary (#4A5568):** Sắc xám phiến thạch thanh lịch. Dùng cho đường kẻ mảnh, icon, captions và thông tin metadata thứ cấp.
- **Tertiary (#10B981):** Xanh Mint Emerald. Đây là "Sole Driver" cho mọi hành động tạo ra giá trị: Chốt cọc, Hợp đồng ký kết, trạng thái `CLOSED_WON`.

## Typography

Sự kết hợp giữa font chữ tiêu đề hình khối hiện đại (`Plus Jakarta Sans`) và font chữ nội dung hình học (`Inter`) giúp tối ưu hiệu suất đọc thông tin tần suất cao.
- **Phân cấp bằng độ dày (Weight Contrast):** Tiêu đề bắt buộc sử dụng `font-bold` (700) kết hợp với nội dung `font-normal` (400). 
- **Quy tắc viết chữ:** Không sử dụng tính năng viết hoa toàn bộ (`UPPERCASE`) cho các nhãn dữ liệu hoặc tiêu đề cột. Sử dụng `Sentence case` để giao diện nhìn tự nhiên và dễ tiếp cận.

## Layout & Spacing

Whitespace (Khoảng trống) được coi là một thành phần thiết kế cốt lõi chứ không phải khoảng đất trống.
- **Khoảng thở hệ thống:** Tăng khoảng cách đệm (Padding/Margin) lên mức `24px` (`spacing.md`) cho các Card khối. Khối thông tin càng quan trọng thì khoảng thở xung quanh càng lớn.
- **Phân tách bằng không gian:** Hạn chế tối đa việc lạm dụng các đường kẻ ngang dọc (`border`) để chia vùng. Hãy dùng chính khoảng trống và các mảng màu nền `neutral-light` để phân chia phân khu chức năng.

## Shapes

- **Bất đối xứng tinh tế:** Các phần tử tương tác nhỏ (Buttons, Input) sử dụng bo góc góc hẹp `sm` (6px) để giữ tính nghiêm túc, sắc nét. Các thùng chứa lớn (Cards, Kanban Board Column) sử dụng bo góc rộng `lg` (16px) để tạo sự dễ chịu, hiện đại cho tổng thể layout.

## Components

### CRM Kanban Board (Lead Pipeline)
- **Cột trạng thái:** Sử dụng nền màu xám cực nhẹ `neutral-light`, tuyệt đối không có border bao quanh. Khoảng cách giữa các cột là `24px`.
- **Thẻ Lead Card:** Sử dụng nền trắng `surface`, bo góc `lg`. Hiệu ứng đổ bóng phải cực kỳ mờ mịn (`shadow-[0_2px_8px_rgba(0,0,0,0.03)]`) để tạo cảm giác thẻ nằm nhẹ trên mặt giấy phẳng.
- **Chỉ báo độ ưu tiên:** Hiển thị độ ưu tiên (được tính toán từ AI Lead Score) bằng một chấm tròn nhỏ thanh lịch ở góc thẻ, không bôi màu lên toàn bộ thẻ.

## Do's and Don'ts

### Do's
- Luôn giữ tỷ lệ khoảng trống (Whitespace) chiếm tối thiểu 35% diện tích của một khối bảng biểu.
- Phân biệt các cấp bậc thông tin bằng sắc độ chữ (`neutral-dark` cho text chính, `secondary` cho text phụ).
- Đảm bảo độ tương phản của chữ trên nền luôn đạt chuẩn WCAG AA thông qua lệnh kiểm thử.

### Don'ts
- Không sử dụng hiệu ứng đổ bóng lem, dày hoặc có màu sắc sặc sỡ.
- Không tự ý bo góc các nút bấm thành hình tròn xoe (border-radius: 9999px).
- Không lạm dụng màu nhấn `tertiary` (Mint Emerald) cho các tác vụ thông thường.