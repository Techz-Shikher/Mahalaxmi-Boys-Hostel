# API Documentation - Hostel Management System

## Base URL
```
https://api.hostelmanagement.com/v1
```

## Authentication
All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Table of Contents
1. [Student Management](#student-management)
2. [Complaint Management](#complaint-management)
3. [Meal Management](#meal-management)
4. [Transport Management](#transport-management)
5. [Community Hub](#community-hub)
6. [Announcement Management](#announcement-management)
7. [Error Handling](#error-handling)

---

## Student Management

### Get All Students
```
GET /students
```
**Query Parameters:**
- `hostelId` (optional): Filter by hostel
- `roomId` (optional): Filter by room
- `status` (optional): Filter by status (active/inactive)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "student_001",
      "rollNumber": "2024001",
      "name": "John Doe",
      "email": "john@email.com",
      "phoneNumber": "+91XXXXXXXXXX",
      "roomId": "room_101",
      "hostelId": "hostel_1",
      "dateOfBirth": "2005-06-15",
      "course": "B.Tech",
      "semester": 4,
      "status": "active",
      "balance": 5000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Get Student Details
```
GET /students/:studentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "student_001",
    "rollNumber": "2024001",
    "name": "John Doe",
    "email": "john@email.com",
    "phoneNumber": "+91XXXXXXXXXX",
    "parentPhone": "+91YYYYYYYYYY",
    "roomId": "room_101",
    "hostelId": "hostel_1",
    "dateOfBirth": "2005-06-15",
    "course": "B.Tech",
    "semester": 4,
    "status": "active",
    "balance": 5000,
    "complaints": 3,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Student
```
POST /students
```

**Request Body:**
```json
{
  "rollNumber": "2024001",
  "name": "John Doe",
  "email": "john@email.com",
  "phoneNumber": "+91XXXXXXXXXX",
  "parentPhone": "+91YYYYYYYYYY",
  "roomId": "room_101",
  "hostelId": "hostel_1",
  "dateOfBirth": "2005-06-15",
  "course": "B.Tech",
  "semester": 4
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "student_001",
    "message": "Student created successfully"
  }
}
```

### Update Student
```
PUT /students/:studentId
```

**Request Body:** (All fields optional)
```json
{
  "email": "newemail@email.com",
  "phoneNumber": "+91ZZZZZZZZZZ",
  "roomId": "room_102",
  "semester": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Student updated successfully"
  }
}
```

### Delete Student
```
DELETE /students/:studentId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Student deactivated successfully"
  }
}
```

---

## Complaint Management

### Get All Complaints
```
GET /complaints
```

**Query Parameters:**
- `studentId` (optional): Filter by student
- `category` (optional): maintenance/cleanliness/food/security/academic/other
- `status` (optional): filed/assigned/in_progress/resolved/closed
- `priority` (optional): low/medium/high
- `hostelId` (optional): Filter by hostel
- `sortBy` (optional): field to sort by (createdAt, updatedAt, priority)
- `order` (optional): asc/desc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "complaint_001",
      "studentId": "student_001",
      "studentName": "John Doe",
      "category": "maintenance",
      "title": "Broken water tap",
      "description": "Water tap in bathroom is leaking",
      "status": "in_progress",
      "priority": "high",
      "assignedTo": "staff_001",
      "staffName": "Rajesh Kumar",
      "images": ["url1", "url2"],
      "staffUpdates": [
        {
          "staffId": "staff_001",
          "update": "Maintenance team notified",
          "timestamp": "2024-01-15T10:30:00Z"
        }
      ],
      "filedAt": "2024-01-15T08:00:00Z",
      "resolvedAt": null
    }
  ]
}
```

### Get Complaint Details
```
GET /complaints/:complaintId
```

### File Complaint
```
POST /complaints
```

**Request Body:**
```json
{
  "studentId": "student_001",
  "category": "maintenance",
  "title": "Broken water tap",
  "description": "Water tap in bathroom is leaking",
  "priority": "high",
  "images": ["base64_image_1", "base64_image_2"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "complaintId": "complaint_001",
    "status": "filed",
    "estimatedResolution": "2024-01-17T00:00:00Z"
  }
}
```

### Assign Complaint
```
PUT /complaints/:complaintId/assign
```

**Request Body:**
```json
{
  "staffId": "staff_001",
  "assignmentNote": "Urgent - kitchen can't operate without this tap"
}
```

### Update Complaint Status
```
PUT /complaints/:complaintId/status
```

**Request Body:**
```json
{
  "status": "in_progress",
  "staffId": "staff_001",
  "update": "Maintenance team is investigating the issue"
}
```

### Resolve Complaint
```
PUT /complaints/:complaintId/resolve
```

**Request Body:**
```json
{
  "staffId": "staff_001",
  "resolutionNotes": "Water tap replaced successfully",
  "images": ["before_image_url", "after_image_url"]
}
```

### Get Complaint History
```
GET /complaints/:complaintId/history
```

---

## Meal Management

### Get Weekly Menu
```
GET /meals/week
```

**Query Parameters:**
- `hostelId` (required): Hostel ID
- `week` (optional): Week in YYYY-MM-DD format (default: current week)

**Response:**
```json
{
  "success": true,
  "data": {
    "week": "2024-01-22",
    "hostelId": "hostel_1",
    "menus": [
      {
        "day": "Monday",
        "breakfast": {
          "items": ["Idli", "Sambar", "Chutney"],
          "calories": 450
        },
        "lunch": {
          "items": ["Rice", "Dal", "Vegetable Curry"],
          "calories": 650
        },
        "dinner": {
          "items": ["Roti", "Mix Vegetable", "Pickle"],
          "calories": 550
        }
      }
    ],
    "publishedBy": "staff_001",
    "publishedAt": "2024-01-20T00:00:00Z"
  }
}
```

### Create Weekly Menu
```
POST /meals/week
```

**Request Body:**
```json
{
  "hostelId": "hostel_1",
  "week": "2024-01-22",
  "menus": [
    {
      "day": "Monday",
      "breakfast": {
        "items": ["Idli", "Sambar", "Chutney"],
        "calories": 450,
        "notes": "Contains groundnut"
      },
      "lunch": {
        "items": ["Rice", "Dal", "Vegetable Curry"],
        "calories": 650
      },
      "dinner": {
        "items": ["Roti", "Mix Vegetable", "Pickle"],
        "calories": 550
      }
    }
  ]
}
```

### Update Menu
```
PUT /meals/:mealId
```

**Request Body:**
```json
{
  "menus": [
    {
      "day": "Tuesday",
      "breakfast": {
        "items": ["Dosa", "Sambar"],
        "calories": 500
      }
    }
  ]
}
```

### Get Meal Feedback
```
GET /meals/:mealId/feedback
```

**Query Parameters:**
- `date` (optional): Filter by date
- `rating` (optional): Filter by rating (1-5)

**Response:**
```json
{
  "success": true,
  "data": {
    "mealId": "meal_001",
    "averageRating": 4.2,
    "totalFeedback": 45,
    "ratings": {
      "5": 20,
      "4": 15,
      "3": 7,
      "2": 2,
      "1": 1
    },
    "comments": [
      {
        "studentId": "student_001",
        "rating": 5,
        "comment": "Great taste!",
        "timestamp": "2024-01-15T13:00:00Z"
      }
    ]
  }
}
```

### Submit Meal Feedback
```
POST /meals/:mealId/feedback
```

**Request Body:**
```json
{
  "studentId": "student_001",
  "rating": 4,
  "comment": "Good variety, would like more vegetables",
  "date": "2024-01-15"
}
```

---

## Transport Management

### Get Available Transport
```
GET /transport/available
```

**Query Parameters:**
- `hostelId` (required): Hostel ID
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `destination` (optional): Filter by destination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "transport_001",
      "hostelId": "hostel_1",
      "destination": "Railway Station",
      "departureTime": "2024-01-25T06:00:00Z",
      "returnTime": "2024-01-25T18:00:00Z",
      "capacity": 50,
      "currentBookings": 35,
      "availableSeats": 15,
      "vehicle": "AC Bus",
      "cost": 200,
      "createdBy": "staff_001",
      "createdAt": "2024-01-20T00:00:00Z"
    }
  ]
}
```

### Get Transport Details
```
GET /transport/:transportId
```

### Create Transport Option
```
POST /transport
```

**Request Body:**
```json
{
  "hostelId": "hostel_1",
  "destination": "Railway Station",
  "departureTime": "2024-01-25T06:00:00Z",
  "returnTime": "2024-01-25T18:00:00Z",
  "capacity": 50,
  "vehicle": "AC Bus",
  "cost": 200,
  "staffId": "staff_001",
  "notes": "Direct route, no stops"
}
```

### Book Transport
```
POST /transport/:transportId/book
```

**Request Body:**
```json
{
  "studentId": "student_001",
  "seats": 1,
  "notes": "Returning on same day"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_001",
    "status": "confirmed",
    "bookingDate": "2024-01-20T10:30:00Z",
    "confirmationEmail": "sent"
  }
}
```

### Get Student Bookings
```
GET /transport/bookings/:studentId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookingId": "booking_001",
      "transportId": "transport_001",
      "destination": "Railway Station",
      "departureTime": "2024-01-25T06:00:00Z",
      "returnTime": "2024-01-25T18:00:00Z",
      "status": "confirmed",
      "seats": 1,
      "cost": 200,
      "bookingDate": "2024-01-20T10:30:00Z"
    }
  ]
}
```

### Cancel Booking
```
DELETE /transport/bookings/:bookingId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Booking cancelled successfully",
    "refundStatus": "processed"
  }
}
```

---

## Community Hub

### Get Posts
```
GET /community/posts
```

**Query Parameters:**
- `category` (optional): tips/help/discussion/event
- `tags` (optional): comma-separated tags
- `studentId` (optional): Filter by author
- `sortBy` (optional): createdAt, likes, comments
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "post_001",
      "studentId": "student_001",
      "studentName": "John Doe",
      "title": "Best study spots in hostel",
      "content": "Here are great places to study...",
      "category": "tips",
      "tags": ["study", "tips"],
      "likes": 42,
      "comments": 5,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Get Post Details
```
GET /community/posts/:postId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "post_001",
    "studentId": "student_001",
    "studentName": "John Doe",
    "title": "Best study spots in hostel",
    "content": "Here are great places to study...",
    "category": "tips",
    "tags": ["study", "tips"],
    "likes": 42,
    "comments": [
      {
        "id": "comment_001",
        "studentId": "student_002",
        "studentName": "Jane Smith",
        "content": "Great suggestion!",
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### Create Post
```
POST /community/posts
```

**Request Body:**
```json
{
  "studentId": "student_001",
  "title": "Best study spots in hostel",
  "content": "Here are great places to study...",
  "category": "tips",
  "tags": ["study", "tips"]
}
```

### Like Post
```
POST /community/posts/:postId/like
```

**Request Body:**
```json
{
  "studentId": "student_001"
}
```

### Add Comment
```
POST /community/posts/:postId/comment
```

**Request Body:**
```json
{
  "studentId": "student_001",
  "content": "Great suggestion!"
}
```

### Get Groups
```
GET /community/groups
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "group_001",
      "name": "Sports Enthusiasts",
      "description": "For all sports lovers",
      "members": 45,
      "moderator": "staff_001",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Join Group
```
POST /community/groups/:groupId/join
```

**Request Body:**
```json
{
  "studentId": "student_001"
}
```

---

## Announcement Management

### Get Announcements
```
GET /announcements
```

**Query Parameters:**
- `hostelId` (optional): Filter by hostel
- `category` (optional): Filter by category
- `status` (optional): active/expired
- `sortBy` (optional): createdAt, expiryDate

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "announcement_001",
      "title": "Hostel Maintenance",
      "content": "Water will be cut off on Sunday...",
      "category": "maintenance",
      "hostelId": "hostel_1",
      "createdBy": "staff_001",
      "createdAt": "2024-01-15T00:00:00Z",
      "expiryDate": "2024-01-25T00:00:00Z",
      "status": "active"
    }
  ]
}
```

### Get Announcement Details
```
GET /announcements/:announcementId
```

### Create Announcement
```
POST /announcements
```

**Request Body:**
```json
{
  "title": "Hostel Maintenance",
  "content": "Water will be cut off on Sunday...",
  "category": "maintenance",
  "hostelId": "hostel_1",
  "staffId": "staff_001",
  "expiryDate": "2024-01-25T00:00:00Z"
}
```

### Update Announcement
```
PUT /announcements/:announcementId
```

**Request Body:**
```json
{
  "content": "Updated maintenance schedule...",
  "expiryDate": "2024-01-26T00:00:00Z"
}
```

### Delete Announcement
```
DELETE /announcements/:announcementId
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email is required",
    "details": {
      "field": "email",
      "reason": "Empty value not allowed"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for the action |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_INPUT` | 400 | Invalid request parameters |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server-side error |

---

## Rate Limiting

- **Requests per minute**: 60
- **Requests per hour**: 1000
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

**Version**: 1.0
**Last Updated**: January 2024
