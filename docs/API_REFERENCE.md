# API Reference - Real Estate Management

This document was generated from OpenAPI `/v3/api-docs` plus the current controller/DTO signatures on 2026-07-01. The base URL depends on the environment, for example `http://localhost:8080`.

Total endpoints: **146**.

## Common Conventions

- Protected endpoints require the `Authorization: Bearer <accessToken>` header, except endpoints marked `Auth: Public`.
- Standard success response:
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```
- Standard error response:
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "errors": [
    {
      "field": "email",
      "message": "must be a well-formed email address"
    }
  ],
  "path": "/api/v1/example",
  "timestamp": "2026-07-01T09:00:00Z"
}
```
- For paginated endpoints, `data` has this shape:
```json
{
  "content": [
    {
      "id": 1
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

## AI

### `POST /api/v1/ai/chat/sessions`

- Purpose: Create Session.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `ChatSessionCreateRequest`.
```json
{
  "title": "string"
}
```

- Output:
Schema data: `ApiResponse<ChatSessionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "title": "string",
    "status": "OPEN",
    "createdById": 1,
    "createdByName": "string",
    "lastMessageAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "messages": [
      {
        "id": 1,
        "role": "USER",
        "content": "string",
        "aiStatus": "SUCCESS",
        "provider": "string",
        "model": "string",
        "errorMessage": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "suggestedListings": [
      {
        "id": 1,
        "code": "string",
        "propertyId": 1,
        "propertyCode": "string",
        "propertyName": "string",
        "propertyTypeId": 1,
        "propertyTypeName": "string",
        "title": "string",
        "slug": "string",
        "description": "string",
        "purpose": "SALE",
        "status": "DRAFT",
        "askingPrice": 1000000,
        "currency": "string",
        "landArea": 1000000,
        "floorArea": 1000000,
        "bedrooms": 1,
        "bathrooms": 1,
        "provinceId": 1,
        "provinceName": "string",
        "districtId": 1,
        "districtName": "string",
        "wardId": 1,
        "wardName": "string",
        "streetAddress": "string",
        "fullAddress": "string",
        "viewCount": 1,
        "publishedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/ai/chat/sessions/{sessionId}`

- Purpose: Get Session.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `sessionId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ChatSessionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "title": "string",
    "status": "OPEN",
    "createdById": 1,
    "createdByName": "string",
    "lastMessageAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "messages": [
      {
        "id": 1,
        "role": "USER",
        "content": "string",
        "aiStatus": "SUCCESS",
        "provider": "string",
        "model": "string",
        "errorMessage": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "suggestedListings": [
      {
        "id": 1,
        "code": "string",
        "propertyId": 1,
        "propertyCode": "string",
        "propertyName": "string",
        "propertyTypeId": 1,
        "propertyTypeName": "string",
        "title": "string",
        "slug": "string",
        "description": "string",
        "purpose": "SALE",
        "status": "DRAFT",
        "askingPrice": 1000000,
        "currency": "string",
        "landArea": 1000000,
        "floorArea": 1000000,
        "bedrooms": 1,
        "bathrooms": 1,
        "provinceId": 1,
        "provinceName": "string",
        "districtId": 1,
        "districtName": "string",
        "wardId": 1,
        "wardName": "string",
        "streetAddress": "string",
        "fullAddress": "string",
        "viewCount": 1,
        "publishedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/ai/chat/sessions/{sessionId}/messages`

- Purpose: Send Message.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `sessionId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ChatMessageRequest`.
```json
{
  "content": "string"
}
```

- Output:
Schema data: `ApiResponse<ChatSessionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "title": "string",
    "status": "OPEN",
    "createdById": 1,
    "createdByName": "string",
    "lastMessageAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "messages": [
      {
        "id": 1,
        "role": "USER",
        "content": "string",
        "aiStatus": "SUCCESS",
        "provider": "string",
        "model": "string",
        "errorMessage": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "suggestedListings": [
      {
        "id": 1,
        "code": "string",
        "propertyId": 1,
        "propertyCode": "string",
        "propertyName": "string",
        "propertyTypeId": 1,
        "propertyTypeName": "string",
        "title": "string",
        "slug": "string",
        "description": "string",
        "purpose": "SALE",
        "status": "DRAFT",
        "askingPrice": 1000000,
        "currency": "string",
        "landArea": 1000000,
        "floorArea": 1000000,
        "bedrooms": 1,
        "bathrooms": 1,
        "provinceId": 1,
        "provinceName": "string",
        "districtId": 1,
        "districtName": "string",
        "wardId": 1,
        "wardName": "string",
        "streetAddress": "string",
        "fullAddress": "string",
        "viewCount": 1,
        "publishedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/ai/customers/{customerId}/recommendations`

- Purpose: Recommend.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PropertyRecommendationRequest`.
```json
{
  "maxResults": 1,
  "candidateLimit": 1,
  "naturalLanguageNeed": "string",
  "language": "string"
}
```

- Output:
Schema data: `ApiResponse<PropertyRecommendationResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "customerId": 1,
    "customerCode": "string",
    "fallbackUsed": true,
    "aiStatus": "SUCCESS",
    "provider": "string",
    "model": "string",
    "errorMessage": "string",
    "recommendations": [
      {
        "listing": {
          "id": 1,
          "code": "string",
          "propertyId": 1,
          "propertyCode": "string",
          "propertyName": "string",
          "propertyTypeId": 1,
          "propertyTypeName": "string",
          "title": "string",
          "slug": "string",
          "description": "string",
          "purpose": "SALE",
          "status": "DRAFT",
          "askingPrice": 1000000,
          "currency": "string",
          "landArea": 1000000,
          "floorArea": 1000000,
          "bedrooms": 1,
          "bathrooms": 1,
          "provinceId": 1,
          "provinceName": "string",
          "districtId": 1,
          "districtName": "string",
          "wardId": 1,
          "wardName": "string",
          "streetAddress": "string",
          "fullAddress": "string",
          "viewCount": 1,
          "publishedAt": "2026-07-01T09:00:00Z",
          "createdAt": "2026-07-01T09:00:00Z"
        },
        "matchScore": 1,
        "reason": "string",
        "suggestedAction": "string"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/ai/customers/{customerId}/summary`

- Purpose: Summarize.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<CustomerSummaryResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "customerId": 1,
    "customerCode": "string",
    "needsSummary": "string",
    "interactionSummary": "string",
    "interestedProperties": [
      "string"
    ],
    "potentialLevel": "string",
    "nextBestAction": "string",
    "fallbackUsed": true,
    "aiStatus": "SUCCESS",
    "provider": "string",
    "model": "string",
    "errorMessage": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/ai/leads/{leadId}/score`

- Purpose: Score.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `leadId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `LeadScoreRequest`.
```json
{
  "language": "string"
}
```

- Output:
Schema data: `ApiResponse<LeadScoreResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "leadId": 1,
    "leadCode": "string",
    "score": 1,
    "priority": "LOW",
    "reason": "string",
    "suggestedFollowUp": "string",
    "fallbackUsed": true,
    "aiStatus": "SUCCESS",
    "provider": "string",
    "model": "string",
    "errorMessage": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/ai/listing-description`

- Purpose: Generate.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `ListingDescriptionRequest`.
```json
{
  "propertyId": 1,
  "listingId": 1,
  "sellingPoints": [
    "string"
  ],
  "tone": "string",
  "language": "string"
}
```

- Output:
Schema data: `ApiResponse<ListingDescriptionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "title": "string",
    "shortDescription": "string",
    "fullDescription": "string",
    "seoKeywords": [
      "string"
    ],
    "socialMediaCaption": "string",
    "fallbackUsed": true,
    "aiStatus": "SUCCESS",
    "provider": "string",
    "model": "string",
    "errorMessage": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/ai/property-images/analyze`

- Purpose: Analyze.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `ImageAnalysisRequest`.
```json
{
  "imageIds": [
    1
  ]
}
```

- Output:
Schema data: `ApiResponse<ImageAnalysisResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "fallbackUsed": true,
    "aiStatus": "SUCCESS",
    "provider": "string",
    "model": "string",
    "errorMessage": "string",
    "images": [
      {
        "imageId": 1,
        "imageUrl": "string",
        "blurry": true,
        "dark": true,
        "duplicateSuspected": true,
        "irrelevant": true,
        "suggestedCover": true,
        "caption": "string",
        "issues": [
          "string"
        ],
        "recommendation": "string"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Appointments

### `GET /api/v1/appointments`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW, RESCHEDULED]` | `ACTIVE` |
| `agentId` | query | No | `integer(int64)` | `1` |
| `customerId` | query | No | `integer(int64)` | `1` |
| `propertyId` | query | No | `integer(int64)` | `1` |
| `from` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `to` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<AppointmentResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "title": "string",
        "status": "PENDING",
        "customerId": 1,
        "customerName": "string",
        "agentId": 1,
        "agentName": "string",
        "propertyId": 1,
        "propertyName": "string",
        "listingId": 1,
        "listingTitle": "string",
        "leadId": 1,
        "leadCode": "string",
        "createdById": 1,
        "createdByName": "string",
        "rescheduledFromId": 1,
        "startAt": "2026-07-01T09:00:00Z",
        "endAt": "2026-07-01T09:00:00Z",
        "timezone": "string",
        "meetingLocation": "string",
        "notes": "string",
        "cancellationReason": "string",
        "cancelledById": 1,
        "confirmedAt": "2026-07-01T09:00:00Z",
        "cancelledAt": "2026-07-01T09:00:00Z",
        "completedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z",
        "participants": [
          {
            "id": 1,
            "userId": 1,
            "userName": "string",
            "participantRole": "CUSTOMER",
            "responseStatus": "INVITED",
            "respondedAt": "2026-07-01T09:00:00Z",
            "notes": "string"
          }
        ],
        "feedbacks": [
          {
            "id": 1,
            "appointmentId": 1,
            "submittedById": 1,
            "submittedByName": "string",
            "rating": 1,
            "interestLevel": "HIGH",
            "comments": "string",
            "positivePoints": "string",
            "concerns": "string",
            "nextAction": "string",
            "createdAt": "2026-07-01T09:00:00Z"
          }
        ]
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/appointments`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `AppointmentCreateRequest`.
```json
{
  "code": "string",
  "customerId": 1,
  "agentId": 1,
  "propertyId": 1,
  "listingId": 1,
  "leadId": 1,
  "title": "string",
  "startAt": "2026-07-01T09:00:00Z",
  "endAt": "2026-07-01T09:00:00Z",
  "timezone": "string",
  "meetingLocation": "string",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<AppointmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "status": "PENDING",
    "customerId": 1,
    "customerName": "string",
    "agentId": 1,
    "agentName": "string",
    "propertyId": 1,
    "propertyName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "leadId": 1,
    "leadCode": "string",
    "createdById": 1,
    "createdByName": "string",
    "rescheduledFromId": 1,
    "startAt": "2026-07-01T09:00:00Z",
    "endAt": "2026-07-01T09:00:00Z",
    "timezone": "string",
    "meetingLocation": "string",
    "notes": "string",
    "cancellationReason": "string",
    "cancelledById": 1,
    "confirmedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "userId": 1,
        "userName": "string",
        "participantRole": "CUSTOMER",
        "responseStatus": "INVITED",
        "respondedAt": "2026-07-01T09:00:00Z",
        "notes": "string"
      }
    ],
    "feedbacks": [
      {
        "id": 1,
        "appointmentId": 1,
        "submittedById": 1,
        "submittedByName": "string",
        "rating": 1,
        "interestLevel": "HIGH",
        "comments": "string",
        "positivePoints": "string",
        "concerns": "string",
        "nextAction": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/appointments/my`

- Purpose: List My.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<AppointmentResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "title": "string",
        "status": "PENDING",
        "customerId": 1,
        "customerName": "string",
        "agentId": 1,
        "agentName": "string",
        "propertyId": 1,
        "propertyName": "string",
        "listingId": 1,
        "listingTitle": "string",
        "leadId": 1,
        "leadCode": "string",
        "createdById": 1,
        "createdByName": "string",
        "rescheduledFromId": 1,
        "startAt": "2026-07-01T09:00:00Z",
        "endAt": "2026-07-01T09:00:00Z",
        "timezone": "string",
        "meetingLocation": "string",
        "notes": "string",
        "cancellationReason": "string",
        "cancelledById": 1,
        "confirmedAt": "2026-07-01T09:00:00Z",
        "cancelledAt": "2026-07-01T09:00:00Z",
        "completedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z",
        "participants": [
          {
            "id": 1,
            "userId": 1,
            "userName": "string",
            "participantRole": "CUSTOMER",
            "responseStatus": "INVITED",
            "respondedAt": "2026-07-01T09:00:00Z",
            "notes": "string"
          }
        ],
        "feedbacks": [
          {
            "id": 1,
            "appointmentId": 1,
            "submittedById": 1,
            "submittedByName": "string",
            "rating": 1,
            "interestLevel": "HIGH",
            "comments": "string",
            "positivePoints": "string",
            "concerns": "string",
            "nextAction": "string",
            "createdAt": "2026-07-01T09:00:00Z"
          }
        ]
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/appointments/{appointmentId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `appointmentId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AppointmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "status": "PENDING",
    "customerId": 1,
    "customerName": "string",
    "agentId": 1,
    "agentName": "string",
    "propertyId": 1,
    "propertyName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "leadId": 1,
    "leadCode": "string",
    "createdById": 1,
    "createdByName": "string",
    "rescheduledFromId": 1,
    "startAt": "2026-07-01T09:00:00Z",
    "endAt": "2026-07-01T09:00:00Z",
    "timezone": "string",
    "meetingLocation": "string",
    "notes": "string",
    "cancellationReason": "string",
    "cancelledById": 1,
    "confirmedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "userId": 1,
        "userName": "string",
        "participantRole": "CUSTOMER",
        "responseStatus": "INVITED",
        "respondedAt": "2026-07-01T09:00:00Z",
        "notes": "string"
      }
    ],
    "feedbacks": [
      {
        "id": 1,
        "appointmentId": 1,
        "submittedById": 1,
        "submittedByName": "string",
        "rating": 1,
        "interestLevel": "HIGH",
        "comments": "string",
        "positivePoints": "string",
        "concerns": "string",
        "nextAction": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/appointments/{appointmentId}/cancel`

- Purpose: Cancel.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `appointmentId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `AppointmentCancelRequest`.
```json
{
  "reason": "string"
}
```

- Output:
Schema data: `ApiResponse<AppointmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "status": "PENDING",
    "customerId": 1,
    "customerName": "string",
    "agentId": 1,
    "agentName": "string",
    "propertyId": 1,
    "propertyName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "leadId": 1,
    "leadCode": "string",
    "createdById": 1,
    "createdByName": "string",
    "rescheduledFromId": 1,
    "startAt": "2026-07-01T09:00:00Z",
    "endAt": "2026-07-01T09:00:00Z",
    "timezone": "string",
    "meetingLocation": "string",
    "notes": "string",
    "cancellationReason": "string",
    "cancelledById": 1,
    "confirmedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "userId": 1,
        "userName": "string",
        "participantRole": "CUSTOMER",
        "responseStatus": "INVITED",
        "respondedAt": "2026-07-01T09:00:00Z",
        "notes": "string"
      }
    ],
    "feedbacks": [
      {
        "id": 1,
        "appointmentId": 1,
        "submittedById": 1,
        "submittedByName": "string",
        "rating": 1,
        "interestLevel": "HIGH",
        "comments": "string",
        "positivePoints": "string",
        "concerns": "string",
        "nextAction": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/appointments/{appointmentId}/complete`

- Purpose: Complete.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `appointmentId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AppointmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "status": "PENDING",
    "customerId": 1,
    "customerName": "string",
    "agentId": 1,
    "agentName": "string",
    "propertyId": 1,
    "propertyName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "leadId": 1,
    "leadCode": "string",
    "createdById": 1,
    "createdByName": "string",
    "rescheduledFromId": 1,
    "startAt": "2026-07-01T09:00:00Z",
    "endAt": "2026-07-01T09:00:00Z",
    "timezone": "string",
    "meetingLocation": "string",
    "notes": "string",
    "cancellationReason": "string",
    "cancelledById": 1,
    "confirmedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "userId": 1,
        "userName": "string",
        "participantRole": "CUSTOMER",
        "responseStatus": "INVITED",
        "respondedAt": "2026-07-01T09:00:00Z",
        "notes": "string"
      }
    ],
    "feedbacks": [
      {
        "id": 1,
        "appointmentId": 1,
        "submittedById": 1,
        "submittedByName": "string",
        "rating": 1,
        "interestLevel": "HIGH",
        "comments": "string",
        "positivePoints": "string",
        "concerns": "string",
        "nextAction": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/appointments/{appointmentId}/confirm`

- Purpose: Confirm.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `appointmentId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AppointmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "status": "PENDING",
    "customerId": 1,
    "customerName": "string",
    "agentId": 1,
    "agentName": "string",
    "propertyId": 1,
    "propertyName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "leadId": 1,
    "leadCode": "string",
    "createdById": 1,
    "createdByName": "string",
    "rescheduledFromId": 1,
    "startAt": "2026-07-01T09:00:00Z",
    "endAt": "2026-07-01T09:00:00Z",
    "timezone": "string",
    "meetingLocation": "string",
    "notes": "string",
    "cancellationReason": "string",
    "cancelledById": 1,
    "confirmedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "userId": 1,
        "userName": "string",
        "participantRole": "CUSTOMER",
        "responseStatus": "INVITED",
        "respondedAt": "2026-07-01T09:00:00Z",
        "notes": "string"
      }
    ],
    "feedbacks": [
      {
        "id": 1,
        "appointmentId": 1,
        "submittedById": 1,
        "submittedByName": "string",
        "rating": 1,
        "interestLevel": "HIGH",
        "comments": "string",
        "positivePoints": "string",
        "concerns": "string",
        "nextAction": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/appointments/{appointmentId}/feedback`

- Purpose: Add Feedback.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `appointmentId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ViewingFeedbackRequest`.
```json
{
  "rating": 1,
  "interestLevel": "HIGH",
  "comments": "string",
  "positivePoints": "string",
  "concerns": "string",
  "nextAction": "string"
}
```

- Output:
Schema data: `ApiResponse<ViewingFeedbackResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "appointmentId": 1,
    "submittedById": 1,
    "submittedByName": "string",
    "rating": 1,
    "interestLevel": "HIGH",
    "comments": "string",
    "positivePoints": "string",
    "concerns": "string",
    "nextAction": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/appointments/{appointmentId}/reschedule`

- Purpose: Reschedule.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `appointmentId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `AppointmentRescheduleRequest`.
```json
{
  "startAt": "2026-07-01T09:00:00Z",
  "endAt": "2026-07-01T09:00:00Z",
  "timezone": "string",
  "meetingLocation": "string",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<AppointmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "status": "PENDING",
    "customerId": 1,
    "customerName": "string",
    "agentId": 1,
    "agentName": "string",
    "propertyId": 1,
    "propertyName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "leadId": 1,
    "leadCode": "string",
    "createdById": 1,
    "createdByName": "string",
    "rescheduledFromId": 1,
    "startAt": "2026-07-01T09:00:00Z",
    "endAt": "2026-07-01T09:00:00Z",
    "timezone": "string",
    "meetingLocation": "string",
    "notes": "string",
    "cancellationReason": "string",
    "cancelledById": 1,
    "confirmedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "userId": 1,
        "userName": "string",
        "participantRole": "CUSTOMER",
        "responseStatus": "INVITED",
        "respondedAt": "2026-07-01T09:00:00Z",
        "notes": "string"
      }
    ],
    "feedbacks": [
      {
        "id": 1,
        "appointmentId": 1,
        "submittedById": 1,
        "submittedByName": "string",
        "rating": 1,
        "interestLevel": "HIGH",
        "comments": "string",
        "positivePoints": "string",
        "concerns": "string",
        "nextAction": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Audit Logs

### `GET /api/v1/audit-logs`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `actorId` | query | No | `integer(int64)` | `1` |
| `action` | query | No | `string` | `string` |
| `resourceType` | query | No | `string` | `string` |
| `resourceId` | query | No | `integer(int64)` | `1` |
| `from` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `to` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<AuditLogResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "actorId": 1,
        "actorEmail": "string",
        "actorName": "string",
        "action": "string",
        "resourceType": "string",
        "resourceId": 1,
        "oldValue": "string",
        "newValue": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/audit-logs/{auditLogId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `auditLogId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AuditLogResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "actorId": 1,
    "actorEmail": "string",
    "actorName": "string",
    "action": "string",
    "resourceType": "string",
    "resourceId": 1,
    "oldValue": "string",
    "newValue": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Authentication

### `POST /api/v1/auth/login`

- Purpose: Login.
- Auth: Public.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `LoginRequest`.
```json
{
  "email": "string",
  "password": "string"
}
```

- Output:
Schema data: `ApiResponse<LoginResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "accessToken": "string",
    "tokenType": "string",
    "expiresIn": 1,
    "refreshToken": "string",
    "refreshExpiresIn": 1,
    "user": {
      "id": 1,
      "email": "string",
      "fullName": "string",
      "phone": "string",
      "status": "PENDING_VERIFICATION",
      "roles": [
        "string"
      ],
      "permissions": [
        "string"
      ],
      "avatarUrl": "string"
    }
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/auth/logout`

- Purpose: Logout.
- Auth: Public.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `LogoutRequest`.
```json
{
  "refreshToken": "string"
}
```

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/auth/me`

- Purpose: Current User.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AuthUserResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "roles": [
      "string"
    ],
    "permissions": [
      "string"
    ],
    "avatarUrl": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/auth/me/avatar`

- Purpose: Upload Avatar.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `multipart/form-data`, schema `object`.
```json
{
  "file": "string"
}
```

- Output:
Schema data: `ApiResponse<AuthUserResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "roles": [
      "string"
    ],
    "permissions": [
      "string"
    ],
    "avatarUrl": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/auth/me/avatar`

- Purpose: Delete Avatar.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AuthUserResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "roles": [
      "string"
    ],
    "permissions": [
      "string"
    ],
    "avatarUrl": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/auth/me/change-password`

- Purpose: Change Password.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `ChangePasswordRequest`.
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/auth/me/profile`

- Purpose: Update Profile.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `ProfileUpdateRequest`.
```json
{
  "fullName": "string",
  "phone": "string"
}
```

- Output:
Schema data: `ApiResponse<AuthUserResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "roles": [
      "string"
    ],
    "permissions": [
      "string"
    ],
    "avatarUrl": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/auth/me/sessions`

- Purpose: Sessions.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<SessionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "createdAt": "2026-07-01T09:00:00Z",
      "expiresAt": "2026-07-01T09:00:00Z"
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/auth/me/sessions`

- Purpose: Revoke Sessions.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
`204 No Content`, no JSON body.

### `DELETE /api/v1/auth/me/sessions/{sessionId}`

- Purpose: Revoke Session.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `sessionId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
`204 No Content`, no JSON body.

### `POST /api/v1/auth/refresh-token`

- Purpose: Refresh Token.
- Auth: Public.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `RefreshTokenRequest`.
```json
{
  "refreshToken": "string"
}
```

- Output:
Schema data: `ApiResponse<LoginResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "accessToken": "string",
    "tokenType": "string",
    "expiresIn": 1,
    "refreshToken": "string",
    "refreshExpiresIn": 1,
    "user": {
      "id": 1,
      "email": "string",
      "fullName": "string",
      "phone": "string",
      "status": "PENDING_VERIFICATION",
      "roles": [
        "string"
      ],
      "permissions": [
        "string"
      ],
      "avatarUrl": "string"
    }
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/auth/register`

- Purpose: Register.
- Auth: Public.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `RegisterRequest`.
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string"
}
```

- Output:
Schema data: `ApiResponse<RegisterResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "roles": [
      "string"
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Commissions

### `GET /api/v1/commission-rules`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `active` | query | No | `boolean` | `True` |
| `transactionType` | query | No | `string enum[SALE, LEASE]` | `SALE` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<CommissionRuleResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "name": "string",
        "transactionType": "SALE",
        "calculationType": "PERCENTAGE",
        "rate": 1000000,
        "fixedAmount": 1000000,
        "currency": "string",
        "minTransactionValue": 1000000,
        "maxTransactionValue": 1000000,
        "priority": 1,
        "active": true,
        "effectiveFrom": "2026-07-01",
        "effectiveTo": "2026-07-01",
        "description": "string",
        "createdById": 1,
        "createdByName": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/commission-rules`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `CommissionRuleRequest`.
```json
{
  "code": "string",
  "name": "string",
  "transactionType": "SALE",
  "calculationType": "PERCENTAGE",
  "rate": 1000000,
  "fixedAmount": 1000000,
  "currency": "string",
  "minTransactionValue": 1000000,
  "maxTransactionValue": 1000000,
  "priority": 1,
  "active": true,
  "effectiveFrom": "2026-07-01",
  "effectiveTo": "2026-07-01",
  "description": "string"
}
```

- Output:
Schema data: `ApiResponse<CommissionRuleResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "name": "string",
    "transactionType": "SALE",
    "calculationType": "PERCENTAGE",
    "rate": 1000000,
    "fixedAmount": 1000000,
    "currency": "string",
    "minTransactionValue": 1000000,
    "maxTransactionValue": 1000000,
    "priority": 1,
    "active": true,
    "effectiveFrom": "2026-07-01",
    "effectiveTo": "2026-07-01",
    "description": "string",
    "createdById": 1,
    "createdByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/commission-rules/{ruleId}`

- Purpose: Update.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `ruleId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CommissionRuleRequest`.
```json
{
  "code": "string",
  "name": "string",
  "transactionType": "SALE",
  "calculationType": "PERCENTAGE",
  "rate": 1000000,
  "fixedAmount": 1000000,
  "currency": "string",
  "minTransactionValue": 1000000,
  "maxTransactionValue": 1000000,
  "priority": 1,
  "active": true,
  "effectiveFrom": "2026-07-01",
  "effectiveTo": "2026-07-01",
  "description": "string"
}
```

- Output:
Schema data: `ApiResponse<CommissionRuleResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "name": "string",
    "transactionType": "SALE",
    "calculationType": "PERCENTAGE",
    "rate": 1000000,
    "fixedAmount": 1000000,
    "currency": "string",
    "minTransactionValue": 1000000,
    "maxTransactionValue": 1000000,
    "priority": 1,
    "active": true,
    "effectiveFrom": "2026-07-01",
    "effectiveTo": "2026-07-01",
    "description": "string",
    "createdById": 1,
    "createdByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/commissions`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[PENDING, APPROVED, PAID, CANCELLED]` | `ACTIVE` |
| `transactionId` | query | No | `integer(int64)` | `1` |
| `beneficiaryUserId` | query | No | `integer(int64)` | `1` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<CommissionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "transactionId": 1,
        "transactionCode": "string",
        "transactionType": "SALE",
        "commissionRuleId": 1,
        "commissionRuleCode": "string",
        "calculationType": "PERCENTAGE",
        "beneficiaryUserId": 1,
        "beneficiaryName": "string",
        "status": "PENDING",
        "baseAmount": 1000000,
        "rate": 1000000,
        "amount": 1000000,
        "currency": "string",
        "approvedById": 1,
        "approvedByName": "string",
        "approvedAt": "2026-07-01T09:00:00Z",
        "paidById": 1,
        "paidByName": "string",
        "paidAt": "2026-07-01T09:00:00Z",
        "paymentReference": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/commissions/my`

- Purpose: List Mine.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[PENDING, APPROVED, PAID, CANCELLED]` | `ACTIVE` |
| `transactionId` | query | No | `integer(int64)` | `1` |
| `beneficiaryUserId` | query | No | `integer(int64)` | `1` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<CommissionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "transactionId": 1,
        "transactionCode": "string",
        "transactionType": "SALE",
        "commissionRuleId": 1,
        "commissionRuleCode": "string",
        "calculationType": "PERCENTAGE",
        "beneficiaryUserId": 1,
        "beneficiaryName": "string",
        "status": "PENDING",
        "baseAmount": 1000000,
        "rate": 1000000,
        "amount": 1000000,
        "currency": "string",
        "approvedById": 1,
        "approvedByName": "string",
        "approvedAt": "2026-07-01T09:00:00Z",
        "paidById": 1,
        "paidByName": "string",
        "paidAt": "2026-07-01T09:00:00Z",
        "paymentReference": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/commissions/{commissionId}/mark-paid`

- Purpose: Mark Paid.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `commissionId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CommissionMarkPaidRequest`.
```json
{
  "paymentReference": "string",
  "paidAt": "2026-07-01T09:00:00Z",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<CommissionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "transactionId": 1,
    "transactionCode": "string",
    "transactionType": "SALE",
    "commissionRuleId": 1,
    "commissionRuleCode": "string",
    "calculationType": "PERCENTAGE",
    "beneficiaryUserId": 1,
    "beneficiaryName": "string",
    "status": "PENDING",
    "baseAmount": 1000000,
    "rate": 1000000,
    "amount": 1000000,
    "currency": "string",
    "approvedById": 1,
    "approvedByName": "string",
    "approvedAt": "2026-07-01T09:00:00Z",
    "paidById": 1,
    "paidByName": "string",
    "paidAt": "2026-07-01T09:00:00Z",
    "paymentReference": "string",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Contracts

### `GET /api/v1/contracts`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[DRAFT, PENDING_REVIEW, PENDING_SIGNATURE, SIGNED, ACTIVE, EXPIRED, CANCELLED, TERMINATED]` | `ACTIVE` |
| `contractType` | query | No | `string enum[SALE, LEASE]` | `SALE` |
| `propertyId` | query | No | `integer(int64)` | `1` |
| `customerId` | query | No | `integer(int64)` | `1` |
| `agentId` | query | No | `integer(int64)` | `1` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<ContractResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "contractType": "SALE",
        "status": "DRAFT",
        "title": "string",
        "templateId": 1,
        "propertyId": 1,
        "propertyCode": "string",
        "propertyName": "string",
        "customerId": 1,
        "customerCode": "string",
        "customerName": "string",
        "ownerId": 1,
        "ownerName": "string",
        "agentId": 1,
        "agentName": "string",
        "createdById": 1,
        "createdByName": "string",
        "totalValue": 1000000,
        "currency": "string",
        "effectiveDate": "2026-07-01",
        "expirationDate": "2026-07-01",
        "terms": "string",
        "notes": "string",
        "submittedAt": "2026-07-01T09:00:00Z",
        "approvedAt": "2026-07-01T09:00:00Z",
        "signedAt": "2026-07-01T09:00:00Z",
        "cancelledAt": "2026-07-01T09:00:00Z",
        "cancellationReason": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z",
        "parties": [
          {
            "id": 1,
            "userId": 1,
            "customerId": 1,
            "partyRole": "BUYER",
            "fullName": "string",
            "email": "string",
            "phone": "string",
            "signingOrder": 1,
            "requiredSigner": true
          }
        ],
        "documents": [
          {
            "id": 1,
            "fileResourceId": 1,
            "originalFileName": "string",
            "contentType": "string",
            "fileSize": 1,
            "documentType": "DRAFT",
            "version": 1,
            "displayName": "string",
            "description": "string",
            "primaryDocument": true,
            "uploadedById": 1,
            "uploadedByName": "string",
            "createdAt": "2026-07-01T09:00:00Z"
          }
        ]
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/contracts`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `ContractCreateRequest`.
```json
{
  "code": "string",
  "contractType": "SALE",
  "propertyId": 1,
  "customerId": 1,
  "agentId": 1,
  "templateId": 1,
  "title": "string",
  "totalValue": 1000000,
  "currency": "string",
  "effectiveDate": "2026-07-01",
  "expirationDate": "2026-07-01",
  "terms": "string",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<ContractResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "contractType": "SALE",
    "status": "DRAFT",
    "title": "string",
    "templateId": 1,
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "totalValue": 1000000,
    "currency": "string",
    "effectiveDate": "2026-07-01",
    "expirationDate": "2026-07-01",
    "terms": "string",
    "notes": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "approvedAt": "2026-07-01T09:00:00Z",
    "signedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "parties": [
      {
        "id": 1,
        "userId": 1,
        "customerId": 1,
        "partyRole": "BUYER",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "signingOrder": 1,
        "requiredSigner": true
      }
    ],
    "documents": [
      {
        "id": 1,
        "fileResourceId": 1,
        "originalFileName": "string",
        "contentType": "string",
        "fileSize": 1,
        "documentType": "DRAFT",
        "version": 1,
        "displayName": "string",
        "description": "string",
        "primaryDocument": true,
        "uploadedById": 1,
        "uploadedByName": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/contracts/{contractId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `contractId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ContractResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "contractType": "SALE",
    "status": "DRAFT",
    "title": "string",
    "templateId": 1,
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "totalValue": 1000000,
    "currency": "string",
    "effectiveDate": "2026-07-01",
    "expirationDate": "2026-07-01",
    "terms": "string",
    "notes": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "approvedAt": "2026-07-01T09:00:00Z",
    "signedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "parties": [
      {
        "id": 1,
        "userId": 1,
        "customerId": 1,
        "partyRole": "BUYER",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "signingOrder": 1,
        "requiredSigner": true
      }
    ],
    "documents": [
      {
        "id": 1,
        "fileResourceId": 1,
        "originalFileName": "string",
        "contentType": "string",
        "fileSize": 1,
        "documentType": "DRAFT",
        "version": 1,
        "displayName": "string",
        "description": "string",
        "primaryDocument": true,
        "uploadedById": 1,
        "uploadedByName": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/contracts/{contractId}`

- Purpose: Update.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `contractId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ContractUpdateRequest`.
```json
{
  "title": "string",
  "totalValue": 1000000,
  "currency": "string",
  "effectiveDate": "2026-07-01",
  "expirationDate": "2026-07-01",
  "terms": "string",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<ContractResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "contractType": "SALE",
    "status": "DRAFT",
    "title": "string",
    "templateId": 1,
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "totalValue": 1000000,
    "currency": "string",
    "effectiveDate": "2026-07-01",
    "expirationDate": "2026-07-01",
    "terms": "string",
    "notes": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "approvedAt": "2026-07-01T09:00:00Z",
    "signedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "parties": [
      {
        "id": 1,
        "userId": 1,
        "customerId": 1,
        "partyRole": "BUYER",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "signingOrder": 1,
        "requiredSigner": true
      }
    ],
    "documents": [
      {
        "id": 1,
        "fileResourceId": 1,
        "originalFileName": "string",
        "contentType": "string",
        "fileSize": 1,
        "documentType": "DRAFT",
        "version": 1,
        "displayName": "string",
        "description": "string",
        "primaryDocument": true,
        "uploadedById": 1,
        "uploadedByName": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/contracts/{contractId}/approve`

- Purpose: Approve.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `contractId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ContractResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "contractType": "SALE",
    "status": "DRAFT",
    "title": "string",
    "templateId": 1,
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "totalValue": 1000000,
    "currency": "string",
    "effectiveDate": "2026-07-01",
    "expirationDate": "2026-07-01",
    "terms": "string",
    "notes": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "approvedAt": "2026-07-01T09:00:00Z",
    "signedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "parties": [
      {
        "id": 1,
        "userId": 1,
        "customerId": 1,
        "partyRole": "BUYER",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "signingOrder": 1,
        "requiredSigner": true
      }
    ],
    "documents": [
      {
        "id": 1,
        "fileResourceId": 1,
        "originalFileName": "string",
        "contentType": "string",
        "fileSize": 1,
        "documentType": "DRAFT",
        "version": 1,
        "displayName": "string",
        "description": "string",
        "primaryDocument": true,
        "uploadedById": 1,
        "uploadedByName": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/contracts/{contractId}/cancel`

- Purpose: Cancel.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `contractId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ContractCancelRequest`.
```json
{
  "reason": "string"
}
```

- Output:
Schema data: `ApiResponse<ContractResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "contractType": "SALE",
    "status": "DRAFT",
    "title": "string",
    "templateId": 1,
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "totalValue": 1000000,
    "currency": "string",
    "effectiveDate": "2026-07-01",
    "expirationDate": "2026-07-01",
    "terms": "string",
    "notes": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "approvedAt": "2026-07-01T09:00:00Z",
    "signedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "parties": [
      {
        "id": 1,
        "userId": 1,
        "customerId": 1,
        "partyRole": "BUYER",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "signingOrder": 1,
        "requiredSigner": true
      }
    ],
    "documents": [
      {
        "id": 1,
        "fileResourceId": 1,
        "originalFileName": "string",
        "contentType": "string",
        "fileSize": 1,
        "documentType": "DRAFT",
        "version": 1,
        "displayName": "string",
        "description": "string",
        "primaryDocument": true,
        "uploadedById": 1,
        "uploadedByName": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/contracts/{contractId}/documents`

- Purpose: Upload Document.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `contractId` | path | Yes | `integer(int64)` | `1` |
| `documentType` | query | Yes | `string enum[DRAFT, FINAL, SIGNED, ATTACHMENT]` | `DRAFT` |
| `displayName` | query | No | `string` | `string` |
| `description` | query | No | `string` | `string` |
| `primaryDocument` | query | No | `boolean` | `True` |

- Input:
Content-Type: `multipart/form-data`, schema `object`.
```json
{
  "file": "string"
}
```

- Output:
Schema data: `ApiResponse<ContractDocumentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "fileResourceId": 1,
    "originalFileName": "string",
    "contentType": "string",
    "fileSize": 1,
    "documentType": "DRAFT",
    "version": 1,
    "displayName": "string",
    "description": "string",
    "primaryDocument": true,
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/contracts/{contractId}/mark-signed`

- Purpose: Mark Signed.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `contractId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ContractResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "contractType": "SALE",
    "status": "DRAFT",
    "title": "string",
    "templateId": 1,
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "totalValue": 1000000,
    "currency": "string",
    "effectiveDate": "2026-07-01",
    "expirationDate": "2026-07-01",
    "terms": "string",
    "notes": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "approvedAt": "2026-07-01T09:00:00Z",
    "signedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "parties": [
      {
        "id": 1,
        "userId": 1,
        "customerId": 1,
        "partyRole": "BUYER",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "signingOrder": 1,
        "requiredSigner": true
      }
    ],
    "documents": [
      {
        "id": 1,
        "fileResourceId": 1,
        "originalFileName": "string",
        "contentType": "string",
        "fileSize": 1,
        "documentType": "DRAFT",
        "version": 1,
        "displayName": "string",
        "description": "string",
        "primaryDocument": true,
        "uploadedById": 1,
        "uploadedByName": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/contracts/{contractId}/submit-review`

- Purpose: Submit Review.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `contractId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ContractResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "contractType": "SALE",
    "status": "DRAFT",
    "title": "string",
    "templateId": 1,
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "totalValue": 1000000,
    "currency": "string",
    "effectiveDate": "2026-07-01",
    "expirationDate": "2026-07-01",
    "terms": "string",
    "notes": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "approvedAt": "2026-07-01T09:00:00Z",
    "signedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "parties": [
      {
        "id": 1,
        "userId": 1,
        "customerId": 1,
        "partyRole": "BUYER",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "signingOrder": 1,
        "requiredSigner": true
      }
    ],
    "documents": [
      {
        "id": 1,
        "fileResourceId": 1,
        "originalFileName": "string",
        "contentType": "string",
        "fileSize": 1,
        "documentType": "DRAFT",
        "version": 1,
        "displayName": "string",
        "description": "string",
        "primaryDocument": true,
        "uploadedById": 1,
        "uploadedByName": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Customers

### `GET /api/v1/customers`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `keyword` | query | No | `string` | `downtown` |
| `status` | query | No | `string enum[ACTIVE, INACTIVE, ARCHIVED]` | `ACTIVE` |
| `priority` | query | No | `string enum[LOW, MEDIUM, HIGH]` | `LOW` |
| `assignedAgentId` | query | No | `integer(int64)` | `1` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<CustomerResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "status": "ACTIVE",
        "source": "MANUAL",
        "priority": "LOW",
        "preferredContactMethod": "string",
        "notes": "string",
        "userId": 1,
        "userName": "string",
        "assignedAgentId": 1,
        "assignedAgentName": "string",
        "createdById": 1,
        "createdByName": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/customers`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `CustomerUpsertRequest`.
```json
{
  "code": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "status": "ACTIVE",
  "source": "MANUAL",
  "priority": "LOW",
  "preferredContactMethod": "string",
  "notes": "string",
  "userId": 1,
  "assignedAgentId": 1
}
```

- Output:
Schema data: `ApiResponse<CustomerResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "ACTIVE",
    "source": "MANUAL",
    "priority": "LOW",
    "preferredContactMethod": "string",
    "notes": "string",
    "userId": 1,
    "userName": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/customers/{customerId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<CustomerDetailResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "customer": {
      "id": 1,
      "code": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "status": "ACTIVE",
      "source": "MANUAL",
      "priority": "LOW",
      "preferredContactMethod": "string",
      "notes": "string",
      "userId": 1,
      "userName": "string",
      "assignedAgentId": 1,
      "assignedAgentName": "string",
      "createdById": 1,
      "createdByName": "string",
      "createdAt": "2026-07-01T09:00:00Z",
      "updatedAt": "2026-07-01T09:00:00Z"
    },
    "requirements": [
      {
        "id": 1,
        "customerId": 1,
        "purpose": "SALE",
        "propertyTypeId": 1,
        "propertyTypeName": "string",
        "provinceId": 1,
        "provinceName": "string",
        "districtId": 1,
        "districtName": "string",
        "wardId": 1,
        "wardName": "string",
        "minBudget": 1000000,
        "maxBudget": 1000000,
        "currency": "string",
        "minArea": 1000000,
        "maxArea": 1000000,
        "minBedrooms": 1,
        "minBathrooms": 1,
        "description": "string",
        "active": true,
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "notes": [
      {
        "id": 1,
        "customerId": 1,
        "authorId": 1,
        "authorName": "string",
        "content": "string",
        "pinned": true,
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/customers/{customerId}`

- Purpose: Update.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CustomerUpsertRequest`.
```json
{
  "code": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "status": "ACTIVE",
  "source": "MANUAL",
  "priority": "LOW",
  "preferredContactMethod": "string",
  "notes": "string",
  "userId": 1,
  "assignedAgentId": 1
}
```

- Output:
Schema data: `ApiResponse<CustomerResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "ACTIVE",
    "source": "MANUAL",
    "priority": "LOW",
    "preferredContactMethod": "string",
    "notes": "string",
    "userId": 1,
    "userName": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/customers/{customerId}`

- Purpose: Delete.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/customers/{customerId}/notes`

- Purpose: Add Note.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CustomerNoteRequest`.
```json
{
  "content": "string",
  "pinned": true
}
```

- Output:
Schema data: `ApiResponse<CustomerNoteResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "authorId": 1,
    "authorName": "string",
    "content": "string",
    "pinned": true,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/customers/{customerId}/notes/{noteId}`

- Purpose: Update Note.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |
| `noteId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CustomerNoteRequest`.
```json
{
  "content": "string",
  "pinned": true
}
```

- Output:
Schema data: `ApiResponse<CustomerNoteResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "authorId": 1,
    "authorName": "string",
    "content": "string",
    "pinned": true,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/customers/{customerId}/notes/{noteId}`

- Purpose: Delete Note.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |
| `noteId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/customers/{customerId}/notes/{noteId}/pin`

- Purpose: Pin Note.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |
| `noteId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CustomerNotePinRequest`.
```json
{
  "pinned": true
}
```

- Output:
Schema data: `ApiResponse<CustomerNoteResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "authorId": 1,
    "authorName": "string",
    "content": "string",
    "pinned": true,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/customers/{customerId}/requirements`

- Purpose: Add Requirement.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CustomerRequirementRequest`.
```json
{
  "purpose": "SALE",
  "propertyTypeId": 1,
  "provinceId": 1,
  "districtId": 1,
  "wardId": 1,
  "minBudget": 1000000,
  "maxBudget": 1000000,
  "currency": "string",
  "minArea": 1000000,
  "maxArea": 1000000,
  "minBedrooms": 1,
  "minBathrooms": 1,
  "description": "string",
  "budgetRangeValid": true,
  "areaRangeValid": true
}
```

- Output:
Schema data: `ApiResponse<CustomerRequirementResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "purpose": "SALE",
    "propertyTypeId": 1,
    "propertyTypeName": "string",
    "provinceId": 1,
    "provinceName": "string",
    "districtId": 1,
    "districtName": "string",
    "wardId": 1,
    "wardName": "string",
    "minBudget": 1000000,
    "maxBudget": 1000000,
    "currency": "string",
    "minArea": 1000000,
    "maxArea": 1000000,
    "minBedrooms": 1,
    "minBathrooms": 1,
    "description": "string",
    "active": true,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/customers/{customerId}/requirements/{requirementId}`

- Purpose: Update Requirement.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |
| `requirementId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CustomerRequirementRequest`.
```json
{
  "purpose": "SALE",
  "propertyTypeId": 1,
  "provinceId": 1,
  "districtId": 1,
  "wardId": 1,
  "minBudget": 1000000,
  "maxBudget": 1000000,
  "currency": "string",
  "minArea": 1000000,
  "maxArea": 1000000,
  "minBedrooms": 1,
  "minBathrooms": 1,
  "description": "string",
  "budgetRangeValid": true,
  "areaRangeValid": true
}
```

- Output:
Schema data: `ApiResponse<CustomerRequirementResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "purpose": "SALE",
    "propertyTypeId": 1,
    "propertyTypeName": "string",
    "provinceId": 1,
    "provinceName": "string",
    "districtId": 1,
    "districtName": "string",
    "wardId": 1,
    "wardName": "string",
    "minBudget": 1000000,
    "maxBudget": 1000000,
    "currency": "string",
    "minArea": 1000000,
    "maxArea": 1000000,
    "minBedrooms": 1,
    "minBathrooms": 1,
    "description": "string",
    "active": true,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/customers/{customerId}/requirements/{requirementId}`

- Purpose: Delete Requirement.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |
| `requirementId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/customers/{customerId}/tags`

- Purpose: List Tags.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<CustomerTagResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "customerId": 1,
      "name": "string",
      "color": "string",
      "createdById": 1,
      "createdByName": "string",
      "createdAt": "2026-07-01T09:00:00Z"
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/customers/{customerId}/tags`

- Purpose: Add Tag.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `CustomerTagRequest`.
```json
{
  "name": "string",
  "color": "string"
}
```

- Output:
Schema data: `ApiResponse<CustomerTagResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "name": "string",
    "color": "string",
    "createdById": 1,
    "createdByName": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/customers/{customerId}/tags/{tagId}`

- Purpose: Delete Tag.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |
| `tagId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/customers/{customerId}/timeline`

- Purpose: Timeline.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `customerId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<CustomerTimelineItemResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "type": "string",
      "referenceId": 1,
      "title": "string",
      "description": "string",
      "actorId": 1,
      "actorName": "string",
      "occurredAt": "2026-07-01T09:00:00Z"
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Dashboard

### `GET /api/v1/dashboard/admin`

- Purpose: Admin Dashboard.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AdminDashboardResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "totalUsers": 1,
    "totalProperties": 1,
    "totalListings": 1,
    "pendingListings": 1,
    "totalLeads": 1,
    "leadsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "totalTransactions": 1,
    "transactionsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "revenueSummary": [
      {
        "currency": "string",
        "completedTransactions": 1,
        "completedTransactionValue": 1000000,
        "completedPayments": 1000000,
        "verifiedDeposits": 1000000,
        "paidCommissions": 1000000
      }
    ],
    "topAgents": [
      {
        "agentId": 1,
        "agentName": "string",
        "totalTransactions": 1,
        "completedTransactions": 1
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/dashboard/agent`

- Purpose: Agent Dashboard.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<AgentDashboardResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "myLeads": 1,
    "myLeadsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "todayAppointments": 1,
    "followUpTasks": 1,
    "overdueFollowUpTasks": 1,
    "activeTransactions": 1,
    "activeTransactionsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "myCommissions": 1,
    "myCommissionsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "myCommissionAmounts": [
      {
        "currency": "string",
        "count": 1,
        "amount": 1000000
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/dashboard/manager`

- Purpose: Manager Dashboard.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ManagerDashboardResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "totalAgents": 1,
    "totalLeads": 1,
    "leadsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "leadCloseRate": 1000000,
    "totalTransactions": 1,
    "transactionsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "pendingCommissions": 1,
    "paidCommissions": 1,
    "revenueSummary": [
      {
        "currency": "string",
        "completedTransactions": 1,
        "completedTransactionValue": 1000000,
        "completedPayments": 1000000,
        "verifiedDeposits": 1000000,
        "paidCommissions": 1000000
      }
    ],
    "topAgents": [
      {
        "agentId": 1,
        "agentName": "string",
        "totalTransactions": 1,
        "completedTransactions": 1
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Files

### `POST /api/v1/files/upload`

- Purpose: Upload.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `accessLevel` | query | No | `string enum[PUBLIC, PRIVATE]` | `PUBLIC` |

- Input:
Content-Type: `multipart/form-data`, schema `object`.
```json
{
  "file": "string"
}
```

- Output:
Schema data: `ApiResponse<FileResourceResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "originalFileName": "string",
    "storageKey": "string",
    "contentType": "string",
    "fileSize": 1,
    "checksumSha256": "string",
    "storageProvider": "LOCAL",
    "accessLevel": "PUBLIC",
    "publicUrl": "string",
    "uploadedById": 1,
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/files/{fileId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `fileId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<FileResourceResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "originalFileName": "string",
    "storageKey": "string",
    "contentType": "string",
    "fileSize": 1,
    "checksumSha256": "string",
    "storageProvider": "LOCAL",
    "accessLevel": "PUBLIC",
    "publicUrl": "string",
    "uploadedById": 1,
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/files/{fileId}`

- Purpose: Delete.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `fileId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
`204 No Content`, no JSON body.

### `PATCH /api/v1/files/{fileId}/access-level`

- Purpose: Update Access Level.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `fileId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `FileAccessLevelUpdateRequest`.
```json
{
  "accessLevel": "PUBLIC"
}
```

- Output:
Schema data: `ApiResponse<FileResourceResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "originalFileName": "string",
    "storageKey": "string",
    "contentType": "string",
    "fileSize": 1,
    "checksumSha256": "string",
    "storageProvider": "LOCAL",
    "accessLevel": "PUBLIC",
    "publicUrl": "string",
    "uploadedById": 1,
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/files/{fileId}/download`

- Purpose: Download.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `fileId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Binary download stream with `Content-Type` and `Content-Disposition` headers.
```json
{
  "fileName": "downloaded-file.bin",
  "contentType": "application/octet-stream",
  "body": "binary stream"
}
```

## Leads

### `GET /api/v1/follow-up-tasks`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[PENDING, IN_PROGRESS, COMPLETED, CANCELLED]` | `ACTIVE` |
| `priority` | query | No | `string enum[LOW, MEDIUM, HIGH]` | `LOW` |
| `leadId` | query | No | `integer(int64)` | `1` |
| `assignedAgentId` | query | No | `integer(int64)` | `1` |
| `dueFrom` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `dueTo` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `keyword` | query | No | `string` | `downtown` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `sortDirection` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<FollowUpTaskResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "leadId": 1,
        "title": "string",
        "description": "string",
        "status": "PENDING",
        "priority": "LOW",
        "assignedToId": 1,
        "assignedToName": "string",
        "createdById": 1,
        "createdByName": "string",
        "dueAt": "2026-07-01T09:00:00Z",
        "completedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/follow-up-tasks/my`

- Purpose: List Mine.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[PENDING, IN_PROGRESS, COMPLETED, CANCELLED]` | `ACTIVE` |
| `priority` | query | No | `string enum[LOW, MEDIUM, HIGH]` | `LOW` |
| `leadId` | query | No | `integer(int64)` | `1` |
| `assignedAgentId` | query | No | `integer(int64)` | `1` |
| `dueFrom` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `dueTo` | query | No | `string(date-time)` | `2026-07-01T09:00:00Z` |
| `keyword` | query | No | `string` | `downtown` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `sortDirection` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<FollowUpTaskResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "leadId": 1,
        "title": "string",
        "description": "string",
        "status": "PENDING",
        "priority": "LOW",
        "assignedToId": 1,
        "assignedToName": "string",
        "createdById": 1,
        "createdByName": "string",
        "dueAt": "2026-07-01T09:00:00Z",
        "completedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/follow-up-tasks/{taskId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `taskId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<FollowUpTaskResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "title": "string",
    "description": "string",
    "status": "PENDING",
    "priority": "LOW",
    "assignedToId": 1,
    "assignedToName": "string",
    "createdById": 1,
    "createdByName": "string",
    "dueAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/follow-up-tasks/{taskId}`

- Purpose: Update.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `taskId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `FollowUpTaskUpdateRequest`.
```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW",
  "dueAt": "2026-07-01T09:00:00Z",
  "assignedAgentId": 1
}
```

- Output:
Schema data: `ApiResponse<FollowUpTaskResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "title": "string",
    "description": "string",
    "status": "PENDING",
    "priority": "LOW",
    "assignedToId": 1,
    "assignedToName": "string",
    "createdById": 1,
    "createdByName": "string",
    "dueAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/follow-up-tasks/{taskId}`

- Purpose: Cancel.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `taskId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/follow-up-tasks/{taskId}/status`

- Purpose: Update Status.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `taskId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `FollowUpTaskStatusRequest`.
```json
{
  "status": "PENDING",
  "completedAt": "2026-07-01T09:00:00Z"
}
```

- Output:
Schema data: `ApiResponse<FollowUpTaskResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "title": "string",
    "description": "string",
    "status": "PENDING",
    "priority": "LOW",
    "assignedToId": 1,
    "assignedToName": "string",
    "createdById": 1,
    "createdByName": "string",
    "dueAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/leads`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `keyword` | query | No | `string` | `downtown` |
| `status` | query | No | `string enum[NEW, ASSIGNED, CONTACTED, INTERESTED, VIEWING_SCHEDULED, NEGOTIATING, CLOSED_WON, CLOSED_LOST, INVALID]` | `ACTIVE` |
| `priority` | query | No | `string enum[LOW, MEDIUM, HIGH]` | `LOW` |
| `sourceId` | query | No | `integer(int64)` | `1` |
| `assignedAgentId` | query | No | `integer(int64)` | `1` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<LeadResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "status": "NEW",
        "priority": "LOW",
        "score": 1,
        "message": "string",
        "lostReason": "string",
        "sourceId": 1,
        "sourceCode": "string",
        "sourceName": "string",
        "customerId": 1,
        "customerName": "string",
        "listingId": 1,
        "listingTitle": "string",
        "assignedAgentId": 1,
        "assignedAgentName": "string",
        "createdById": 1,
        "createdByName": "string",
        "lastContactedAt": "2026-07-01T09:00:00Z",
        "convertedAt": "2026-07-01T09:00:00Z",
        "closedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/leads`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `LeadCreateRequest`.
```json
{
  "code": "string",
  "sourceCode": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "priority": "LOW",
  "message": "string",
  "customerId": 1,
  "listingId": 1,
  "assignedAgentId": 1
}
```

- Output:
Schema data: `ApiResponse<LeadResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "NEW",
    "priority": "LOW",
    "score": 1,
    "message": "string",
    "lostReason": "string",
    "sourceId": 1,
    "sourceCode": "string",
    "sourceName": "string",
    "customerId": 1,
    "customerName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "lastContactedAt": "2026-07-01T09:00:00Z",
    "convertedAt": "2026-07-01T09:00:00Z",
    "closedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/leads/{leadId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `leadId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<LeadDetailResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "lead": {
      "id": 1,
      "code": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "status": "NEW",
      "priority": "LOW",
      "score": 1,
      "message": "string",
      "lostReason": "string",
      "sourceId": 1,
      "sourceCode": "string",
      "sourceName": "string",
      "customerId": 1,
      "customerName": "string",
      "listingId": 1,
      "listingTitle": "string",
      "assignedAgentId": 1,
      "assignedAgentName": "string",
      "createdById": 1,
      "createdByName": "string",
      "lastContactedAt": "2026-07-01T09:00:00Z",
      "convertedAt": "2026-07-01T09:00:00Z",
      "closedAt": "2026-07-01T09:00:00Z",
      "createdAt": "2026-07-01T09:00:00Z",
      "updatedAt": "2026-07-01T09:00:00Z"
    },
    "assignments": [
      {
        "id": 1,
        "leadId": 1,
        "assignedToId": 1,
        "assignedToName": "string",
        "assignedById": 1,
        "assignedByName": "string",
        "assignedAt": "2026-07-01T09:00:00Z",
        "unassignedAt": "2026-07-01T09:00:00Z",
        "active": true,
        "notes": "string"
      }
    ],
    "notes": [
      {
        "id": 1,
        "leadId": 1,
        "authorId": 1,
        "authorName": "string",
        "content": "string",
        "pinned": true,
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "activities": [
      {
        "id": 1,
        "leadId": 1,
        "activityType": "CALL",
        "subject": "string",
        "details": "string",
        "actorId": 1,
        "actorName": "string",
        "occurredAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "followUpTasks": [
      {
        "id": 1,
        "leadId": 1,
        "title": "string",
        "description": "string",
        "status": "PENDING",
        "priority": "LOW",
        "assignedToId": 1,
        "assignedToName": "string",
        "createdById": 1,
        "createdByName": "string",
        "dueAt": "2026-07-01T09:00:00Z",
        "completedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/leads/{leadId}/activities`

- Purpose: Add Activity.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `leadId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `LeadActivityRequest`.
```json
{
  "activityType": "CALL",
  "subject": "string",
  "details": "string",
  "occurredAt": "2026-07-01T09:00:00Z"
}
```

- Output:
Schema data: `ApiResponse<LeadActivityResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "activityType": "CALL",
    "subject": "string",
    "details": "string",
    "actorId": 1,
    "actorName": "string",
    "occurredAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/leads/{leadId}/assign`

- Purpose: Assign.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `leadId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `LeadAssignRequest`.
```json
{
  "agentId": 1,
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<LeadAssignmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "assignedToId": 1,
    "assignedToName": "string",
    "assignedById": 1,
    "assignedByName": "string",
    "assignedAt": "2026-07-01T09:00:00Z",
    "unassignedAt": "2026-07-01T09:00:00Z",
    "active": true,
    "notes": "string"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/leads/{leadId}/follow-up-tasks`

- Purpose: Create Follow Up Task.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `leadId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `FollowUpTaskRequest`.
```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW",
  "dueAt": "2026-07-01T09:00:00Z",
  "assignedAgentId": 1
}
```

- Output:
Schema data: `ApiResponse<FollowUpTaskResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "title": "string",
    "description": "string",
    "status": "PENDING",
    "priority": "LOW",
    "assignedToId": 1,
    "assignedToName": "string",
    "createdById": 1,
    "createdByName": "string",
    "dueAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/leads/{leadId}/notes`

- Purpose: Add Note.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `leadId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `LeadNoteRequest`.
```json
{
  "content": "string",
  "pinned": true
}
```

- Output:
Schema data: `ApiResponse<LeadNoteResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "authorId": 1,
    "authorName": "string",
    "content": "string",
    "pinned": true,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/leads/{leadId}/status`

- Purpose: Update Status.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `leadId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `LeadStatusUpdateRequest`.
```json
{
  "status": "NEW",
  "reason": "string"
}
```

- Output:
Schema data: `ApiResponse<LeadResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "NEW",
    "priority": "LOW",
    "score": 1,
    "message": "string",
    "lostReason": "string",
    "sourceId": 1,
    "sourceCode": "string",
    "sourceName": "string",
    "customerId": 1,
    "customerName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "lastContactedAt": "2026-07-01T09:00:00Z",
    "convertedAt": "2026-07-01T09:00:00Z",
    "closedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Listings

### `GET /api/v1/listings`

- Purpose: Search.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[DRAFT, PENDING_REVIEW, APPROVED, REJECTED, PUBLISHED, UNPUBLISHED, EXPIRED, SOLD, RENTED]` | `ACTIVE` |
| `purpose` | query | No | `string enum[SALE, RENT]` | `SALE` |
| `createdBy` | query | No | `integer(int64)` | `1` |
| `propertyId` | query | No | `integer(int64)` | `1` |
| `keyword` | query | No | `string` | `downtown` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `sortDirection` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<InternalListingDetailResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "title": "string",
        "slug": "string",
        "description": "string",
        "purpose": "SALE",
        "status": "DRAFT",
        "visibility": "PUBLIC",
        "askingPrice": 1000000,
        "currency": "string",
        "seoTitle": "string",
        "seoDescription": "string",
        "seoKeywords": "string",
        "rejectionReason": "string",
        "submittedAt": "2026-07-01T09:00:00Z",
        "reviewedAt": "2026-07-01T09:00:00Z",
        "publishedAt": "2026-07-01T09:00:00Z",
        "unpublishedAt": "2026-07-01T09:00:00Z",
        "expiresAt": "2026-07-01T09:00:00Z",
        "featuredUntil": "2026-07-01T09:00:00Z",
        "viewCount": 1,
        "favoriteCount": 1,
        "property": {
          "id": 1,
          "code": "string",
          "name": "string",
          "propertyTypeId": 1,
          "propertyTypeCode": "string",
          "propertyTypeName": "string",
          "purpose": "SALE",
          "status": "DRAFT",
          "price": 1000000,
          "currency": "string",
          "landArea": 1000000,
          "floorArea": 1000000,
          "bedrooms": 1,
          "bathrooms": 1,
          "createdById": 1,
          "createdByName": "string",
          "assignedAgentId": 1,
          "assignedAgentName": "string",
          "fullAddress": "string"
        },
        "creator": {
          "id": 1,
          "fullName": "string",
          "email": "string"
        },
        "reviewer": {
          "id": 1,
          "fullName": "string",
          "email": "string"
        },
        "listingPackage": {
          "id": 1,
          "code": "string",
          "name": "string",
          "durationDays": 1,
          "price": 1000000,
          "active": true
        },
        "statusHistory": [
          {
            "id": 1,
            "fromStatus": "DRAFT",
            "toStatus": "DRAFT",
            "changedBy": {
              "id": 1,
              "fullName": "string",
              "email": "string"
            },
            "reason": "string",
            "createdAt": "2026-07-01T09:00:00Z"
          }
        ],
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/listings`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `ListingCreateRequest`.
```json
{
  "propertyId": 1,
  "code": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "purpose": "SALE",
  "visibility": "PUBLIC",
  "askingPrice": 1000000,
  "currency": "string",
  "listingPackageId": 1,
  "seoTitle": "string",
  "seoDescription": "string",
  "seoKeywords": "string"
}
```

- Output:
Schema data: `ApiResponse<ListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "createdById": 1,
    "createdByName": "string",
    "listingPackageId": 1,
    "listingPackageCode": "string",
    "listingPackageName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "reviewedById": 1,
    "reviewedByName": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/listings/favorites`

- Purpose: Get My Favorites.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<PublicListingResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "propertyId": 1,
        "propertyCode": "string",
        "propertyName": "string",
        "propertyTypeId": 1,
        "propertyTypeName": "string",
        "title": "string",
        "slug": "string",
        "description": "string",
        "purpose": "SALE",
        "status": "DRAFT",
        "askingPrice": 1000000,
        "currency": "string",
        "landArea": 1000000,
        "floorArea": 1000000,
        "bedrooms": 1,
        "bathrooms": 1,
        "provinceId": 1,
        "provinceName": "string",
        "districtId": 1,
        "districtName": "string",
        "wardId": 1,
        "wardName": "string",
        "streetAddress": "string",
        "fullAddress": "string",
        "viewCount": 1,
        "publishedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/listings/{listingId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<InternalListingDetailResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "expiresAt": "2026-07-01T09:00:00Z",
    "featuredUntil": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "favoriteCount": 1,
    "property": {
      "id": 1,
      "code": "string",
      "name": "string",
      "propertyTypeId": 1,
      "propertyTypeCode": "string",
      "propertyTypeName": "string",
      "purpose": "SALE",
      "status": "DRAFT",
      "price": 1000000,
      "currency": "string",
      "landArea": 1000000,
      "floorArea": 1000000,
      "bedrooms": 1,
      "bathrooms": 1,
      "createdById": 1,
      "createdByName": "string",
      "assignedAgentId": 1,
      "assignedAgentName": "string",
      "fullAddress": "string"
    },
    "creator": {
      "id": 1,
      "fullName": "string",
      "email": "string"
    },
    "reviewer": {
      "id": 1,
      "fullName": "string",
      "email": "string"
    },
    "listingPackage": {
      "id": 1,
      "code": "string",
      "name": "string",
      "durationDays": 1,
      "price": 1000000,
      "active": true
    },
    "statusHistory": [
      {
        "id": 1,
        "fromStatus": "DRAFT",
        "toStatus": "DRAFT",
        "changedBy": {
          "id": 1,
          "fullName": "string",
          "email": "string"
        },
        "reason": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/listings/{listingId}`

- Purpose: Update.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ListingUpdateRequest`.
```json
{
  "title": "string",
  "slug": "string",
  "description": "string",
  "purpose": "SALE",
  "visibility": "PUBLIC",
  "askingPrice": 1000000,
  "currency": "string",
  "listingPackageId": 1,
  "seoTitle": "string",
  "seoDescription": "string",
  "seoKeywords": "string"
}
```

- Output:
Schema data: `ApiResponse<ListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "createdById": 1,
    "createdByName": "string",
    "listingPackageId": 1,
    "listingPackageCode": "string",
    "listingPackageName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "reviewedById": 1,
    "reviewedByName": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/listings/{listingId}/approve`

- Purpose: Approve.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "createdById": 1,
    "createdByName": "string",
    "listingPackageId": 1,
    "listingPackageCode": "string",
    "listingPackageName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "reviewedById": 1,
    "reviewedByName": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/listings/{listingId}/favorite`

- Purpose: Favorite.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PublicListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "propertyTypeId": 1,
    "propertyTypeName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "askingPrice": 1000000,
    "currency": "string",
    "landArea": 1000000,
    "floorArea": 1000000,
    "bedrooms": 1,
    "bathrooms": 1,
    "provinceId": 1,
    "provinceName": "string",
    "districtId": 1,
    "districtName": "string",
    "wardId": 1,
    "wardName": "string",
    "streetAddress": "string",
    "fullAddress": "string",
    "viewCount": 1,
    "publishedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/listings/{listingId}/favorite`

- Purpose: Unfavorite.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/listings/{listingId}/publish`

- Purpose: Publish.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "createdById": 1,
    "createdByName": "string",
    "listingPackageId": 1,
    "listingPackageCode": "string",
    "listingPackageName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "reviewedById": 1,
    "reviewedByName": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/listings/{listingId}/reject`

- Purpose: Reject.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `RejectListingRequest`.
```json
{
  "reason": "string"
}
```

- Output:
Schema data: `ApiResponse<ListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "createdById": 1,
    "createdByName": "string",
    "listingPackageId": 1,
    "listingPackageCode": "string",
    "listingPackageName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "reviewedById": 1,
    "reviewedByName": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/listings/{listingId}/submit`

- Purpose: Submit.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "createdById": 1,
    "createdByName": "string",
    "listingPackageId": 1,
    "listingPackageCode": "string",
    "listingPackageName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "reviewedById": 1,
    "reviewedByName": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/listings/{listingId}/unpublish`

- Purpose: Unpublish.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<ListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "createdById": 1,
    "createdByName": "string",
    "listingPackageId": 1,
    "listingPackageCode": "string",
    "listingPackageName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "visibility": "PUBLIC",
    "askingPrice": 1000000,
    "currency": "string",
    "seoTitle": "string",
    "seoDescription": "string",
    "seoKeywords": "string",
    "reviewedById": 1,
    "reviewedByName": "string",
    "rejectionReason": "string",
    "submittedAt": "2026-07-01T09:00:00Z",
    "reviewedAt": "2026-07-01T09:00:00Z",
    "publishedAt": "2026-07-01T09:00:00Z",
    "unpublishedAt": "2026-07-01T09:00:00Z",
    "viewCount": 1,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/search/listings`

- Purpose: Search.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `keyword` | query | No | `string` | `downtown` |
| `propertyTypeId` | query | No | `integer(int64)` | `1` |
| `purpose` | query | No | `string enum[SALE, RENT]` | `SALE` |
| `provinceId` | query | No | `integer(int64)` | `1` |
| `districtId` | query | No | `integer(int64)` | `1` |
| `wardId` | query | No | `integer(int64)` | `1` |
| `minPrice` | query | No | `number` | `1000000` |
| `maxPrice` | query | No | `number` | `1000000` |
| `minArea` | query | No | `number` | `1000000` |
| `maxArea` | query | No | `number` | `1000000` |
| `bedrooms` | query | No | `integer(int32)` | `1` |
| `bathrooms` | query | No | `integer(int32)` | `1` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<PublicListingResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "propertyId": 1,
        "propertyCode": "string",
        "propertyName": "string",
        "propertyTypeId": 1,
        "propertyTypeName": "string",
        "title": "string",
        "slug": "string",
        "description": "string",
        "purpose": "SALE",
        "status": "DRAFT",
        "askingPrice": 1000000,
        "currency": "string",
        "landArea": 1000000,
        "floorArea": 1000000,
        "bedrooms": 1,
        "bathrooms": 1,
        "provinceId": 1,
        "provinceName": "string",
        "districtId": 1,
        "districtName": "string",
        "wardId": 1,
        "wardName": "string",
        "streetAddress": "string",
        "fullAddress": "string",
        "viewCount": 1,
        "publishedAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/search/listings/{listingId}/appointment-requests`

- Purpose: Create Appointment Request.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ListingAppointmentRequest`.
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "preferredStartAt": "2026-07-01T09:00:00Z",
  "preferredEndAt": "2026-07-01T09:00:00Z",
  "message": "string"
}
```

- Output:
Schema data: `ApiResponse<AppointmentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "title": "string",
    "status": "PENDING",
    "customerId": 1,
    "customerName": "string",
    "agentId": 1,
    "agentName": "string",
    "propertyId": 1,
    "propertyName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "leadId": 1,
    "leadCode": "string",
    "createdById": 1,
    "createdByName": "string",
    "rescheduledFromId": 1,
    "startAt": "2026-07-01T09:00:00Z",
    "endAt": "2026-07-01T09:00:00Z",
    "timezone": "string",
    "meetingLocation": "string",
    "notes": "string",
    "cancellationReason": "string",
    "cancelledById": 1,
    "confirmedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "completedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "participants": [
      {
        "id": 1,
        "userId": 1,
        "userName": "string",
        "participantRole": "CUSTOMER",
        "responseStatus": "INVITED",
        "respondedAt": "2026-07-01T09:00:00Z",
        "notes": "string"
      }
    ],
    "feedbacks": [
      {
        "id": 1,
        "appointmentId": 1,
        "submittedById": 1,
        "submittedByName": "string",
        "rating": 1,
        "interestLevel": "HIGH",
        "comments": "string",
        "positivePoints": "string",
        "concerns": "string",
        "nextAction": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/search/listings/{listingId}/inquiries`

- Purpose: Create Inquiry.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `listingId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ListingInquiryRequest`.
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "message": "string",
  "preferredContactMethod": "string"
}
```

- Output:
Schema data: `ApiResponse<LeadResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "NEW",
    "priority": "LOW",
    "score": 1,
    "message": "string",
    "lostReason": "string",
    "sourceId": 1,
    "sourceCode": "string",
    "sourceName": "string",
    "customerId": 1,
    "customerName": "string",
    "listingId": 1,
    "listingTitle": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "lastContactedAt": "2026-07-01T09:00:00Z",
    "convertedAt": "2026-07-01T09:00:00Z",
    "closedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/search/listings/{slug}`

- Purpose: Get.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `slug` | path | Yes | `string` | `string` |
| `X-Session-Id` | header | No | `string` | `string` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PublicListingResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "propertyTypeId": 1,
    "propertyTypeName": "string",
    "title": "string",
    "slug": "string",
    "description": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "askingPrice": 1000000,
    "currency": "string",
    "landArea": 1000000,
    "floorArea": 1000000,
    "bedrooms": 1,
    "bathrooms": 1,
    "provinceId": 1,
    "provinceName": "string",
    "districtId": 1,
    "districtName": "string",
    "wardId": 1,
    "wardName": "string",
    "streetAddress": "string",
    "fullAddress": "string",
    "viewCount": 1,
    "publishedAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Notifications

### `GET /api/v1/notifications`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `unread` | query | No | `boolean` | `True` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<NotificationResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "type": "string",
        "title": "string",
        "message": "string",
        "actionUrl": "string",
        "referenceType": "string",
        "referenceId": 1,
        "metadataJson": "string",
        "read": true,
        "readAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/notifications/read-all`

- Purpose: Mark All Read.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<MarkAllReadResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "updatedCount": 1
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/notifications/unread-count`

- Purpose: Unread Count.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<UnreadCountResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "unreadCount": 1
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/notifications/{notificationId}/read`

- Purpose: Mark Read.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `notificationId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<NotificationResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "type": "string",
    "title": "string",
    "message": "string",
    "actionUrl": "string",
    "referenceType": "string",
    "referenceId": 1,
    "metadataJson": "string",
    "read": true,
    "readAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Properties

### `GET /api/v1/properties`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `keyword` | query | No | `string` | `downtown` |
| `propertyTypeId` | query | No | `integer(int64)` | `1` |
| `purpose` | query | No | `string enum[SALE, RENT]` | `SALE` |
| `provinceId` | query | No | `integer(int64)` | `1` |
| `districtId` | query | No | `integer(int64)` | `1` |
| `wardId` | query | No | `integer(int64)` | `1` |
| `minPrice` | query | No | `number` | `1000000` |
| `maxPrice` | query | No | `number` | `1000000` |
| `minArea` | query | No | `number` | `1000000` |
| `maxArea` | query | No | `number` | `1000000` |
| `bedrooms` | query | No | `integer(int32)` | `1` |
| `bathrooms` | query | No | `integer(int32)` | `1` |
| `status` | query | No | `string enum[DRAFT, AVAILABLE, RESERVED, SOLD, RENTED, INACTIVE, DELETED]` | `ACTIVE` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<PropertyResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "name": "string",
        "description": "string",
        "propertyTypeId": 1,
        "propertyTypeCode": "string",
        "propertyTypeName": "string",
        "purpose": "SALE",
        "status": "DRAFT",
        "price": 1000000,
        "currency": "string",
        "landArea": 1000000,
        "floorArea": 1000000,
        "bedrooms": 1,
        "bathrooms": 1,
        "floors": 1,
        "direction": "NORTH",
        "legalStatus": "PINK_BOOK",
        "furnitureStatus": "UNFURNISHED",
        "videoUrl": "string",
        "virtualTourUrl": "string",
        "availableFrom": "2026-07-01",
        "ownerId": 1,
        "ownerName": "string",
        "createdById": 1,
        "createdByName": "string",
        "assignedAgentId": 1,
        "assignedAgentName": "string",
        "address": {
          "id": 1,
          "provinceId": 1,
          "provinceName": "string",
          "districtId": 1,
          "districtName": "string",
          "wardId": 1,
          "wardName": "string",
          "streetAddress": "string",
          "fullAddress": "string",
          "latitude": 1000000,
          "longitude": 1000000
        },
        "amenities": [
          {
            "id": 1,
            "code": "string",
            "name": "string",
            "category": "ACCESS",
            "details": "string"
          }
        ],
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/properties`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `PropertyUpsertRequest`.
```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "propertyTypeId": 1,
  "purpose": "SALE",
  "price": 1000000,
  "currency": "string",
  "landArea": 1000000,
  "floorArea": 1000000,
  "bedrooms": 1,
  "bathrooms": 1,
  "floors": 1,
  "direction": "NORTH",
  "legalStatus": "PINK_BOOK",
  "furnitureStatus": "UNFURNISHED",
  "videoUrl": "string",
  "virtualTourUrl": "string",
  "availableFrom": "2026-07-01",
  "ownerId": 1,
  "assignedAgentId": 1,
  "address": {
    "provinceId": 1,
    "districtId": 1,
    "wardId": 1,
    "streetAddress": "string",
    "fullAddress": "string",
    "latitude": 1000000,
    "longitude": 1000000
  },
  "amenities": [
    {
      "amenityId": 1,
      "details": "string"
    }
  ]
}
```

- Output:
Schema data: `ApiResponse<PropertyResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "name": "string",
    "description": "string",
    "propertyTypeId": 1,
    "propertyTypeCode": "string",
    "propertyTypeName": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "price": 1000000,
    "currency": "string",
    "landArea": 1000000,
    "floorArea": 1000000,
    "bedrooms": 1,
    "bathrooms": 1,
    "floors": 1,
    "direction": "NORTH",
    "legalStatus": "PINK_BOOK",
    "furnitureStatus": "UNFURNISHED",
    "videoUrl": "string",
    "virtualTourUrl": "string",
    "availableFrom": "2026-07-01",
    "ownerId": 1,
    "ownerName": "string",
    "createdById": 1,
    "createdByName": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "address": {
      "id": 1,
      "provinceId": 1,
      "provinceName": "string",
      "districtId": 1,
      "districtName": "string",
      "wardId": 1,
      "wardName": "string",
      "streetAddress": "string",
      "fullAddress": "string",
      "latitude": 1000000,
      "longitude": 1000000
    },
    "amenities": [
      {
        "id": 1,
        "code": "string",
        "name": "string",
        "category": "ACCESS",
        "details": "string"
      }
    ],
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/properties/{propertyId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PropertyResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "name": "string",
    "description": "string",
    "propertyTypeId": 1,
    "propertyTypeCode": "string",
    "propertyTypeName": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "price": 1000000,
    "currency": "string",
    "landArea": 1000000,
    "floorArea": 1000000,
    "bedrooms": 1,
    "bathrooms": 1,
    "floors": 1,
    "direction": "NORTH",
    "legalStatus": "PINK_BOOK",
    "furnitureStatus": "UNFURNISHED",
    "videoUrl": "string",
    "virtualTourUrl": "string",
    "availableFrom": "2026-07-01",
    "ownerId": 1,
    "ownerName": "string",
    "createdById": 1,
    "createdByName": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "address": {
      "id": 1,
      "provinceId": 1,
      "provinceName": "string",
      "districtId": 1,
      "districtName": "string",
      "wardId": 1,
      "wardName": "string",
      "streetAddress": "string",
      "fullAddress": "string",
      "latitude": 1000000,
      "longitude": 1000000
    },
    "amenities": [
      {
        "id": 1,
        "code": "string",
        "name": "string",
        "category": "ACCESS",
        "details": "string"
      }
    ],
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/properties/{propertyId}`

- Purpose: Update.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PropertyUpsertRequest`.
```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "propertyTypeId": 1,
  "purpose": "SALE",
  "price": 1000000,
  "currency": "string",
  "landArea": 1000000,
  "floorArea": 1000000,
  "bedrooms": 1,
  "bathrooms": 1,
  "floors": 1,
  "direction": "NORTH",
  "legalStatus": "PINK_BOOK",
  "furnitureStatus": "UNFURNISHED",
  "videoUrl": "string",
  "virtualTourUrl": "string",
  "availableFrom": "2026-07-01",
  "ownerId": 1,
  "assignedAgentId": 1,
  "address": {
    "provinceId": 1,
    "districtId": 1,
    "wardId": 1,
    "streetAddress": "string",
    "fullAddress": "string",
    "latitude": 1000000,
    "longitude": 1000000
  },
  "amenities": [
    {
      "amenityId": 1,
      "details": "string"
    }
  ]
}
```

- Output:
Schema data: `ApiResponse<PropertyResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "name": "string",
    "description": "string",
    "propertyTypeId": 1,
    "propertyTypeCode": "string",
    "propertyTypeName": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "price": 1000000,
    "currency": "string",
    "landArea": 1000000,
    "floorArea": 1000000,
    "bedrooms": 1,
    "bathrooms": 1,
    "floors": 1,
    "direction": "NORTH",
    "legalStatus": "PINK_BOOK",
    "furnitureStatus": "UNFURNISHED",
    "videoUrl": "string",
    "virtualTourUrl": "string",
    "availableFrom": "2026-07-01",
    "ownerId": 1,
    "ownerName": "string",
    "createdById": 1,
    "createdByName": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "address": {
      "id": 1,
      "provinceId": 1,
      "provinceName": "string",
      "districtId": 1,
      "districtName": "string",
      "wardId": 1,
      "wardName": "string",
      "streetAddress": "string",
      "fullAddress": "string",
      "latitude": 1000000,
      "longitude": 1000000
    },
    "amenities": [
      {
        "id": 1,
        "code": "string",
        "name": "string",
        "category": "ACCESS",
        "details": "string"
      }
    ],
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/properties/{propertyId}`

- Purpose: Delete.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/properties/{propertyId}/cover-image/{imageId}`

- Purpose: Set Cover Image.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `imageId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PropertyImageResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "imageUrl": "string",
    "fileName": "string",
    "mimeType": "string",
    "fileSize": 1,
    "altText": "string",
    "coverImage": true,
    "displayOrder": 1,
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/properties/{propertyId}/images`

- Purpose: List Images.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<PropertyImageResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "imageUrl": "string",
      "fileName": "string",
      "mimeType": "string",
      "fileSize": 1,
      "altText": "string",
      "coverImage": true,
      "displayOrder": 1,
      "uploadedById": 1,
      "uploadedByName": "string",
      "createdAt": "2026-07-01T09:00:00Z"
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/properties/{propertyId}/images`

- Purpose: Upload Image.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `altText` | query | No | `string` | `string` |
| `displayOrder` | query | No | `integer(int32)` | `1` |

- Input:
Content-Type: `multipart/form-data`, schema `object`.
```json
{
  "file": "string"
}
```

- Output:
Schema data: `ApiResponse<PropertyImageResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "imageUrl": "string",
    "fileName": "string",
    "mimeType": "string",
    "fileSize": 1,
    "altText": "string",
    "coverImage": true,
    "displayOrder": 1,
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/properties/{propertyId}/images/reorder`

- Purpose: Reorder Images.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PropertyImageReorderRequest`.
```json
{
  "items": [
    {
      "imageId": 1,
      "displayOrder": 1
    }
  ]
}
```

- Output:
Schema data: `ApiResponse<List<PropertyImageResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "imageUrl": "string",
      "fileName": "string",
      "mimeType": "string",
      "fileSize": 1,
      "altText": "string",
      "coverImage": true,
      "displayOrder": 1,
      "uploadedById": 1,
      "uploadedByName": "string",
      "createdAt": "2026-07-01T09:00:00Z"
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/properties/{propertyId}/images/{imageId}`

- Purpose: Update Image.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `imageId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PropertyImageUpdateRequest`.
```json
{
  "altText": "string",
  "displayOrder": 1
}
```

- Output:
Schema data: `ApiResponse<PropertyImageResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "imageUrl": "string",
    "fileName": "string",
    "mimeType": "string",
    "fileSize": 1,
    "altText": "string",
    "coverImage": true,
    "displayOrder": 1,
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/properties/{propertyId}/images/{imageId}`

- Purpose: Delete Image.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `imageId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/properties/{propertyId}/legal-documents`

- Purpose: List Legal Documents.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<PropertyLegalDocumentResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "documentType": "PINK_BOOK",
      "documentNumber": "string",
      "issuedBy": "string",
      "issuedDate": "2026-07-01",
      "expiryDate": "2026-07-01",
      "verificationStatus": "UNVERIFIED",
      "storageKey": "string",
      "documentUrl": "string",
      "fileName": "string",
      "notes": "string",
      "uploadedById": 1,
      "uploadedByName": "string",
      "createdAt": "2026-07-01T09:00:00Z",
      "updatedAt": "2026-07-01T09:00:00Z"
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/properties/{propertyId}/legal-documents`

- Purpose: Upload Legal Document.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `documentType` | query | Yes | `string enum[PINK_BOOK, RED_BOOK, OWNERSHIP_CERTIFICATE, LAND_USE_CERTIFICATE, CONSTRUCTION_PERMIT, SALE_CONTRACT, OTHER]` | `PINK_BOOK` |
| `documentNumber` | query | No | `string` | `string` |
| `issuedBy` | query | No | `string` | `string` |
| `issuedDate` | query | No | `string(date)` | `2026-07-01` |
| `expiryDate` | query | No | `string(date)` | `2026-07-01` |
| `notes` | query | No | `string` | `string` |

- Input:
Content-Type: `multipart/form-data`, schema `object`.
```json
{
  "file": "string"
}
```

- Output:
Schema data: `ApiResponse<PropertyLegalDocumentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "documentType": "PINK_BOOK",
    "documentNumber": "string",
    "issuedBy": "string",
    "issuedDate": "2026-07-01",
    "expiryDate": "2026-07-01",
    "verificationStatus": "UNVERIFIED",
    "storageKey": "string",
    "documentUrl": "string",
    "fileName": "string",
    "notes": "string",
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/properties/{propertyId}/legal-documents/{documentId}`

- Purpose: Get Legal Document.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `documentId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PropertyLegalDocumentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "documentType": "PINK_BOOK",
    "documentNumber": "string",
    "issuedBy": "string",
    "issuedDate": "2026-07-01",
    "expiryDate": "2026-07-01",
    "verificationStatus": "UNVERIFIED",
    "storageKey": "string",
    "documentUrl": "string",
    "fileName": "string",
    "notes": "string",
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/properties/{propertyId}/legal-documents/{documentId}`

- Purpose: Update Legal Document.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `documentId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PropertyLegalDocumentUpdateRequest`.
```json
{
  "documentType": "PINK_BOOK",
  "documentNumber": "string",
  "issuedBy": "string",
  "issuedDate": "2026-07-01",
  "expiryDate": "2026-07-01",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<PropertyLegalDocumentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "documentType": "PINK_BOOK",
    "documentNumber": "string",
    "issuedBy": "string",
    "issuedDate": "2026-07-01",
    "expiryDate": "2026-07-01",
    "verificationStatus": "UNVERIFIED",
    "storageKey": "string",
    "documentUrl": "string",
    "fileName": "string",
    "notes": "string",
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `DELETE /api/v1/properties/{propertyId}/legal-documents/{documentId}`

- Purpose: Delete Legal Document.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `documentId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<Void>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": null,
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/properties/{propertyId}/legal-documents/{documentId}/verify`

- Purpose: Verify Legal Document.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |
| `documentId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PropertyLegalDocumentVerifyRequest`.
```json
{
  "verificationStatus": "UNVERIFIED",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<PropertyLegalDocumentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "documentType": "PINK_BOOK",
    "documentNumber": "string",
    "issuedBy": "string",
    "issuedDate": "2026-07-01",
    "expiryDate": "2026-07-01",
    "verificationStatus": "UNVERIFIED",
    "storageKey": "string",
    "documentUrl": "string",
    "fileName": "string",
    "notes": "string",
    "uploadedById": 1,
    "uploadedByName": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/properties/{propertyId}/status`

- Purpose: Update Status.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `propertyId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `UpdatePropertyStatusRequest`.
```json
{
  "status": "DRAFT"
}
```

- Output:
Schema data: `ApiResponse<PropertyResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "name": "string",
    "description": "string",
    "propertyTypeId": 1,
    "propertyTypeCode": "string",
    "propertyTypeName": "string",
    "purpose": "SALE",
    "status": "DRAFT",
    "price": 1000000,
    "currency": "string",
    "landArea": 1000000,
    "floorArea": 1000000,
    "bedrooms": 1,
    "bathrooms": 1,
    "floors": 1,
    "direction": "NORTH",
    "legalStatus": "PINK_BOOK",
    "furnitureStatus": "UNFURNISHED",
    "videoUrl": "string",
    "virtualTourUrl": "string",
    "availableFrom": "2026-07-01",
    "ownerId": 1,
    "ownerName": "string",
    "createdById": 1,
    "createdByName": "string",
    "assignedAgentId": 1,
    "assignedAgentName": "string",
    "address": {
      "id": 1,
      "provinceId": 1,
      "provinceName": "string",
      "districtId": 1,
      "districtName": "string",
      "wardId": 1,
      "wardName": "string",
      "streetAddress": "string",
      "fullAddress": "string",
      "latitude": 1000000,
      "longitude": 1000000
    },
    "amenities": [
      {
        "id": 1,
        "code": "string",
        "name": "string",
        "category": "ACCESS",
        "details": "string"
      }
    ],
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Reports

### `GET /api/v1/reports/commissions`

- Purpose: Commissions.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `from` | query | Yes | `string(date)` | `2026-07-01` |
| `to` | query | Yes | `string(date)` | `2026-07-01` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<CommissionReportResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "from": "2026-07-01",
    "to": "2026-07-01",
    "totalCommissions": 1,
    "commissionsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "commissionAmounts": [
      {
        "currency": "string",
        "count": 1,
        "amount": 1000000
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/reports/leads`

- Purpose: Leads.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `from` | query | Yes | `string(date)` | `2026-07-01` |
| `to` | query | Yes | `string(date)` | `2026-07-01` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<LeadReportResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "from": "2026-07-01",
    "to": "2026-07-01",
    "totalLeads": 1,
    "leadsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/reports/revenue`

- Purpose: Revenue.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `from` | query | Yes | `string(date)` | `2026-07-01` |
| `to` | query | Yes | `string(date)` | `2026-07-01` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<RevenueReportResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "from": "2026-07-01",
    "to": "2026-07-01",
    "revenueSummary": [
      {
        "currency": "string",
        "completedTransactions": 1,
        "completedTransactionValue": 1000000,
        "completedPayments": 1000000,
        "verifiedDeposits": 1000000,
        "paidCommissions": 1000000
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/reports/transactions`

- Purpose: Transactions.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `from` | query | Yes | `string(date)` | `2026-07-01` |
| `to` | query | Yes | `string(date)` | `2026-07-01` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<TransactionReportResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "from": "2026-07-01",
    "to": "2026-07-01",
    "totalTransactions": 1,
    "transactionsByStatus": [
      {
        "status": "string",
        "count": 1
      }
    ],
    "completedTransactionValues": [
      {
        "currency": "string",
        "count": 1,
        "amount": 1000000
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Transactions

### `GET /api/v1/transactions`

- Purpose: List.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `status` | query | No | `string enum[PENDING, DEPOSITED, CONTRACT_SIGNED, PAYMENT_IN_PROGRESS, COMPLETED, CANCELLED, REFUNDED]` | `ACTIVE` |
| `transactionType` | query | No | `string enum[SALE, LEASE]` | `SALE` |
| `propertyId` | query | No | `integer(int64)` | `1` |
| `customerId` | query | No | `integer(int64)` | `1` |
| `agentId` | query | No | `integer(int64)` | `1` |
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<TransactionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "code": "string",
        "transactionType": "SALE",
        "status": "PENDING",
        "contractId": 1,
        "contractCode": "string",
        "propertyId": 1,
        "propertyCode": "string",
        "propertyName": "string",
        "customerId": 1,
        "customerCode": "string",
        "customerName": "string",
        "ownerId": 1,
        "ownerName": "string",
        "agentId": 1,
        "agentName": "string",
        "createdById": 1,
        "createdByName": "string",
        "agreedValue": 1000000,
        "confirmedAmount": 1000000,
        "remainingAmount": 1000000,
        "currency": "string",
        "transactionDate": "2026-07-01",
        "expectedCompletionDate": "2026-07-01",
        "completedAt": "2026-07-01T09:00:00Z",
        "cancelledAt": "2026-07-01T09:00:00Z",
        "refundedAt": "2026-07-01T09:00:00Z",
        "cancellationReason": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z",
        "deposits": [
          {
            "id": 1,
            "amount": 1000000,
            "currency": "string",
            "paymentMethod": "CASH",
            "status": "PENDING",
            "referenceNumber": "string",
            "idempotencyKey": "string",
            "dueDate": "2026-07-01",
            "receivedAt": "2026-07-01T09:00:00Z",
            "verifiedAt": "2026-07-01T09:00:00Z",
            "receivedById": 1,
            "receivedByName": "string",
            "notes": "string",
            "createdAt": "2026-07-01T09:00:00Z"
          }
        ],
        "paymentSchedules": [
          {
            "id": 1,
            "installmentNumber": 1,
            "label": "string",
            "dueDate": "2026-07-01",
            "amount": 1000000,
            "paidAmount": 1000000,
            "currency": "string",
            "status": "PENDING",
            "paidAt": "2026-07-01T09:00:00Z",
            "notes": "string",
            "createdAt": "2026-07-01T09:00:00Z",
            "updatedAt": "2026-07-01T09:00:00Z"
          }
        ],
        "payments": [
          {
            "id": 1,
            "paymentScheduleId": 1,
            "amount": 1000000,
            "currency": "string",
            "paymentMethod": "CASH",
            "status": "PENDING",
            "referenceNumber": "string",
            "idempotencyKey": "string",
            "paidAt": "2026-07-01T09:00:00Z",
            "confirmedAt": "2026-07-01T09:00:00Z",
            "receivedById": 1,
            "receivedByName": "string",
            "notes": "string",
            "receipt": {
              "id": 1,
              "receiptNumber": "string",
              "issuedAt": "2026-07-01T09:00:00Z",
              "amount": 1000000,
              "currency": "string",
              "payerName": "string",
              "issuedById": 1,
              "issuedByName": "string",
              "notes": "string",
              "createdAt": "2026-07-01T09:00:00Z"
            },
            "createdAt": "2026-07-01T09:00:00Z"
          }
        ],
        "invoices": [
          {
            "id": 1,
            "invoiceNumber": "string",
            "status": "DRAFT",
            "issueDate": "2026-07-01",
            "dueDate": "2026-07-01",
            "subtotal": 1000000,
            "taxAmount": 1000000,
            "totalAmount": 1000000,
            "currency": "string",
            "billedToName": "string",
            "billedToEmail": "string",
            "billedToAddress": "string",
            "issuedById": 1,
            "issuedByName": "string",
            "notes": "string",
            "createdAt": "2026-07-01T09:00:00Z"
          }
        ]
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/transactions`

- Purpose: Create.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
Content-Type: `application/json`, schema `TransactionCreateRequest`.
```json
{
  "code": "string",
  "contractId": 1,
  "propertyId": 1,
  "customerId": 1,
  "agentId": 1,
  "transactionType": "SALE",
  "agreedValue": 1000000,
  "currency": "string",
  "transactionDate": "2026-07-01",
  "expectedCompletionDate": "2026-07-01",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<TransactionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "transactionType": "SALE",
    "status": "PENDING",
    "contractId": 1,
    "contractCode": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "agreedValue": 1000000,
    "confirmedAmount": 1000000,
    "remainingAmount": 1000000,
    "currency": "string",
    "transactionDate": "2026-07-01",
    "expectedCompletionDate": "2026-07-01",
    "completedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "refundedAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "deposits": [
      {
        "id": 1,
        "amount": 1000000,
        "currency": "string",
        "paymentMethod": "CASH",
        "status": "PENDING",
        "referenceNumber": "string",
        "idempotencyKey": "string",
        "dueDate": "2026-07-01",
        "receivedAt": "2026-07-01T09:00:00Z",
        "verifiedAt": "2026-07-01T09:00:00Z",
        "receivedById": 1,
        "receivedByName": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "paymentSchedules": [
      {
        "id": 1,
        "installmentNumber": 1,
        "label": "string",
        "dueDate": "2026-07-01",
        "amount": 1000000,
        "paidAmount": 1000000,
        "currency": "string",
        "status": "PENDING",
        "paidAt": "2026-07-01T09:00:00Z",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "payments": [
      {
        "id": 1,
        "paymentScheduleId": 1,
        "amount": 1000000,
        "currency": "string",
        "paymentMethod": "CASH",
        "status": "PENDING",
        "referenceNumber": "string",
        "idempotencyKey": "string",
        "paidAt": "2026-07-01T09:00:00Z",
        "confirmedAt": "2026-07-01T09:00:00Z",
        "receivedById": 1,
        "receivedByName": "string",
        "notes": "string",
        "receipt": {
          "id": 1,
          "receiptNumber": "string",
          "issuedAt": "2026-07-01T09:00:00Z",
          "amount": 1000000,
          "currency": "string",
          "payerName": "string",
          "issuedById": 1,
          "issuedByName": "string",
          "notes": "string",
          "createdAt": "2026-07-01T09:00:00Z"
        },
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "invoices": [
      {
        "id": 1,
        "invoiceNumber": "string",
        "status": "DRAFT",
        "issueDate": "2026-07-01",
        "dueDate": "2026-07-01",
        "subtotal": 1000000,
        "taxAmount": 1000000,
        "totalAmount": 1000000,
        "currency": "string",
        "billedToName": "string",
        "billedToEmail": "string",
        "billedToAddress": "string",
        "issuedById": 1,
        "issuedByName": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/transactions/{transactionId}`

- Purpose: Get.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `transactionId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<TransactionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "transactionType": "SALE",
    "status": "PENDING",
    "contractId": 1,
    "contractCode": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "agreedValue": 1000000,
    "confirmedAmount": 1000000,
    "remainingAmount": 1000000,
    "currency": "string",
    "transactionDate": "2026-07-01",
    "expectedCompletionDate": "2026-07-01",
    "completedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "refundedAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "deposits": [
      {
        "id": 1,
        "amount": 1000000,
        "currency": "string",
        "paymentMethod": "CASH",
        "status": "PENDING",
        "referenceNumber": "string",
        "idempotencyKey": "string",
        "dueDate": "2026-07-01",
        "receivedAt": "2026-07-01T09:00:00Z",
        "verifiedAt": "2026-07-01T09:00:00Z",
        "receivedById": 1,
        "receivedByName": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "paymentSchedules": [
      {
        "id": 1,
        "installmentNumber": 1,
        "label": "string",
        "dueDate": "2026-07-01",
        "amount": 1000000,
        "paidAmount": 1000000,
        "currency": "string",
        "status": "PENDING",
        "paidAt": "2026-07-01T09:00:00Z",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "payments": [
      {
        "id": 1,
        "paymentScheduleId": 1,
        "amount": 1000000,
        "currency": "string",
        "paymentMethod": "CASH",
        "status": "PENDING",
        "referenceNumber": "string",
        "idempotencyKey": "string",
        "paidAt": "2026-07-01T09:00:00Z",
        "confirmedAt": "2026-07-01T09:00:00Z",
        "receivedById": 1,
        "receivedByName": "string",
        "notes": "string",
        "receipt": {
          "id": 1,
          "receiptNumber": "string",
          "issuedAt": "2026-07-01T09:00:00Z",
          "amount": 1000000,
          "currency": "string",
          "payerName": "string",
          "issuedById": 1,
          "issuedByName": "string",
          "notes": "string",
          "createdAt": "2026-07-01T09:00:00Z"
        },
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "invoices": [
      {
        "id": 1,
        "invoiceNumber": "string",
        "status": "DRAFT",
        "issueDate": "2026-07-01",
        "dueDate": "2026-07-01",
        "subtotal": 1000000,
        "taxAmount": 1000000,
        "totalAmount": 1000000,
        "currency": "string",
        "billedToName": "string",
        "billedToEmail": "string",
        "billedToAddress": "string",
        "issuedById": 1,
        "issuedByName": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/transactions/{transactionId}/deposits`

- Purpose: Add Deposit.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `transactionId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `DepositCreateRequest`.
```json
{
  "amount": 1000000,
  "currency": "string",
  "paymentMethod": "CASH",
  "referenceNumber": "string",
  "idempotencyKey": "string",
  "dueDate": "2026-07-01",
  "receivedAt": "2026-07-01T09:00:00Z",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<DepositResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "amount": 1000000,
    "currency": "string",
    "paymentMethod": "CASH",
    "status": "PENDING",
    "referenceNumber": "string",
    "idempotencyKey": "string",
    "dueDate": "2026-07-01",
    "receivedAt": "2026-07-01T09:00:00Z",
    "verifiedAt": "2026-07-01T09:00:00Z",
    "receivedById": 1,
    "receivedByName": "string",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/transactions/{transactionId}/invoices`

- Purpose: Add Invoice.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `transactionId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `InvoiceCreateRequest`.
```json
{
  "invoiceNumber": "string",
  "issueDate": "2026-07-01",
  "dueDate": "2026-07-01",
  "subtotal": 1000000,
  "taxAmount": 1000000,
  "currency": "string",
  "billedToName": "string",
  "billedToEmail": "string",
  "billedToAddress": "string",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<InvoiceResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "invoiceNumber": "string",
    "status": "DRAFT",
    "issueDate": "2026-07-01",
    "dueDate": "2026-07-01",
    "subtotal": 1000000,
    "taxAmount": 1000000,
    "totalAmount": 1000000,
    "currency": "string",
    "billedToName": "string",
    "billedToEmail": "string",
    "billedToAddress": "string",
    "issuedById": 1,
    "issuedByName": "string",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/transactions/{transactionId}/payment-schedules`

- Purpose: Add Payment Schedule.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `transactionId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PaymentScheduleCreateRequest`.
```json
{
  "installmentNumber": 1,
  "label": "string",
  "dueDate": "2026-07-01",
  "amount": 1000000,
  "currency": "string",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<PaymentScheduleResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "installmentNumber": 1,
    "label": "string",
    "dueDate": "2026-07-01",
    "amount": 1000000,
    "paidAmount": 1000000,
    "currency": "string",
    "status": "PENDING",
    "paidAt": "2026-07-01T09:00:00Z",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/transactions/{transactionId}/payments`

- Purpose: Add Payment.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `transactionId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `PaymentCreateRequest`.
```json
{
  "paymentScheduleId": 1,
  "amount": 1000000,
  "currency": "string",
  "paymentMethod": "CASH",
  "referenceNumber": "string",
  "idempotencyKey": "string",
  "paidAt": "2026-07-01T09:00:00Z",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<PaymentResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "paymentScheduleId": 1,
    "amount": 1000000,
    "currency": "string",
    "paymentMethod": "CASH",
    "status": "PENDING",
    "referenceNumber": "string",
    "idempotencyKey": "string",
    "paidAt": "2026-07-01T09:00:00Z",
    "confirmedAt": "2026-07-01T09:00:00Z",
    "receivedById": 1,
    "receivedByName": "string",
    "notes": "string",
    "receipt": {
      "id": 1,
      "receiptNumber": "string",
      "issuedAt": "2026-07-01T09:00:00Z",
      "amount": 1000000,
      "currency": "string",
      "payerName": "string",
      "issuedById": 1,
      "issuedByName": "string",
      "notes": "string",
      "createdAt": "2026-07-01T09:00:00Z"
    },
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `POST /api/v1/transactions/{transactionId}/payments/{paymentId}/receipt`

- Purpose: Add Receipt.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `transactionId` | path | Yes | `integer(int64)` | `1` |
| `paymentId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `ReceiptCreateRequest`.
```json
{
  "receiptNumber": "string",
  "issuedAt": "2026-07-01T09:00:00Z",
  "payerName": "string",
  "notes": "string"
}
```

- Output:
Schema data: `ApiResponse<ReceiptResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "receiptNumber": "string",
    "issuedAt": "2026-07-01T09:00:00Z",
    "amount": 1000000,
    "currency": "string",
    "payerName": "string",
    "issuedById": 1,
    "issuedByName": "string",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z"
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/transactions/{transactionId}/status`

- Purpose: Update Status.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `transactionId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `TransactionStatusUpdateRequest`.
```json
{
  "status": "PENDING",
  "reason": "string"
}
```

- Output:
Schema data: `ApiResponse<TransactionResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "code": "string",
    "transactionType": "SALE",
    "status": "PENDING",
    "contractId": 1,
    "contractCode": "string",
    "propertyId": 1,
    "propertyCode": "string",
    "propertyName": "string",
    "customerId": 1,
    "customerCode": "string",
    "customerName": "string",
    "ownerId": 1,
    "ownerName": "string",
    "agentId": 1,
    "agentName": "string",
    "createdById": 1,
    "createdByName": "string",
    "agreedValue": 1000000,
    "confirmedAmount": 1000000,
    "remainingAmount": 1000000,
    "currency": "string",
    "transactionDate": "2026-07-01",
    "expectedCompletionDate": "2026-07-01",
    "completedAt": "2026-07-01T09:00:00Z",
    "cancelledAt": "2026-07-01T09:00:00Z",
    "refundedAt": "2026-07-01T09:00:00Z",
    "cancellationReason": "string",
    "notes": "string",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "deposits": [
      {
        "id": 1,
        "amount": 1000000,
        "currency": "string",
        "paymentMethod": "CASH",
        "status": "PENDING",
        "referenceNumber": "string",
        "idempotencyKey": "string",
        "dueDate": "2026-07-01",
        "receivedAt": "2026-07-01T09:00:00Z",
        "verifiedAt": "2026-07-01T09:00:00Z",
        "receivedById": 1,
        "receivedByName": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "paymentSchedules": [
      {
        "id": 1,
        "installmentNumber": 1,
        "label": "string",
        "dueDate": "2026-07-01",
        "amount": 1000000,
        "paidAmount": 1000000,
        "currency": "string",
        "status": "PENDING",
        "paidAt": "2026-07-01T09:00:00Z",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z"
      }
    ],
    "payments": [
      {
        "id": 1,
        "paymentScheduleId": 1,
        "amount": 1000000,
        "currency": "string",
        "paymentMethod": "CASH",
        "status": "PENDING",
        "referenceNumber": "string",
        "idempotencyKey": "string",
        "paidAt": "2026-07-01T09:00:00Z",
        "confirmedAt": "2026-07-01T09:00:00Z",
        "receivedById": 1,
        "receivedByName": "string",
        "notes": "string",
        "receipt": {
          "id": 1,
          "receiptNumber": "string",
          "issuedAt": "2026-07-01T09:00:00Z",
          "amount": 1000000,
          "currency": "string",
          "payerName": "string",
          "issuedById": 1,
          "issuedByName": "string",
          "notes": "string",
          "createdAt": "2026-07-01T09:00:00Z"
        },
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ],
    "invoices": [
      {
        "id": 1,
        "invoiceNumber": "string",
        "status": "DRAFT",
        "issueDate": "2026-07-01",
        "dueDate": "2026-07-01",
        "subtotal": 1000000,
        "taxAmount": 1000000,
        "totalAmount": 1000000,
        "currency": "string",
        "billedToName": "string",
        "billedToEmail": "string",
        "billedToAddress": "string",
        "issuedById": 1,
        "issuedByName": "string",
        "notes": "string",
        "createdAt": "2026-07-01T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## User Management

### `GET /api/v1/admin/users`

- Purpose: List Users.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `page` | query | No | `integer(int32)` | `0` |
| `size` | query | No | `integer(int32)` | `20` |
| `sortBy` | query | No | `string` | `string` |
| `direction` | query | No | `string enum[ASC, DESC]` | `ASC` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<PageResponse<UserManagementResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "email": "string",
        "fullName": "string",
        "phone": "string",
        "status": "PENDING_VERIFICATION",
        "emailVerified": true,
        "lockedUntil": "2026-07-01T09:00:00Z",
        "lastLoginAt": "2026-07-01T09:00:00Z",
        "createdAt": "2026-07-01T09:00:00Z",
        "updatedAt": "2026-07-01T09:00:00Z",
        "roles": [
          "string"
        ]
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/admin/users/{userId}`

- Purpose: Get User.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `userId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<UserManagementResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "emailVerified": true,
    "lockedUntil": "2026-07-01T09:00:00Z",
    "lastLoginAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "roles": [
      "string"
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PUT /api/v1/admin/users/{userId}/roles`

- Purpose: Assign Roles.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `userId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `AssignUserRolesRequest`.
```json
{
  "roles": [
    "ADMIN"
  ]
}
```

- Output:
Schema data: `ApiResponse<UserManagementResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "emailVerified": true,
    "lockedUntil": "2026-07-01T09:00:00Z",
    "lastLoginAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "roles": [
      "string"
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `PATCH /api/v1/admin/users/{userId}/status`

- Purpose: Update Status.
- Auth: Public.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `userId` | path | Yes | `integer(int64)` | `1` |

- Input:
Content-Type: `application/json`, schema `UpdateUserStatusRequest`.
```json
{
  "status": "PENDING_VERIFICATION"
}
```

- Output:
Schema data: `ApiResponse<UserManagementResponse>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "status": "PENDING_VERIFICATION",
    "emailVerified": true,
    "lockedUntil": "2026-07-01T09:00:00Z",
    "lastLoginAt": "2026-07-01T09:00:00Z",
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z",
    "roles": [
      "string"
    ]
  },
  "timestamp": "2026-07-01T09:00:00Z"
}
```

## Master Data

### `GET /api/v1/master-data/amenities`

- Purpose: Amenities.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `category` | query | No | `string enum[ACCESS, SECURITY, LEISURE, FEATURE]` | `ACCESS` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<AmenityOptionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "code": "string",
      "name": "string",
      "category": "ACCESS",
      "description": "string",
      "displayOrder": 1,
      "active": true
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/master-data/districts/{districtId}/wards`

- Purpose: Wards.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `districtId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<LocationOptionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "code": "string",
      "name": "string",
      "administrativeType": "string",
      "active": true
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/master-data/lead-sources`

- Purpose: Lead Sources.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<LeadSourceOptionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "code": "string",
      "name": "string",
      "description": "string",
      "active": true
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/master-data/listing-packages`

- Purpose: Listing Packages.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<ListingPackageOptionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "code": "string",
      "name": "string",
      "description": "string",
      "price": 1000000,
      "currency": "string",
      "durationDays": 1,
      "featured": true,
      "priorityLevel": 1,
      "active": true
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/master-data/property-types`

- Purpose: Property Types.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<PropertyTypeOptionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "code": "string",
      "name": "string",
      "description": "string",
      "displayOrder": 1,
      "active": true
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/master-data/provinces`

- Purpose: Provinces.
- Auth: Bearer JWT.
- Parameters:
None.

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<LocationOptionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "code": "string",
      "name": "string",
      "administrativeType": "string",
      "active": true
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```

### `GET /api/v1/master-data/provinces/{provinceId}/districts`

- Purpose: Districts.
- Auth: Bearer JWT.
- Parameters:
| Name | Location | Required | Type | Example |
|---|---|---:|---|---|
| `provinceId` | path | Yes | `integer(int64)` | `1` |

- Input:
No request body. Data is provided through path/query parameters when applicable.

- Output:
Schema data: `ApiResponse<List<LocationOptionResponse>>`.
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": [
    {
      "id": 1,
      "code": "string",
      "name": "string",
      "administrativeType": "string",
      "active": true
    }
  ],
  "timestamp": "2026-07-01T09:00:00Z"
}
```
