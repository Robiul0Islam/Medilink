# Medilink Backend

Spring Boot backend for the Medilink medical application with MySQL database integration.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Database Setup

1. Make sure MySQL is running on your system
2. The application will automatically create the `medilink_db` database on first run
3. Database credentials are configured in `src/main/resources/application.properties`

## Running the Application

### Using Maven

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080/api`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (requires authentication)

### Patient (`/api/patient`)
- `GET /api/patient/{id}` - Get patient profile
- `PUT /api/patient/{id}` - Update patient profile
- `PUT /api/patient/{id}/vitals` - Update patient vitals

### Doctor (`/api/doctor`)
- `GET /api/doctor/all` - Get all approved doctors
- `GET /api/doctor/{id}` - Get doctor by ID
- `PUT /api/doctor/{id}` - Update doctor profile

### Admin (`/api/admin`)
- `GET /api/admin/doctors/pending` - Get pending doctor approvals
- `PUT /api/admin/doctors/{id}/approve` - Approve doctor
- `PUT /api/admin/doctors/{id}/reject` - Reject doctor
- `GET /api/admin/posts/pending` - Get pending posts
- `PUT /api/admin/posts/{id}/approve` - Approve post
- `PUT /api/admin/posts/{id}/reject` - Reject post
- `GET /api/admin/stats` - Get dashboard statistics

### Appointments (`/api/appointments`)
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/patient/{patientId}` - Get patient appointments
- `GET /api/appointments/doctor/{doctorId}` - Get doctor appointments
- `GET /api/appointments/{id}` - Get appointment by ID
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

### Reports (`/api/reports`)
- `POST /api/reports` - Create report
- `GET /api/reports/patient/{patientId}` - Get patient reports
- `GET /api/reports/doctor/{doctorId}` - Get doctor reports
- `GET /api/reports/{id}` - Get report by ID
- `DELETE /api/reports/{id}` - Delete report

### Posts (`/api/posts`)
- `POST /api/posts` - Create post (doctor only)
- `GET /api/posts` - Get approved posts
- `GET /api/posts/doctor/{doctorId}` - Get doctor posts
- `GET /api/posts/{id}` - Get post by ID
- `DELETE /api/posts/{id}` - Delete post

### Chat (`/api/chat`)
- `POST /api/chat/messages` - Send message
- `GET /api/chat/messages/{userId1}/{userId2}` - Get conversation
- `GET /api/chat/conversations/{userId}` - Get all conversations
- `PUT /api/chat/messages/{messageId}/read` - Mark message as read

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require JWT authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

The application uses JPA with Hibernate to automatically create the following tables:
- `users` - Base user table
- `patients` - Patient-specific data (extends users)
- `doctors` - Doctor-specific data (extends users)
- `admins` - Admin-specific data (extends users)
- `appointments` - Appointment bookings
- `reports` - Medical reports
- `posts` - Awareness posts
- `messages` - Chat messages

## Default Admin Account

For testing purposes, you can create an admin account using the registration endpoint with role "ADMIN".

## Technologies Used

- Spring Boot 3.2.1
- Spring Security with JWT
- Spring Data JPA
- MySQL 8.0
- Lombok
- Maven
