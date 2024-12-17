# PBL6
# User Service - Job Search System

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Setup and Installation](#setup-and-installation)
6. [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Data Models](#data-models)
9. [Running the Service](#running-the-service)
10. [Testing](#testing)
11. [Contributing](#contributing)
12. [License](#license)

---

## Overview

### About Job search system
The Job Search System is a microservices-based platform that connects job seekers and employers. It enables users to search for jobs, post job listings, manage applications, and receive notifications. The system comprises multiple services, including User Service, Job Service, and Notification Service, which communicate through RESTful APIs and message brokers like RabbitMQ.

### About User Service

The **User Service** is a microservice in the Job Search System responsible for managing user-related operations such as registration, authentication, and profile management. It supports both job seekers and employers.

This service runs independently and communicates with other microservices like Job Service and Notification Service using **RESTful APIs** and **RabbitMQ** for messaging.

---

## Features
- User registration and authentication
- User profile management
- Role-based access control (Job Seeker, Employer, Admin)
- Secure password management with encryption
- Token-based authentication using JWT
- Integration with RabbitMQ for event-driven communication

---

## Architecture
The **User Service** is part of a microservices architecture with the following layers:
- **Controller Layer**: Handles API requests and responses
- **Service Layer**: Contains business logic
- **Data Access Layer**: Interacts with MongoDB for data persistence

Key components:
1. **Node.js** with Express.js for building RESTful APIs
2. **MongoDB** for storing user data
3. **RabbitMQ** for message-driven communication
4. **JWT** for secure authentication

---

## Technology Stack
- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose ODM)
- **RabbitMQ** (for messaging)
- **JWT** (JSON Web Token)
- **Docker** (for containerization)
- **GitHub Actions** (CI/CD pipeline)

---

## Setup and Installation

### Prerequisites
Ensure you have the following installed:
- Node.js (v14+)
- MongoDB
- RabbitMQ
- Docker (optional for containerization)

### Steps to Set Up
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository-url.git
   cd user-service
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see [Environment Variables](#environment-variables)).
4. Start MongoDB and RabbitMQ services.
5. Run the service:
   ```bash
   npm start
   ```

---

## Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/user-service
JWT_SECRET=your_jwt_secret
RABBITMQ_URL=amqp://localhost
```

---

## API Endpoints

### 1. User Registration
- **Method**: `POST`
- **Endpoint**: `/api/users/register`
- **Description**: Registers a new user.
- **Request Body**:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "role": "job_seeker"
   }
   ```
- **Response**:
   ```json
   {
     "message": "User registered successfully",
     "userId": "12345"
   }
   ```

### 2. User Login
- **Method**: `POST`
- **Endpoint**: `/api/users/login`
- **Description**: Authenticates a user and returns a JWT token.

### 3. Get User Profile
- **Method**: `GET`
- **Endpoint**: `/api/users/:id`
- **Description**: Fetches user profile details.

### 4. Update User Profile
- **Method**: `PUT`
- **Endpoint**: `/api/users/:id`
- **Description**: Updates user profile information.

---

## Data Models

### User Schema
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['job_seeker', 'employer', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now }
});
```

---

## Running the Service
To run the User Service in development mode:
```bash
npm run dev
```
To build and run with Docker:
```bash
docker build -t user-service .
docker run -p 5000:5000 user-service
```

---

## Testing
Run unit tests using Jest:
```bash
npm test
```

---

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature.
3. Submit a pull request with a clear description of your changes.

---

## License
This project is licensed under the MIT License.

---

## Contact
For questions or support, contact:
- **Name**: [Your Name]
- **Email**: your.email@example.com
- **Repository**: [GitHub Repository URL]

