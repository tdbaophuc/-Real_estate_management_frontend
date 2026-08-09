# AI API Reference

Tài liệu này mô tả các API AI hiện có trong backend để frontend tích hợp trực tiếp.

## Quy ước chung

- Tất cả endpoint dưới đây trả về `ApiResponse<T>`.
- Header xác thực: `Authorization: Bearer <access_token>`.
- Các response AI đều có các cờ như `fallbackUsed`, `aiStatus`, `provider`, `model`, `errorMessage` để frontend biết kết quả từ AI thật hay fallback nội bộ.
- Nếu API trả về `fallbackUsed = true`, frontend nên hiển thị trạng thái "đề xuất tạm thời" hoặc "kết quả dựa trên rule-based fallback".

## 1. Chat AI

Base path: `/api/v1/ai/chat/sessions`

Quyền:

- `CUSTOMER`
- `AGENT`
- `MANAGER`
- `ADMIN`
- `OWNER`

### 1.1 Tạo session chat

`POST /api/v1/ai/chat/sessions`

Request body:

```json
{
  "title": "Tìm căn hộ thuê quận 7"
}
```

`title` là tùy chọn.

Response `data`:

```json
{
  "id": 100,
  "title": "Tìm căn hộ thuê quận 7",
  "status": "OPEN",
  "createdById": 10,
  "createdByName": "Nguyen Van A",
  "lastMessageAt": "2026-06-30T01:00:00Z",
  "createdAt": "2026-06-30T01:00:00Z",
  "messages": [],
  "suggestedListings": []
}
```

### 1.2 Gửi message vào session

`POST /api/v1/ai/chat/sessions/{sessionId}/messages`

Request body:

```json
{
  "content": "Tôi muốn thuê căn hộ 2 phòng ngủ ở quận 7"
}
```

Response `data`:

```json
{
  "id": 100,
  "title": "Tìm căn hộ thuê quận 7",
  "status": "OPEN",
  "createdById": 10,
  "createdByName": "Nguyen Van A",
  "lastMessageAt": "2026-06-30T01:05:00Z",
  "createdAt": "2026-06-30T01:00:00Z",
  "messages": [
    {
      "id": 1,
      "role": "USER",
      "content": "Tôi muốn thuê căn hộ 2 phòng ngủ ở quận 7",
      "aiStatus": null,
      "provider": null,
      "model": null,
      "errorMessage": null,
      "createdAt": "2026-06-30T01:04:30Z"
    },
    {
      "id": 2,
      "role": "ASSISTANT",
      "content": "Mình tìm được một số căn phù hợp trong hệ thống...",
      "aiStatus": "SUCCESS",
      "provider": "openai",
      "model": "gpt-4o-mini",
      "errorMessage": null,
      "createdAt": "2026-06-30T01:05:00Z"
    }
  ],
  "suggestedListings": [
    {
      "id": 99,
      "code": "LST-CHAT-001",
      "propertyId": 88,
      "propertyCode": "PROP-CHAT-001",
      "propertyName": "Can ho trung tam Quan 1",
      "propertyTypeId": 5,
      "propertyTypeName": "Can ho",
      "title": "Can ho Quan 1 view song",
      "slug": "can-ho-quan-1-view-song",
      "description": "can ho gan trung tam",
      "purpose": "RENT",
      "status": "PUBLISHED",
      "askingPrice": 15000000,
      "currency": "VND",
      "landArea": 0,
      "floorArea": 82,
      "bedrooms": 2,
      "bathrooms": 2,
      "provinceId": 1,
      "provinceName": "TP Ho Chi Minh",
      "districtId": 2,
      "districtName": "Quan 1",
      "wardId": 3,
      "wardName": "Ben Nghe",
      "streetAddress": "1 Dong Khoi",
      "fullAddress": "1 Dong Khoi, Ben Nghe, Quan 1, TP Ho Chi Minh",
      "viewCount": 0,
      "publishedAt": "2026-06-30T01:00:00Z",
      "createdAt": "2026-06-30T00:59:00Z"
    }
  ]
}
```

### 1.3 Lấy session chat

`GET /api/v1/ai/chat/sessions/{sessionId}`

Response giống cấu trúc ở trên, nhưng `suggestedListings` hiện luôn là mảng rỗng ở endpoint này.

### Ghi chú cho frontend chat

- `suggestedListings` là danh sách listing thật để frontend render card và dẫn sang trang chi tiết.
- Nếu `messages[*].aiStatus = SKIPPED`, frontend nên hiển thị đây là câu trả lời fallback.
- Nếu người dùng hỏi pháp lý/tài chính/chuyên môn ngoài BĐS, backend có thể trả câu trả lời hướng dẫn liên hệ nhân viên phụ trách.

## 2. Đề xuất listing cho customer

Base path: `/api/v1/ai`

Quyền:

- `AGENT`
- `MANAGER`
- `ADMIN`

### 2.1 Tạo recommendation

`POST /api/v1/ai/customers/{customerId}/recommendations`

Request body:

```json
{
  "maxResults": 10,
  "candidateLimit": 30,
  "naturalLanguageNeed": "Cần căn hộ thuê quận 7, 2 phòng ngủ, ngân sách 15 triệu",
  "language": "vi"
}
```

Các field:

- `maxResults`: số kết quả trả về, mặc định `10`, tối đa `20`
- `candidateLimit`: số listing backend lấy để chấm điểm, mặc định `30`, từ `5` đến `50`
- `naturalLanguageNeed`: mô tả tự do từ user
- `language`: ngôn ngữ prompt, ví dụ `vi`

Response `data`:

```json
{
  "customerId": 1,
  "customerCode": "CUS-AI-001",
  "fallbackUsed": false,
  "aiStatus": "SUCCESS",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "errorMessage": null,
  "recommendations": [
    {
      "listing": {
        "id": 99,
        "code": "LST-CHAT-001",
        "propertyId": 88,
        "propertyCode": "PROP-CHAT-001",
        "propertyName": "Can ho trung tam Quan 1",
        "propertyTypeId": 5,
        "propertyTypeName": "Can ho",
        "title": "Can ho Quan 1 view song",
        "slug": "can-ho-quan-1-view-song",
        "description": "can ho gan trung tam",
        "purpose": "RENT",
        "status": "PUBLISHED",
        "askingPrice": 15000000,
        "currency": "VND",
        "landArea": 0,
        "floorArea": 82,
        "bedrooms": 2,
        "bathrooms": 2,
        "provinceId": 1,
        "provinceName": "TP Ho Chi Minh",
        "districtId": 2,
        "districtName": "Quan 1",
        "wardId": 3,
        "wardName": "Ben Nghe",
        "streetAddress": "1 Dong Khoi",
        "fullAddress": "1 Dong Khoi, Ben Nghe, Quan 1, TP Ho Chi Minh",
        "viewCount": 0,
        "publishedAt": "2026-06-30T01:00:00Z",
        "createdAt": "2026-06-30T00:59:00Z"
      },
      "matchScore": 92,
      "reason": "Phù hợp khu vực, ngân sách và số phòng.",
      "suggestedAction": "Gọi khách hàng và hẹn lịch xem nhà."
    }
  ]
}
```

### Ghi chú cho frontend recommendation

- `listing.slug` và `listing.id` đều dùng được để điều hướng sang trang chi tiết.
- Nếu `fallbackUsed = true`, kết quả được chấm theo rule-based scorer ở backend.
- Nếu `recommendations` rỗng, frontend nên hiển thị không tìm được listing phù hợp.

## 3. Sinh mô tả listing

Base path: `/api/v1/ai`

Quyền:

- `AGENT`
- `MANAGER`
- `ADMIN`

### 3.1 Generate listing description

`POST /api/v1/ai/listing-description`

Request body:

```json
{
  "propertyId": 88,
  "listingId": null,
  "sellingPoints": ["gần trung tâm", "view sông"],
  "tone": "professional",
  "language": "vi"
}
```

`propertyId` hoặc `listingId` là bắt buộc, chỉ cần một trong hai.

Response `data`:

```json
{
  "title": "Căn hộ trung tâm quận 1",
  "shortDescription": "Căn hộ sang trọng gần tiện ích.",
  "fullDescription": "Căn hộ có diện tích rộng, phù hợp gia đình...",
  "seoKeywords": ["can ho quan 1", "bat dong san trung tam"],
  "socialMediaCaption": "Căn hộ quận 1 đang mở bán",
  "fallbackUsed": false,
  "aiStatus": "SUCCESS",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "errorMessage": null
}
```

### Ghi chú cho frontend listing description

- `fallbackUsed = true` nghĩa là backend tự dựng mô tả an toàn từ dữ liệu property/listing.
- Frontend có thể cho phép copy từng trường sang form đăng tin.

## 4. Chấm điểm lead

Base path: `/api/v1/ai`

Quyền:

- `AGENT`
- `MANAGER`
- `ADMIN`

### 4.1 Score lead

`POST /api/v1/ai/leads/{leadId}/score`

Request body:

```json
{
  "language": "vi"
}
```

Response `data`:

```json
{
  "leadId": 7,
  "leadCode": "LEAD-AI-001",
  "score": 64,
  "priority": "MEDIUM",
  "reason": "Lead has useful context but needs more qualification.",
  "suggestedFollowUp": "Ask for budget timing and preferred district.",
  "fallbackUsed": false,
  "aiStatus": "SUCCESS",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "errorMessage": null
}
```

### Ghi chú cho frontend lead

- Nếu `fallbackUsed = true`, điểm số dựa trên heuristic backend.
- Frontend có thể dùng `priority` để tô màu card lead.

## 5. Customer summary

Base path: `/api/v1/ai`

Quyền:

- `AGENT`
- `MANAGER`
- `ADMIN`

### 5.1 Tạo summary customer

`GET /api/v1/ai/customers/{customerId}/summary`

Response `data`:

```json
{
  "customerId": 1,
  "customerCode": "CUS-SUM-001",
  "needsSummary": "RENT need: details pending",
  "interactionSummary": "Latest note: Interested in a central apartment",
  "interestedProperties": ["Can ho Quan 1 view song"],
  "potentialLevel": "MEDIUM",
  "nextBestAction": "Contact the customer and update the latest lead status after the conversation",
  "fallbackUsed": true,
  "aiStatus": "SKIPPED",
  "provider": "noop",
  "model": "not-configured",
  "errorMessage": "AI provider is disabled or API key is not configured"
}
```

### Ghi chú cho frontend customer summary

- `interestedProperties` là danh sách title listing mà customer đã quan tâm.
- `potentialLevel` chỉ nhận `LOW`, `MEDIUM`, `HIGH`.

## 6. Phân tích ảnh property

Base path: `/api/v1/ai`

Quyền:

- `AGENT`
- `MANAGER`
- `ADMIN`

### 6.1 Analyze property images

`POST /api/v1/ai/property-images/analyze`

Request body:

```json
{
  "imageIds": [10, 11, 12]
}
```

Response `data`:

```json
{
  "fallbackUsed": false,
  "aiStatus": "SUCCESS",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "errorMessage": null,
  "images": [
    {
      "imageId": 10,
      "imageUrl": "https://cdn.example.com/property/10.jpg",
      "blurry": false,
      "dark": false,
      "duplicateSuspected": false,
      "irrelevant": false,
      "suggestedCover": true,
      "caption": "Phòng khách sáng, rộng và có view thoáng.",
      "issues": [],
      "recommendation": "Dùng làm ảnh cover"
    }
  ]
}
```

### Ghi chú cho frontend image analysis

- `suggestedCover = true` cho biết ảnh nên được chọn làm cover.
- Khi AI không cấu hình, backend trả fallback dựa trên metadata ảnh.

## 7. Cách frontend nên dùng

### Chat

- Hiển thị `messages` như một thread.
- Nếu có `suggestedListings`, render thành card và cho click vào trang listing detail.

### Recommendation

- Dùng `recommendations[*].listing.slug` hoặc `listing.id` để điều hướng.
- Hiển thị `matchScore`, `reason`, `suggestedAction`.

### Description

- Dùng để prefill form nội dung listing trước khi publish.

### Lead score và summary

- Dùng để làm sidebar/insight panel trong CRM.

### Image analysis

- Dùng để gợi ý cover image, cảnh báo ảnh mờ/tối/trùng lặp.

## 8. Lưu ý triển khai frontend

- Nên xử lý riêng trạng thái `fallbackUsed = true`.
- Không giả định AI luôn trả về `provider = openai`; khi chưa cấu hình có thể là `noop`.
- Với chat session, chỉ chủ session hoặc vai trò `MANAGER/ADMIN` mới xem được session đó.
- Các endpoint recommendation, listing description, lead score, image analysis đều yêu cầu bearer token và role nghiệp vụ phù hợp.

## Đề xuất 

- Mỗi khi Ai trả về các sản phẩm đề xuất(thẻ bao gồm ảnh và có thông tin ngắn gọn của sản phẩm) thì user có thể nhấp vào sản phẩm đó để đến trang chi tết của sản phẩm đó(căn hộ,...)