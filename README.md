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

🔐 **User Authentication**
- Secure registration with email validation
- Login with JWT token generation
- Protected routes requiring authentication
- Password hashing with bcrypt

📝 **Task Management**
- Create, read, update, and delete tasks
- Task isolation (users can only access their own tasks)
- Pagination and filtering support
- Status tracking (pending/completed)

🛡️ **Security & Validation**
- Input validation using Joi
- JWT-based authentication
- Environment variable protection
- CORS support

⚡ **Developer Experience**
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


