# Task Management API

A full-featured RESTful API for managing tasks and users with real-time notifications, built with Node.js and Express. This project demonstrates a clean architecture with dual database integration: PostgreSQL for user management and MongoDB for task storage.

-**Real-time Task Reminders** - Automatic notifications 1 hour before due date
-**Task Categorization** - Organize tasks with pre-defined categories
-**Task Tags** - Add multiple custom tags to tasks
-**Webhook Integration** - External notifications on task completion
-**Retry Logic** - Exponential backoff for webhook delivery
-**Enhanced Filtering** - Filter by category, tags, and status

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [New Features](#new-features)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Security](#security)

## Features

### User Authentication
- Secure registration with email validation
- Login with JWT token generation
- Protected routes requiring authentication
- Password hashing with bcrypt (12 salt rounds)

### Task Management
- Create, read, update, and delete tasks
- Task isolation (users can only access their own tasks)
- Pagination and filtering support
- Status tracking (pending/completed)
- **NEW:** Task categorization (6 pre-defined categories)
- **NEW:** Multiple tags per task
- **NEW:** Filter by category and tags

### Real-time Notifications
- **NEW:** Automatic reminders 1 hour before task due date
- **NEW:** Webhook notifications on task completion
- **NEW:** Console logging for all notifications
- **NEW:** Retry logic with exponential backoff

### Security & Validation
- Input validation using Joi
- JWT-based authentication
- Environment variable protection
- CORS support
- User data isolation

### Developer Experience
- Clean, modular code structure
- Comprehensive error handling
- RESTful API design
- Easy local setup
- Extensive documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Databases**: 
  - PostgreSQL (User data)
  - MongoDB (Task data)
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Joi
- **Password Hashing**: bcryptjs
- **HTTP Client**: axios (for webhooks)
- **Scheduling**: node-cron
- **Environment Management**: dotenv

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Open the `.env` file and configure your settings:
   ```env
   PORT=3000
   NODE_ENV=development
   
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=taskmanagement
   PG_USER=your_postgres_username
   PG_PASSWORD=your_postgres_password
   
   MONGODB_URI=mongodb://localhost:27017/taskmanagement
   
   # NEW: Webhook Configuration
   WEBHOOK_URL=https://webhook.site/your-unique-url
   WEBHOOK_RETRY_ATTEMPTS=3
   WEBHOOK_RETRY_DELAY=1000
   
   # NEW: Reminder Configuration
   REMINDER_CHECK_INTERVAL=60000
   REMINDER_ADVANCE_TIME=3600000
   ```

4. **Get a Webhook URL** (Optional but recommended)
   - Visit [webhook.site](https://webhook.site)
   - Copy your unique URL
   - Paste it in `.env` as `WEBHOOK_URL`

5. **Set up databases** (see [Database Setup](#database-setup) section below)

6. **Start the server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000` (or your configured PORT)

7. **Verify the server is running**
   ```bash
   curl http://localhost:3000/health
   ```
   
   You should see:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 1.234
   }
   ```

## Database Setup

### PostgreSQL Setup

1. **Start PostgreSQL service**
   ```bash
   # On macOS (using Homebrew)
   brew services start postgresql
   
   # On Ubuntu/Debian
   sudo service postgresql start
   
   # On Windows
   # Start from Services or pgAdmin
   ```

2. **Create the database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE taskmanagement;
   
   # Create user (optional, if not using default)
   CREATE USER your_username WITH PASSWORD 'your_password';
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE taskmanagement TO your_username;
   
   # Exit
   \q
   ```

3. **The users table will be created automatically** when you start the server for the first time.

### MongoDB Setup

1. **Start MongoDB service**
   ```bash
   # On macOS (using Homebrew)
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   # Start from Services or MongoDB Compass
   ```

2. **Verify MongoDB is running**
   ```bash
   mongosh
   # or
   mongo
   ```

3. **The database and collection will be created automatically** when you create your first task.

### Verify Database Connections

When you start the server, you should see these messages:
```
PostgreSQL tables initialized
MongoDB connected successfully
Reminder service started
Server running on port 3000
Environment: development
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Most endpoints require a JWT token. Include it in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Authentication Endpoints

#### 1. User Registration
**POST** `/api/auth/register`

Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. User Login
**POST** `/api/auth/login`

Login with existing credentials.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get User Profile
**GET** `/api/auth/profile`

Get the authenticated user's profile. Requires authentication.

**Success Response** (200):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Task Endpoints

#### 4. Create Task (Enhanced)
**POST** `/api/tasks`

Create a new task. Requires authentication.

**Request Body**:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "status": "pending",
  "category": "Work",
  "tags": ["High Priority", "Documentation"]
}
```

**New Fields**:
- `category` (optional): One of: Work, Personal, Urgent, Shopping, Health, Other
- `tags` (optional): Array of strings, max 50 characters each

**Success Response** (201):
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "status": "pending",
    "category": "Work",
    "tags": ["High Priority", "Documentation"],
    "userId": 1,
    "reminderSent": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Note**: A reminder will be automatically scheduled for 1 hour before the due date.

#### 5. Get All Tasks (Enhanced)
**GET** `/api/tasks`

Get all tasks for the authenticated user. Requires authentication.

**Query Parameters**:
- `status` (optional): Filter by status ("pending" or "completed")
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (comma-separated)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Examples**:
```bash
# Get all tasks
GET /api/tasks

# Filter by category
GET /api/tasks?category=Work

# Filter by tags
GET /api/tasks?tags=High Priority,Documentation

# Combined filters
GET /api/tasks?category=Work&status=pending&page=1
```

**Success Response** (200):
```json
{
  "tasks": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 6. Get Single Task
**GET** `/api/tasks/:id`

Get a specific task by ID. Requires authentication.

#### 7. Update Task (Enhanced)
**PUT** `/api/tasks/:id`

Update a task. Requires authentication. All fields are optional.

**Request Body**:
```json
{
  "title": "Updated title",
  "status": "completed",
  "category": "Personal",
  "tags": ["Updated", "New Tag"]
}
```

**Behavior**:
- If `status` changes to "completed": Sends webhook notification
- If `dueDate` is updated: Reschedules reminder

#### 8. Delete Task
**DELETE** `/api/tasks/:id`

Delete a task. Requires authentication. Cancels any scheduled reminders.

---

### New Endpoints

#### 9. Get Categories
**GET** `/api/tasks/categories`

Get all available task categories. Requires authentication.

**Success Response** (200):
```json
{
  "categories": [
    "Work",
    "Personal",
    "Urgent",
    "Shopping",
    "Health",
    "Other"
  ]
}
```

#### 10. Get User Tags
**GET** `/api/tasks/tags`

Get all unique tags used by the authenticated user. Requires authentication.

**Success Response** (200):
```json
{
  "tags": [
    "Bug Fix",
    "Documentation",
    "High Priority",
    "Meeting"
  ]
}
```

---

### Health Check

#### 11. Health Check
**GET** `/health`

Check if the server is running. No authentication required.

**Success Response** (200):
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

---

## New Features

### 1. Real-time Task Reminders

**How it works**:
- When you create a task, a reminder is automatically scheduled
- The system checks every minute for tasks due within the next hour
- When a task's due date is approaching (1 hour before), a reminder is triggered
- Reminders are logged to console and sent to the configured webhook URL

**Console Output Example**:
```
=== TASK REMINDER ===
Task ID: 65a1b2c3d4e5f6g7h8i9j0k1
Title: Complete project documentation
Due Date: 2024-01-15T15:30:00.000Z
User ID: 1
Category: Work
Tags: High Priority, Documentation
====================
Reminder sent for task: 65a1b2c3d4e5f6g7h8i9j0k1
```

**Configuration**:
```env
REMINDER_CHECK_INTERVAL=60000      # Check every 60 seconds
REMINDER_ADVANCE_TIME=3600000      # Remind 1 hour before (in milliseconds)
```

### 2. Task Categorization

**Pre-defined Categories**:
- Work
- Personal
- Urgent
- Shopping
- Health
- Other (default)

**Benefits**:
- Consistent categorization across users
- Easy filtering and organization
- Better for analytics and reporting

**Usage**:
```bash
# Create task with category
POST /api/tasks
{
  "title": "Buy groceries",
  "category": "Shopping",
  ...
}

# Filter by category
GET /api/tasks?category=Work
```

### 3. Task Tags

**Features**:
- Add multiple tags to each task
- Free-form text (max 50 characters per tag)
- Filter by single or multiple tags
- Get all your tags for autocomplete

**Usage**:
```bash
# Create task with tags
POST /api/tasks
{
  "title": "Fix bug",
  "tags": ["High Priority", "Bug Fix", "Client A"],
  ...
}

# Filter by tags
GET /api/tasks?tags=High Priority,Bug Fix

# Get all your tags
GET /api/tasks/tags
```

### 4. Webhook Integration

**Triggers**:
- Task completion
- Task reminders

**Features**:
- Configurable webhook URL
- Retry logic with exponential backoff
- 3 retry attempts (delays: 1s, 2s, 4s)
- Detailed logging

**Webhook Payload Example**:
```json
{
  "type": "task_completed",
  "timestamp": "2024-01-15T14:45:00.000Z",
  "data": {
    "taskId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Complete project documentation",
    "completionDate": "2024-01-15T14:45:00.000Z",
    "userId": 1,
    "category": "Work",
    "tags": ["High Priority", "Documentation"]
  }
}
```

**Console Output**:
```
=== TASK COMPLETED WEBHOOK ===
Task ID: 65a1b2c3d4e5f6g7h8i9j0k1
Title: Complete project documentation
User ID: 1
Completed At: 2024-01-15T14:45:00.000Z
==============================
Sending webhook (attempt 1/3)...
Webhook sent successfully: 200
```

**Configuration**:
```env
WEBHOOK_URL=https://webhook.site/your-unique-url
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=1000
```

### 5. Enhanced Filtering

**Filter by multiple criteria**:
```bash
# By category
GET /api/tasks?category=Work

# By status
GET /api/tasks?status=pending

# By tags (single)
GET /api/tasks?tags=High Priority

# By tags (multiple)
GET /api/tasks?tags=High Priority,Documentation

# Combined
GET /api/tasks?category=Work&status=pending&tags=High Priority
```

---

## Project Structure

```
task-management-api/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   └── taskController.js (enhanced)
│   │
│   ├── services/             # Business logic
│   │   ├── authService.js
│   │   ├── taskService.js (enhanced)
│   │   ├── userService.js
│   │   ├── reminderService.js    # NEW
│   │   └── webhookService.js     # NEW
│   │
│   ├── models/               # Database models
│   │   ├── User.js
│   │   └── Task.js (enhanced)
│   │
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   └── tasks.js (enhanced)
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   │
│   ├── utils/                # Utility functions
│   │   ├── jwtUtils.js
│   │   ├── paginationUtils.js
│   │   ├── responseUtils.js
│   │   └── validationSchemas.js (enhanced)
│   │
│   ├── config/               # Configuration
│   │   └── database.js
│   │
│   └── app.js                # Express app setup
│
├── .env.example              # Environment template (enhanced)
├── .gitignore
├── package.json              # Dependencies (enhanced)
├── server.js                 # Entry point (enhanced)
├── README.md                 # This file
│
├── API_DOCUMENTATION_EXTENDED.md    # Detailed API docs
├── DESIGN_DECISIONS.md              # Architecture docs
├── SECURITY_AUDIT.md                # Security analysis
├── SETUP_GUIDE.md                   # Setup instructions
├── PROJECT_SUMMARY.md               # Project overview
└── FINAL_CHECKLIST.md               # Implementation checklist
```

### New Components

**reminderService.js**
- In-memory queue for scheduled reminders
- Periodic check for upcoming tasks
- Handles reminder scheduling and cancellation
- Sends console logs and webhook notifications

**webhookService.js**
- HTTP client for webhook delivery
- Retry logic with exponential backoff
- Handles both reminder and completion notifications
- Graceful error handling

---

## Design Decisions

### Real-time Reminder System

**Hybrid Approach**: We use both in-memory scheduling and periodic database checks.

**In-Memory Queue**:
- Instant scheduling when task is created
- Low latency
- Simple implementation

**Periodic Database Check**:
- Survives server restarts
- Catches missed reminders
- Database is source of truth

**Why Hybrid?**
- Fast, immediate reminders for new tasks
- Reliability and fault tolerance
- Graceful degradation if in-memory queue fails

### Webhook Integration

**Exponential Backoff**: Retry schedule is 1s, 2s, 4s.

**Why?**
- Network failures are often temporary
- Gives external service time to recover
- Industry standard pattern

**Security**:
- HTTPS only
- 5-second timeout
- No sensitive data in payload

### Task Categorization vs Tags

**Categories** (Structured):
- Pre-defined list
- Consistent across users
- Better for analytics
- One per task

**Tags** (Flexible):
- Free-form text
- User-specific
- Multiple per task
- Better for custom workflows

**Why Both?**
- Categories for broad organization
- Tags for specific details
- Best of both worlds

---

## Security

### Authentication Flow
1. User registers or logs in
2. Server generates JWT token with user ID
3. Client stores token
4. Client includes token in Authorization header
5. Server verifies token and extracts user information
6. Request proceeds if token is valid

### Password Handling
- Passwords hashed using bcrypt with 12 salt rounds
- Original passwords never stored
- Passwords never returned in API responses

### Token Management
- Tokens expire after configured time (default: 7 days)
- Expired/invalid tokens rejected with 401 status
- Token secret stored securely in environment variables

### Data Protection
- User data isolated (users can only access their own tasks)
- All database queries include user ID filtering
- SQL injection prevented by parameterized queries
- NoSQL injection prevented by Mongoose sanitization

### Webhook Security
- HTTPS enforced
- 5-second timeout prevents hanging
- No sensitive data in payload (no passwords, tokens, emails)
- Configurable webhook URL

### Environment Variables
Never commit sensitive data. Always use environment variables for:
- Database credentials
- JWT secret keys
- Webhook URLs
- API keys
- Configuration values

---

## Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Testing the New Features

1. **Test Task Creation with Categories and Tags**:
   ```bash
   curl -X POST http://localhost:3000/api/tasks \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Team meeting",
       "description": "Quarterly review",
       "dueDate": "2024-12-31T10:00:00.000Z",
       "category": "Work",
       "tags": ["Meeting", "High Priority"]
     }'
   ```

2. **Test Filtering by Category**:
   ```bash
   curl -X GET "http://localhost:3000/api/tasks?category=Work" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Test Filtering by Tags**:
   ```bash
   curl -X GET "http://localhost:3000/api/tasks?tags=High Priority" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Test Task Completion (triggers webhook)**:
   ```bash
   curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "completed"}'
   ```
   
   Check your webhook.site URL to see the notification!

5. **Test Reminder System**:
   Create a task with due date 1 hour from now and watch the console for reminder output.

---

## Troubleshooting

### Webhook not working
- Verify `WEBHOOK_URL` in `.env`
- Check if webhook.site URL is valid
- Look for webhook logs in console

### Reminder not triggering
- Task due date must be more than current time
- Task status must be "pending"
- Check `REMINDER_ADVANCE_TIME` configuration
- Look for reminder logs in console

### Database connection errors
- Ensure PostgreSQL is running: `pg_isready`
- Ensure MongoDB is running: `mongosh`
- Verify credentials in `.env`

---

## Additional Documentation

For more detailed information, see:
- **API_DOCUMENTATION_EXTENDED.md** - Complete API reference with all endpoints
- **DESIGN_DECISIONS.md** - Architecture and design rationale
- **SECURITY_AUDIT.md** - Security analysis and best practices
- **SETUP_GUIDE.md** - Detailed setup and deployment guide
- **PROJECT_SUMMARY.md** - Project overview and metrics

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

This project is open source and available under the MIT License.

---

## Support

For issues, questions, or contributions, please open an issue on the repository.

---





