# Uni Assistant Admin Login Testing Guide

Use this guide to test admin login quickly using seeded credentials.

## Seeded Admin Credentials

- Username: Admin
- Password: Admin123

## 1) Test Admin Login with Postman

### Request

- Method: POST
- URL: http://localhost:5000/api/auth/login
- Headers:
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "identifier": "Admin",
  "password": "Admin123"
}
```

### Expected Success

- Status: 200 OK
- Response should include:
  - `success: true`
  - JWT token in `data.token`
  - logged-in user role in `data.user.role`

Sample success response shape:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "<user_id>",
      "name": "Admin",
      "username": "admin",
      "email": "admin@uniassistant.com",
      "role": "admin",
      "department": null,
      "semester": null
    }
  }
}
```

### Common Failure Cases

- Wrong password or username:
  - Status: 401
  - Message: `Invalid admin username or password`
- Missing fields:
  - Status: 400
  - Message: `Login identifier and password are required`

## 2) Test Admin Login from Frontend Form

### URL

- Open: http://127.0.0.1:5173/admin/login

### Steps

1. Enter Username: `Admin`
2. Enter Password: `Admin123`
3. Click `Login as Admin`

### Expected Behavior

- Login succeeds and user is redirected to:
  - `/admin/dashboard`
- Auth token is stored in localStorage key:
  - `uni_assistant_token`
- Role is stored in localStorage key:
  - `uni_assistant_role` (value should be `admin`)

## Quick Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Seeded admin exists in database
- [ ] POST `/api/auth/login` with admin credentials returns 200
- [ ] Response contains `data.token`
- [ ] Response contains `data.user.role` = `admin`
- [ ] Frontend admin form redirects to `/admin/dashboard`
