# Task Management API

A full-featured RESTful API for managing tasks and users, built with Node.js and Express. This project demonstrates a clean architecture with dual database integration: PostgreSQL for user management and MongoDB for task storage.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Security](#security)

## Features

**User Authentication**
- Secure registration with email validation
- Login with JWT token generation
- Protected routes requiring authentication
- Password hashing with bcrypt

**Task Management**
- Create, read, update, and delete tasks
- Task isolation (users can only access their own tasks)
- Pagination and filtering support
- Status tracking (pending/completed)

**Security & Validation**
- Input validation using Joi
- JWT-based authentication
- Environment variable protection
- CORS support

**Developer Experience**
- Clean, modular code structure
- Comprehensive error handling
- RESTful API design
- Easy local setup

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Databases**: 
  - PostgreSQL (User data)
  - MongoDB (Task data)
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Joi
- **Password Hashing**: bcryptjs
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
   ```

4. **Set up databases** (see [Database Setup](#database-setup) section below)

5. **Start the server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000` (or your configured PORT)

6. **Verify the server is running**
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

3. **The users table will be created automatically** when you start the server for the first time. The schema is:
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

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

3. **The database and collection will be created automatically** when you create your first task. MongoDB creates databases and collections on-the-fly.

### Verify Database Connections

When you start the server, you should see these messages:
```
PostgreSQL tables initialized
MongoDB connected successfully
Server running on port 3000
Environment: development
```

If you see any errors, double-check your `.env` file configuration and ensure both database services are running.

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

### 1. User Registration

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "xyz@example.com",
  "password": "securePassword123"
}
```

**Validation Rules**:
- Email must be valid format
- Password must be at least 6 characters
- Email must be unique

**Success Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "xyz@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "User with this email already exists"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "xyz@example.com",
    "password": "securePassword123"
  }'
```

---

### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Description**: Login with existing credentials

**Request Body**:
```json
{
  "email": "xyz@example.com",
  "password": "securePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "xyz@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "xyz@example.com",
    "password": "securePassword123"
  }'
```

---

### 3. Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Description**: Get the authenticated user's profile

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "email": "xyz@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Access denied. No token provided."
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Create Task

**Endpoint**: `POST /api/tasks`

**Description**: Create a new task for the authenticated user

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "status": "pending"
}
```

**Field Details**:
- `title` (required): String, max 200 characters
- `description` (optional): String, max 1000 characters
- `dueDate` (required): ISO 8601 date format
- `status` (optional): "pending" or "completed" (defaults to "pending")

**Success Response** (201 Created):
```json
{
  "message": "Task created successfully",
  "task": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "status": "pending",
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Validation Error",
  "details": [
    "Title is required",
    "Due date must be a valid ISO date"
  ]
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "status": "pending"
  }'
```

---

### 5. Get All Tasks

**Endpoint**: `GET /api/tasks`

**Description**: Get all tasks for the authenticated user with pagination and filtering

**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status ("pending" or "completed")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response** (200 OK):
```json
{
  "tasks": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Complete project documentation",
      "description": "Write comprehensive README and API docs",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "status": "pending",
      "userId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
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

**cURL Examples**:
```bash
# Get all tasks
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get pending tasks only
curl -X GET "http://localhost:3000/api/tasks?status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get page 2 with 20 items per page
curl -X GET "http://localhost:3000/api/tasks?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Get Single Task

**Endpoint**: `GET /api/tasks/:id`

**Description**: Get a specific task by ID (only if it belongs to the authenticated user)

**Authentication**: Required

**URL Parameters**:
- `id`: MongoDB ObjectId of the task

**Success Response** (200 OK):
```json
{
  "task": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "status": "pending",
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Task not found"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Update Task

**Endpoint**: `PUT /api/tasks/:id`

**Description**: Update a task (partial updates allowed, only if it belongs to the authenticated user)

**Authentication**: Required

**URL Parameters**:
- `id`: MongoDB ObjectId of the task

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "status": "completed"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Task updated successfully",
  "task": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Updated title",
    "description": "Updated description",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "status": "completed",
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:45:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Task not found"
}
```

**cURL Example**:
```bash
curl -X PUT http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

---

### 8. Delete Task

**Endpoint**: `DELETE /api/tasks/:id`

**Description**: Delete a task (only if it belongs to the authenticated user)

**Authentication**: Required

**URL Parameters**:
- `id`: MongoDB ObjectId of the task

**Success Response** (200 OK):
```json
{
  "message": "Task deleted successfully"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Task not found"
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:3000/api/tasks/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 9. Health Check

**Endpoint**: `GET /health`

**Description**: Check if the server is running

**Authentication**: Not required

**Success Response** (200 OK):
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/health
```

---

### Error Responses

The API uses standard HTTP status codes and returns consistent error responses:

**400 Bad Request** - Validation errors
```json
{
  "error": "Validation Error",
  "details": [
    "Email is required",
    "Password must be at least 6 characters long"
  ]
}
```

**401 Unauthorized** - Authentication required or invalid
```json
{
  "error": "Access denied. No token provided."
}
```
```json
{
  "error": "Invalid token."
}
```
```json
{
  "error": "Token expired."
}
```

**404 Not Found** - Resource not found
```json
{
  "error": "Task not found"
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Internal Server Error"
}
```

---

### Testing the API with Postman

1. **Import the collection**: You can create a Postman collection with the endpoints above
2. **Set up environment variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set after login)
3. **Test flow**:
   - Register a user → Save the token
   - Login → Update the token variable
   - Create tasks → Use the token
   - Get/Update/Delete tasks → Use the token

**Postman Collection Structure**:
```
Task Management API
├── Auth
│   ├── Register
│   ├── Login
│   └── Get Profile
├── Tasks
│   ├── Create Task
│   ├── Get All Tasks
│   ├── Get Single Task
│   ├── Update Task
│   └── Delete Task
└── Health Check
```

## Project Structure

```
task-management-api/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js    # User authentication logic
│   │   └── taskController.js    # Task CRUD operations
│   │
│   ├── services/             # Business logic layer
│   │   ├── authService.js       # Authentication business logic
│   │   ├── taskService.js       # Task business logic
│   │   └── userService.js       # User business logic
│   │
│   ├── models/               # Database models
│   │   ├── User.js              # PostgreSQL user model
│   │   └── Task.js              # MongoDB task schema
│   │
│   ├── routes/               # API route definitions
│   │   ├── auth.js              # Authentication routes
│   │   └── tasks.js             # Task routes
│   │
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validation.js        # Request validation middleware
│   │
│   ├── utils/                # Utility functions
│   │   ├── jwtUtils.js          # JWT token operations
│   │   ├── paginationUtils.js   # Pagination helpers
│   │   ├── responseUtils.js     # Response formatting
│   │   └── validationSchemas.js # Joi validation schemas
│   │
│   ├── config/               # Configuration files
│   │   └── database.js          # Database connections
│   │
│   └── app.js                # Express app setup
│
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
├── server.js                 # Application entry point
└── README.md                 # This file
```

### Folder Explanation

**controllers/**
- Handle HTTP requests and responses
- Thin layer that delegates to services
- Responsible for request/response formatting
- Example: `authController.js` handles registration, login, and profile endpoints

**services/**
- Contains business logic
- Reusable across different controllers
- Handles data validation and processing
- Example: `taskService.js` manages task CRUD operations with user isolation

**models/**
- Define database schemas and models
- PostgreSQL models use raw SQL queries with the `pg` library
- MongoDB models use Mongoose schemas
- Example: `User.js` handles password hashing and user queries

**routes/**
- Define API endpoints and HTTP methods
- Connect routes to controllers
- Apply middleware (authentication, validation)
- Example: `tasks.js` defines all task-related endpoints

**middleware/**
- Reusable functions that process requests
- `auth.js`: Verifies JWT tokens and attaches user to request
- `errorHandler.js`: Catches and formats all errors
- `validation.js`: Validates request bodies using Joi schemas

**utils/**
- Helper functions used across the application
- JWT operations, pagination logic, validation schemas
- Keeps code DRY (Don't Repeat Yourself)

**config/**
- Application configuration
- Database connection setup for both PostgreSQL and MongoDB
- Initializes database tables/collections on startup

## Design Decisions

### Why Two Databases?

**PostgreSQL for Users**
- Relational data with ACID compliance
- Strong consistency for authentication data
- Built-in unique constraints for emails
- Better for structured, relational data
- Excellent for user management and authentication

**MongoDB for Tasks**
- Flexible schema for task attributes
- Better performance for document-based queries
- Easy to add new fields without migrations
- Natural fit for task data with varying attributes
- Efficient for user-specific data isolation

### Architecture Pattern: MVC + Services

We use a layered architecture that separates concerns:

1. **Routes** → Define endpoints
2. **Middleware** → Validate and authenticate
3. **Controllers** → Handle HTTP layer
4. **Services** → Business logic
5. **Models** → Data access

**Benefits**:
- Easy to test each layer independently
- Business logic is reusable
- Controllers stay thin and focused
- Clear separation of concerns
- Easier to maintain and scale

### Authentication Strategy

**JWT (JSON Web Tokens)**
- Stateless authentication (no session storage needed)
- Tokens contain user information
- Can be easily scaled horizontally
- Configurable expiration time
- Industry standard for REST APIs

**Why not sessions?**
- Sessions require server-side storage
- Harder to scale across multiple servers
- JWT is more suitable for REST APIs

### Validation Approach

**Joi for Schema Validation**
- Declarative validation rules
- Reusable schemas
- Clear error messages
- Validates before hitting business logic
- Reduces code duplication

**Two-layer validation**:
1. Joi validates request format and types
2. Business logic validates business rules (e.g., unique email)

### Error Handling Philosophy

**Global Error Handler**
- Catches all errors in one place
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging
- Security: Doesn't expose sensitive information

**Error Types Handled**:
- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Database errors (400/500)
- JWT errors (401)
- Generic server errors (500)

### Security Measures

1. **Password Security**
   - Bcrypt hashing with 12 salt rounds
   - Passwords never stored in plain text
   - Passwords never returned in responses

2. **JWT Security**
   - Secret key stored in environment variables
   - Configurable expiration time
   - Token verification on protected routes

3. **Input Validation**
   - All inputs validated before processing
   - SQL injection prevention (parameterized queries)
   - NoSQL injection prevention (Mongoose sanitization)

4. **User Isolation**
   - Users can only access their own tasks
   - All task queries filter by userId
   - Authorization checks on every request

5. **Environment Variables**
   - All sensitive data in .env file
   - .env file in .gitignore
   - .env.example provided as template

6. **CORS**
   - Enabled for cross-origin requests
   - Can be configured for specific origins in production

### Code Organization Principles

1. **Single Responsibility**: Each file/function has one clear purpose
2. **DRY (Don't Repeat Yourself)**: Reusable utilities and services
3. **Separation of Concerns**: Clear boundaries between layers
4. **Modularity**: Easy to add/remove features
5. **Readability**: Clean code without unnecessary comments

### Why This Structure?

**Scalability**
- Easy to add new features
- Can split into microservices if needed
- Service layer can be reused in different contexts

**Maintainability**
- Clear file organization
- Easy to find and fix bugs
- New developers can understand quickly

**Testability**
- Each layer can be tested independently
- Services can be unit tested
- Controllers can be integration tested

**Best Practices**
- Follows industry standards
- RESTful API design
- Clean architecture principles
- SOLID principles applied

## Security

### Authentication Flow

1. User registers or logs in
2. Server generates JWT token with user ID
3. Client stores token (localStorage, sessionStorage, or memory)
4. Client includes token in Authorization header for protected routes
5. Server verifies token and extracts user information
6. Request proceeds if token is valid

### Password Handling

- Passwords are hashed using bcrypt with 12 salt rounds
- Original passwords are never stored
- Password comparison is done using bcrypt's secure compare function
- Passwords are never included in API responses

### Token Management

- Tokens expire after configured time (default: 7 days)
- Expired tokens are rejected with 401 status
- Invalid tokens are rejected with 401 status
- Token secret is stored securely in environment variables

### Data Protection

- User data is isolated (users can only access their own tasks)
- All database queries include user ID filtering
- SQL injection prevented by parameterized queries
- NoSQL injection prevented by Mongoose sanitization

### Environment Variables

Never commit sensitive data. Always use environment variables for:
- Database credentials
- JWT secret keys
- API keys
- Port numbers
- Environment-specific configurations

## Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Adding New Features

1. **Add a new route**: Create route file in `src/routes/`
2. **Add controller**: Create controller in `src/controllers/`
3. **Add service**: Create service in `src/services/`
4. **Add validation**: Add schema in `src/utils/validationSchemas.js`
5. **Register route**: Import and use in `src/app.js`

### Common Development Tasks

**Add a new endpoint**:
1. Define route in appropriate route file
2. Create controller function
3. Create service function (if needed)
4. Add validation schema (if needed)
5. Test the endpoint

**Add a new database model**:
1. Create model file in `src/models/`
2. Define schema/queries
3. Export model
4. Use in services

## Troubleshooting

### Server won't start

**Check database connections**:
```bash
# PostgreSQL
psql -U your_username -d taskmanagement

# MongoDB
mongosh
```

**Check environment variables**:
- Ensure .env file exists
- Verify all required variables are set
- Check for typos in variable names

### Authentication errors

**Token issues**:
- Check if token is being sent in Authorization header
- Verify token format: `Bearer <token>`
- Check if token has expired
- Verify JWT_SECRET matches between token generation and verification

### Database errors

**PostgreSQL**:
- Verify database exists
- Check user permissions
- Ensure PostgreSQL service is running

**MongoDB**:
- Verify MongoDB service is running
- Check connection string format
- Ensure network access is allowed

### Common Error Messages

**"Access denied. No token provided."**
- Include Authorization header with Bearer token

**"Invalid token."**
- Token is malformed or JWT_SECRET doesn't match

**"Token expired."**
- Generate a new token by logging in again

**"User with this email already exists"**
- Email is already registered, use a different email or login

**"Task not found"**
- Task doesn't exist or belongs to another user
- Verify task ID is correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---




