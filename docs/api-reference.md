# API Reference

Complete API endpoint documentation for the DDD Library for NestJS sample application.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Singers](#singers)
  - [Songs](#songs)
- [Data Models](#data-models)
- [Examples](#examples)

## Base URL

All API endpoints are relative to:

```
http://localhost:3000
```

Or your configured `PORT` environment variable.

## Authentication

Currently, the API does not require authentication. In production, you should implement authentication middleware.

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": [
    {
      "property": "fullName",
      "message": "fullName should not be empty"
    }
  ],
  "error": "Bad Request"
}
```

### HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Exception Types

- **DomainException**: Business rule violation
- **ApplicationException**: Application-level error
- **DatabaseException**: Database operation error

## Endpoints

## Singers

### Create Singer

Create a new singer.

**Endpoint**: `POST /singers`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "picture": "https://example.com/picture.jpg",
  "trackingId": "optional-tracking-id"
}
```

**Request Schema**:
- `fullName` (string, required): Singer's full name
- `picture` (string, required): Picture URL or path
- `trackingId` (string, optional): Optional tracking identifier

**Response**: `201 Created`

**Response Body**: Empty

**Example**:
```bash
curl -X POST http://localhost:3000/singers \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "picture": "https://example.com/picture.jpg"
  }'
```

**Domain Events Published**:
- `SingerCreatedDomainEvent`

---

### Get Singer by ID

Retrieve a singer by their ID.

**Endpoint**: `GET /singers/:id`

**Path Parameters**:
- `id` (string, required): Singer UUID

**Response**: `200 OK`

**Response Body**:
```json
{
  "id": "uuid-string",
  "fullName": "John Doe",
  "picture": "https://example.com/picture.jpg",
  "registerDate": "2024-01-01T00:00:00.000Z",
  "isSubscribed": false,
  "subscribedDate": null,
  "status": "registered",
  "songs": [],
  "audit": {
    "createdBy": "system",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": null,
    "updatedAt": null,
    "timestamp": 1704067200000
  }
}
```

**Example**:
```bash
curl http://localhost:3000/singers/{id}
```

**Errors**:
- `404 Not Found`: Singer not found
- `400 Bad Request`: Invalid ID format

---

### Get All Singers

Retrieve all singers with optional pagination and filtering.

**Endpoint**: `GET /singers`

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (registered, subscribed, deleted)
- `isSubscribed` (boolean, optional): Filter by subscription status

**Response**: `200 OK`

**Response Body**:
```json
{
  "data": [
    {
      "id": "uuid-string",
      "fullName": "John Doe",
      "picture": "https://example.com/picture.jpg",
      "registerDate": "2024-01-01T00:00:00.000Z",
      "isSubscribed": false,
      "status": "registered",
      "songs": []
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 1
}
```

**Example**:
```bash
curl "http://localhost:3000/singers?page=1&pageSize=10&status=registered"
```

---

### Change Singer Full Name

Update a singer's full name.

**Endpoint**: `PUT /singers/changename/:id`

**Path Parameters**:
- `id` (string, required): Singer UUID

**Request Body**:
```json
{
  "newFullName": "Jane Doe",
  "trackingId": "optional-tracking-id"
}
```

**Request Schema**:
- `newFullName` (string, required): New full name
- `trackingId` (string, optional): Optional tracking identifier

**Response**: `200 OK`

**Response Body**: Empty

**Example**:
```bash
curl -X PUT http://localhost:3000/singers/changename/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "newFullName": "Jane Doe"
  }'
```

**Errors**:
- `404 Not Found`: Singer not found
- `400 Bad Request`: Invalid full name

---

### Change Singer Picture

Update a singer's picture.

**Endpoint**: `PUT /singers/changepicture/:id`

**Path Parameters**:
- `id` (string, required): Singer UUID

**Request Body**:
```json
{
  "newPicture": "https://example.com/new-picture.jpg",
  "trackingId": "optional-tracking-id"
}
```

**Request Schema**:
- `newPicture` (string, required): New picture URL or path
- `trackingId` (string, optional): Optional tracking identifier

**Response**: `200 OK`

**Response Body**: Empty

**Example**:
```bash
curl -X PUT http://localhost:3000/singers/changepicture/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "newPicture": "https://example.com/new-picture.jpg"
  }'
```

**Errors**:
- `404 Not Found`: Singer not found
- `400 Bad Request`: Invalid picture URL

---

### Subscribe Singer

Subscribe a singer.

**Endpoint**: `PUT /singers`

**Request Body**:
```json
{
  "singerId": "uuid-string",
  "trackingId": "optional-tracking-id"
}
```

**Request Schema**:
- `singerId` (string, required): Singer UUID
- `trackingId` (string, optional): Optional tracking identifier

**Response**: `200 OK`

**Response Body**: Empty

**Example**:
```bash
curl -X PUT http://localhost:3000/singers \
  -H "Content-Type: application/json" \
  -d '{
    "singerId": "uuid-string"
  }'
```

**Domain Events Published**:
- `SingerSubscribedDomainEvent`

**Errors**:
- `404 Not Found`: Singer not found
- `400 Bad Request`: Singer already subscribed (business rule violation)

**Business Rules**:
- A singer cannot subscribe if already subscribed

---

### Remove Singer

Remove (soft delete) a singer.

**Endpoint**: `DELETE /singers/:id`

**Path Parameters**:
- `id` (string, required): Singer UUID

**Response**: `200 OK`

**Response Body**: Empty

**Example**:
```bash
curl -X DELETE http://localhost:3000/singers/{id}
```

**Domain Events Published**:
- `SingerDeletedDomainEvent`

**Errors**:
- `404 Not Found`: Singer not found
- `400 Bad Request`: Cannot remove subscribed singer (business rule violation)

**Business Rules**:
- A subscribed singer cannot be removed

---

## Songs

### Add Song to Singer

Add a song to a singer's collection.

**Endpoint**: `POST /singers/addsong/:id`

**Path Parameters**:
- `id` (string, required): Singer UUID

**Request Body**:
```json
{
  "songName": "My Song",
  "trackingId": "optional-tracking-id"
}
```

**Request Schema**:
- `songName` (string, required): Song name
- `trackingId` (string, optional): Optional tracking identifier

**Response**: `201 Created`

**Response Body**: Empty

**Example**:
```bash
curl -X POST http://localhost:3000/singers/addsong/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "songName": "My Song"
  }'
```

**Errors**:
- `404 Not Found`: Singer not found
- `400 Bad Request`: Invalid song name

**Business Rules**:
- Song name is required
- Song status cannot be inactive

---

### Remove Song from Singer

Remove a song from a singer's collection.

**Endpoint**: `POST /singers`

**Request Body**:
```json
{
  "singerId": "uuid-string",
  "songId": "uuid-string",
  "trackingId": "optional-tracking-id"
}
```

**Request Schema**:
- `singerId` (string, required): Singer UUID
- `songId` (string, required): Song UUID
- `trackingId` (string, optional): Optional tracking identifier

**Response**: `200 OK`

**Response Body**: Empty

**Example**:
```bash
curl -X POST http://localhost:3000/singers \
  -H "Content-Type: application/json" \
  -d '{
    "singerId": "uuid-string",
    "songId": "uuid-string"
  }'
```

**Errors**:
- `404 Not Found`: Singer or song not found

---

## Data Models

### Singer

```typescript
{
  id: string;                    // UUID
  fullName: string;             // Singer's full name
  picture: string;               // Picture URL or path
  registerDate: Date;           // Registration date
  isSubscribed: boolean;        // Subscription status
  subscribedDate?: Date;        // Subscription date (if subscribed)
  status: string;               // 'registered' | 'subscribed' | 'deleted'
  songs: Song[];                // Array of songs
  audit: Audit;                 // Audit information
}
```

### Song

```typescript
{
  id: string;                   // UUID
  name: string;                 // Song name
  singerId: string;              // Parent singer ID
  status: string;                // 'active' | 'publishing' | 'published' | 'inactive'
  registerDate: Date;           // Registration date
  audit: Audit;                 // Audit information
}
```

### Audit

```typescript
{
  createdBy: string;            // Creator identifier
  createdAt: Date;             // Creation timestamp
  updatedBy?: string;           // Last updater identifier
  updatedAt?: Date;             // Last update timestamp
  timestamp?: number;           // Unix timestamp
}
```

### Paginated Response

```typescript
{
  data: T[];                    // Array of items
  page: number;                 // Current page number
  pageSize: number;              // Items per page
  total: number;                // Total number of items
}
```

## Examples

### Complete Workflow

#### 1. Create a Singer

```bash
curl -X POST http://localhost:3000/singers \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "picture": "https://example.com/picture.jpg"
  }'
```

#### 2. Get the Created Singer

```bash
# Use the ID from the response (or check database)
curl http://localhost:3000/singers/{singerId}
```

#### 3. Add Songs

```bash
curl -X POST http://localhost:3000/singers/addsong/{singerId} \
  -H "Content-Type: application/json" \
  -d '{
    "songName": "Song 1"
  }'

curl -X POST http://localhost:3000/singers/addsong/{singerId} \
  -H "Content-Type: application/json" \
  -d '{
    "songName": "Song 2"
  }'
```

#### 4. Subscribe the Singer

```bash
curl -X PUT http://localhost:3000/singers \
  -H "Content-Type: application/json" \
  -d '{
    "singerId": "{singerId}"
  }'
```

#### 5. Update Singer Information

```bash
curl -X PUT http://localhost:3000/singers/changename/{singerId} \
  -H "Content-Type: application/json" \
  -d '{
    "newFullName": "Jane Doe"
  }'
```

#### 6. Get All Singers

```bash
curl "http://localhost:3000/singers?page=1&pageSize=10"
```

## Swagger Documentation

For interactive API documentation, visit:

**URL**: `http://localhost:3000/api`

The Swagger UI provides:
- Complete API documentation
- Try-it-out functionality
- Request/response schemas
- Authentication configuration (if applicable)

## GraphQL (Optional)

If GraphQL is configured, you can access the GraphQL Playground at:

**URL**: `http://localhost:3000/graphql`

## Rate Limiting

Currently, the API does not implement rate limiting. In production, consider implementing rate limiting to prevent abuse.

## CORS

CORS is configured to allow requests from any origin in development. In production, configure CORS to allow only trusted origins.

## Related Documentation

- [Getting Started](getting-started.md) - Setup and installation
- [Architecture Overview](architecture.md) - Application architecture
- [Application Layer](application-layer.md) - Command and query handlers
