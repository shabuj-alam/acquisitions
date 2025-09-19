# User CRUD API Testing Guide

This document provides examples for testing the newly implemented User CRUD operations.

## Prerequisites

1. Start the development environment:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

2. Create a user account and get authentication token:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

3. Sign in to get authentication cookie:

```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

## API Endpoints Testing

### 1. Get All Users

```bash
curl -X GET http://localhost:3000/api/users \
  -b cookies.txt
```

### 2. Get User by ID

```bash
curl -X GET http://localhost:3000/api/users/1 \
  -b cookies.txt
```

### 3. Update User (Self)

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### 4. Update User Role (Admin only)

First create an admin user, then:

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{
    "role": "admin"
  }'
```

### 5. Delete User (Self or Admin)

```bash
curl -X DELETE http://localhost:3000/api/users/1 \
  -b cookies.txt
```

## Response Examples

### Success Response (Get User):

```json
{
  "message": "User fetched successfully",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "created_at": "2025-09-18T20:54:36.000Z",
    "updated_at": "2025-09-18T20:54:36.000Z"
  }
}
```

### Error Response (Unauthorized):

```json
{
  "error": "Access denied",
  "message": "No token provided"
}
```

### Error Response (Forbidden):

```json
{
  "error": "Forbidden",
  "message": "You can only update your own information"
}
```

## Authorization Rules

1. **GET /api/users**: Requires authentication
2. **GET /api/users/:id**: Requires authentication
3. **PUT /api/users/:id**:
   - Users can only update their own information
   - Only admins can change user roles
   - Only admins can update any user's information
4. **DELETE /api/users/:id**:
   - Users can only delete their own account
   - Admins can delete any user (except themselves)

## Validation Rules

### User ID Parameter:

- Must be a valid number

### Update User Body:

- `name`: Optional, 2-255 characters, trimmed
- `email`: Optional, valid email format, max 255 characters, lowercase, trimmed
- `role`: Optional, either 'user' or 'admin'
- At least one field must be provided for update

## Testing Scenarios

### Valid Scenarios:

1. User updates their own name/email
2. Admin updates any user's information
3. Admin changes user roles
4. User deletes their own account
5. Admin deletes other users

### Invalid Scenarios (should return errors):

1. Non-admin user trying to update another user
2. Non-admin user trying to change roles
3. User trying to delete another user's account
4. Admin trying to delete their own account
5. Invalid user ID format
6. Empty update request body
7. Invalid email format
8. Name too short/long

## Database Schema

The users table contains:

- `id`: Serial primary key
- `name`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `password`: VARCHAR(255) NOT NULL (hashed with bcrypt)
- `role`: VARCHAR(50) NOT NULL DEFAULT 'user'
- `created_at`: TIMESTAMP DEFAULT NOW()
- `updated_at`: TIMESTAMP DEFAULT NOW()
