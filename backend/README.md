<<<<<<< HEAD
# TaskFlow Backend

TaskFlow is a REST API for user-authenticated task management. It provides registration and login, private task CRUD, filtering and pagination, and per-user dashboard statistics.

## Features

- JWT Bearer-token authentication and bcrypt password hashing.
- Private task CRUD; task owners cannot be changed by API input.
- Search across titles and descriptions, status/priority filters, sorting, and MongoDB-backed pagination.
- Aggregated dashboard statistics, including overdue tasks.
- Request validation, centralized error responses, Helmet security headers, configurable CORS, and HTTP request logging.
- MongoDB is connected before the server accepts requests.

## Technology stack

Node.js, Express, MongoDB, Mongoose, JWT (`jsonwebtoken`), bcryptjs, dotenv, cors, express-validator, Helmet, Morgan, and nodemon for development.

## Project structure

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── notFoundMiddleware.js
├── models/
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── utils/
│   └── asyncHandler.js
├── validators/
│   ├── authValidator.js
│   ├── taskValidator.js
│   └── validateRequest.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Prerequisites

- Node.js 18 or newer and npm.
- MongoDB 6 or newer, either running locally or hosted by MongoDB Atlas.

## Install and configure

Run these commands from the `backend` directory:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and set values appropriate to your machine:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=use-a-long-unique-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Never commit `.env`. For MongoDB Atlas, use the connection URI provided by Atlas as `MONGODB_URI`, and make sure the deployment's network access rules permit your server.

## MongoDB setup

For a local MongoDB installation, start the MongoDB service and use the local URI above. MongoDB creates the `taskflow` database and collections when the first records are written. For Atlas, create a cluster, create a database user, allow the server's IP address, and copy the application connection URI into `.env`; keep credentials out of source control.

## Start the backend

Development with automatic restart:

```powershell
npm run dev
```

Production-style start:

```powershell
npm start
```

The API listens on `http://localhost:5000` by default. `GET /api/health` reports API and database readiness. The process does not begin listening if the initial MongoDB connection fails.

## API

All responses are JSON. Success responses have `success: true`, a human-readable `message`, and a `data` property. Validation errors include an `errors` array. Authentication uses:

```http
Authorization: Bearer <token>
```

### Health

`GET /api/health` — no authentication.

Example response:

```json
{
  "success": true,
  "message": "TaskFlow API is healthy.",
  "data": { "database": "connected" }
}
```

### Register

`POST /api/auth/register` — no authentication.

Request:

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "secure-password"
}
```

Example response (`201`):

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "_id": "665000000000000000000001",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-01T12:00:00.000Z"
    },
    "token": "<jwt>"
  }
}
```

Email addresses are normalized to lowercase. Passwords must be 8–128 characters and no more than 72 UTF-8 bytes (the bcrypt input limit). Duplicate registrations return `409`.

### Login

`POST /api/auth/login` — no authentication.

Request:

```json
{
  "email": "alex@example.com",
  "password": "secure-password"
}
```

Successful response (`200`) returns `data.user` and `data.token`. Invalid credentials return `401` with a generic message.

### Current user

`GET /api/auth/me` — authentication required. Returns the authenticated user's profile without the password hash.

### Create task

`POST /api/tasks` — authentication required.

Request fields: `title` (required, 1–160 characters), `description` (optional, up to 5000 characters), `status` (`pending`, `in-progress`, or `completed`), `priority` (`low`, `medium`, or `high`), and `dueDate` (optional ISO 8601 date). Status defaults to `pending`, priority to `medium`. Any `user` value in the request is ignored.

```json
{
  "title": "Prepare assessment demo",
  "description": "Review task flows",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-12-01T09:00:00.000Z"
}
```

### List, search, filter, sort, and paginate tasks

`GET /api/tasks` — authentication required.

Query parameters:

| Parameter | Description |
|---|---|
| `search` | Case-insensitive literal match in title and description (max 200 characters). |
| `status` | `pending`, `in-progress`, or `completed`. |
| `priority` | `low`, `medium`, or `high`. |
| `sortBy` | `createdAt` (default), `dueDate`, `title`, or `priority`. |
| `order` | `asc` or `desc` (default). |
| `page` | Positive page number (default `1`). |
| `limit` | Results per page, 1–100 (default `10`). |

Filters are scoped to the authenticated user and applied in MongoDB before pagination.

Example: `GET /api/tasks?search=demo&status=pending&sortBy=dueDate&order=asc&page=1&limit=10`

Example response:

```json
{
  "success": true,
  "message": "Tasks retrieved successfully.",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### Read one task

`GET /api/tasks/:id` — authentication required. A task not owned by the caller is indistinguishable from a missing task and returns `404`.

### Update a task

`PUT /api/tasks/:id` — authentication required. Send one or more editable fields from the create-task field list. Fields not supplied are preserved. Owner changes and unknown fields are ignored. Invalid IDs or field values return `400`; missing or other-user tasks return `404`.

### Update task status

`PATCH /api/tasks/:id/status` — authentication required.

```json
{ "status": "completed" }
```

### Delete a task

`DELETE /api/tasks/:id` — authentication required. Returns the deleted task in `data.task`. Missing or other-user tasks return `404`.

### Dashboard statistics

`GET /api/tasks/stats` — authentication required. Statistics are calculated only for the signed-in user. A task is overdue when its due date is earlier than the current time and its status is not `completed`.

Example response:

```json
{
  "success": true,
  "message": "Task statistics retrieved successfully.",
  "data": {
    "totalTasks": 12,
    "pendingTasks": 5,
    "inProgressTasks": 2,
    "completedTasks": 5,
    "overdueTasks": 1,
    "completionPercentage": 41.67
  }
}
```

## Test with Postman

1. Start MongoDB and the backend, then send `GET http://localhost:5000/api/health`.
2. Register via `POST http://localhost:5000/api/auth/register` or log in via `POST http://localhost:5000/api/auth/login`.
3. Copy the returned token. For protected requests, set **Authorization → Bearer Token** in Postman (or add the `Authorization: Bearer <token>` header).
4. Create tasks, list/filter them, retrieve and update a task, test statistics, and delete tasks using the endpoints above.
5. Repeat with a second account to verify cross-user isolation.

## Verification checklist

- [ ] Register with valid data and verify response excludes password.
- [ ] Login successfully; incorrect email/password returns `401`.
- [ ] Duplicate email registration returns `409`.
- [ ] `/api/auth/me` and task endpoints reject missing, malformed, invalid, and expired JWTs with `401`.
- [ ] Create a task and retrieve it in the task list.
- [ ] Update task fields and separately update its status.
- [ ] Delete a task; subsequent retrieval returns `404`.
- [ ] Search matches title and description; status and priority filters narrow results.
- [ ] Sorting supports all allowed fields and both orders.
- [ ] Pagination returns correct `page`, `limit`, `total`, and `totalPages`; limits above 100 are rejected.
- [ ] Dashboard statistics match the signed-in user's tasks; completed overdue tasks are not counted as overdue.
- [ ] A second user cannot retrieve, update, or delete another user's task.
- [ ] Malformed MongoDB ObjectIds return `400`.
- [ ] Stop MongoDB before startup and verify the process reports connection failure and exits without accepting requests.
- [ ] Send malformed JSON and verify a safe `400` response.

## Errors and security

Errors follow `{ "success": false, "message": "..." }`; validation errors also include field-level details. Invalid input returns `400`, unauthenticated requests `401`, inaccessible/missing resources `404`, duplicate email `409`, and unexpected errors `500`. Production responses do not include stack traces. Helmet supplies security headers, CORS is restricted to `CLIENT_URL`, and passwords are stored only as bcrypt hashes. Do not log or share `.env` values or JWTs.

## Connecting the React frontend

Set `CLIENT_URL` to the frontend's exact origin (for example `http://localhost:5173` for Vite) and restart the backend. From React, call the API using `fetch` or Axios with the `Content-Type: application/json` header. Store the token according to the frontend's security requirements and include it as `Authorization: Bearer <token>` on protected calls. Do not put the MongoDB URI or JWT signing secret in frontend environment variables.

## AI Development Experience

_Fill in this section in your own words after using Kiro or Code0. Describe what you asked the tool to help with, what you reviewed or changed yourself, and one thing you learned. Keep the account accurate to your experience._
=======
# Taskflow-Mern-Task-Management
>>>>>>> 00fa1d5d442aed796e2c7c14e7c7370b179c9b36
