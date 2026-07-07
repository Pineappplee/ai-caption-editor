# REST API Reference

All requests must use the `/api/v1/` prefix. Protected endpoints require a `Bearer <JWT_TOKEN>` in the `Authorization` header.

## Response Schemas

All endpoints return a consistent JSON schema:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": {
    "code": "ERROR_CODE",
    "timestamp": "2026-07-06T11:00:00Z",
    "details": [
      {
        "field": "fieldName",
        "rejectedValue": "value",
        "message": "Validation rule failure message"
      }
    ]
  }
}
```

---

## Authentication Endpoints

### Register User
* **Method & Path:** `POST /api/v1/auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
* **Success Response:** Returns tokens and user details.

### Login
* **Method & Path:** `POST /api/v1/auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
* **Success Response:** Returns access token, refresh token, and user details.

### Token Refresh
* **Method & Path:** `POST /api/v1/auth/refresh`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "refreshToken": "uuid-token-string"
  }
  ```

### Logout
* **Method & Path:** `POST /api/v1/auth/logout`
* **Access:** Public (requires token verification for deletion)
* **Request Body:**
  ```json
  {
    "refreshToken": "uuid-token-string"
  }
  ```

---

## Users Endpoints

### Get Profile
* **Method & Path:** `GET /api/v1/users/me`
* **Access:** Authenticated

### Update Profile
* **Method & Path:** `PATCH /api/v1/users/me`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "name": "John Updated",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
  ```

### Delete Account
* **Method & Path:** `DELETE /api/v1/users/me`
* **Access:** Authenticated

---

## Projects Endpoints

### Create Project
* **Method & Path:** `POST /api/v1/projects`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "title": "My New Video",
    "description": "Short description",
    "language": "en"
  }
  ```

### List Projects
* **Method & Path:** `GET /api/v1/projects`
* **Access:** Authenticated
* **Query Parameters:** `page` (default 0), `size` (default 10), `sortBy` (default `createdAt`), `direction` (default `desc`)

### Get Project
* **Method & Path:** `GET /api/v1/projects/{id}`
* **Access:** Authenticated (Owner Only)

### Update Project
* **Method & Path:** `PATCH /api/v1/projects/{id}`
* **Access:** Authenticated (Owner Only)

### Delete Project
* **Method & Path:** `DELETE /api/v1/projects/{id}`
* **Access:** Authenticated (Owner Only)

---

## Subtitles & Transcripts Endpoints

### Create Transcript
* **Method & Path:** `POST /api/v1/projects/{projectId}/transcript`
* **Access:** Authenticated (Owner Only)
* **Request Body:**
  ```json
  {
    "language": "en",
    "segments": [
      {
        "startTime": 0.0,
        "endTime": 3.5,
        "text": "First subtitle line"
      }
    ]
  }
  ```

### Fetch Transcript
* **Method & Path:** `GET /api/v1/projects/{projectId}/transcript`
* **Access:** Authenticated (Owner Only)

### Bulk Update Segments
* **Method & Path:** `PUT /api/v1/projects/{projectId}/transcript`
* **Access:** Authenticated (Owner Only)

### Update Single Segment
* **Method & Path:** `PATCH /api/v1/projects/{projectId}/transcript/segments/{segmentId}`
* **Access:** Authenticated (Owner Only)

### Delete Single Segment
* **Method & Path:** `DELETE /api/v1/projects/{projectId}/transcript/segments/{segmentId}`
* **Access:** Authenticated (Owner Only)

---

## Autosave & Versions Endpoints

### Autosave State
* **Method & Path:** `POST /api/v1/projects/{projectId}/autosave`
* **Access:** Authenticated (Owner Only)

### List Versions
* **Method & Path:** `GET /api/v1/projects/{projectId}/versions`
* **Access:** Authenticated (Owner Only)

### Get Version Details
* **Method & Path:** `GET /api/v1/projects/{projectId}/versions/{versionId}`
* **Access:** Authenticated (Owner Only)

### Restore Version
* **Method & Path:** `POST /api/v1/projects/{projectId}/restore/{versionId}`
* **Access:** Authenticated (Owner Only)

---

## Media Endpoints

### Upload Media
* **Method & Path:** `POST /api/v1/media/upload`
* **Access:** Authenticated
* **Content-Type:** `multipart/form-data`
* **Form Fields:**
  - `file`: Media File (max 100MB)
  - `projectId`: Target Project UUID

### List Media Assets
* **Method & Path:** `GET /api/v1/media/project/{projectId}`
* **Access:** Authenticated (Owner Only)

### Delete Media
* **Method & Path:** `DELETE /api/v1/media/{id}`
* **Access:** Authenticated (Owner Only)

---

## Export Endpoints

### Start Export
* **Method & Path:** `POST /api/v1/projects/{projectId}/export`
* **Access:** Authenticated (Owner Only)
* **Request Body:**
  ```json
  {
    "format": "mp4" // options: mp4, srt, vtt, mp3, txt
  }
  ```
* **Success Response:** Returns the UUID job ID with status `QUEUED`.

### Get Job Status
* **Method & Path:** `GET /api/v1/export/{jobId}`
* **Access:** Authenticated (Owner Only)

### Download Exported File
* **Method & Path:** `GET /api/v1/export/{jobId}/download`
* **Access:** Authenticated (Owner Only)

### Delete Job Data
* **Method & Path:** `DELETE /api/v1/export/{jobId}`
* **Access:** Authenticated (Owner Only)

---

## AI Operations Endpoints

### Transcribe Media
* **Method & Path:** `POST /api/v1/ai/transcribe`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "mediaAssetId": "uuid-media-asset-id"
  }
  ```

### Rewrite Subtitle
* **Method & Path:** `POST /api/v1/ai/rewrite`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "text": "Original text line",
    "tone": "formal" // options: formal, casual, concise, academic
  }
  ```

### Translate
* **Method & Path:** `POST /api/v1/ai/translate`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "text": "Hello world",
    "targetLanguage": "es"
  }
  ```

### Summarize
* **Method & Path:** `POST /api/v1/ai/summarize`
* **Access:** Authenticated

### Auto Generate Captions
* **Method & Path:** `POST /api/v1/ai/captions`
* **Access:** Authenticated
* **Request Body:**
  ```json
  {
    "projectId": "uuid-project-id"
  }
  ```

---

## Health Endpoint

### Get System Health
* **Method & Path:** `GET /api/v1/health`
* **Access:** Public
* **Success Response:**
  ```json
  {
    "status": "UP",
    "database": "UP"
  }
  ```
