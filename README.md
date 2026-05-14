# 📚 LMS (Learning Management System)

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A robust and scalable Learning Management System (LMS) backend API built with Node.js and Express.js. This project provides comprehensive user authentication, profile management, and lays the foundation for course management, payment processing, and administrative features.

## 🌟 Key Highlights

- **Secure Authentication**: JWT-based authentication with cookie storage
- **User Management**: Complete user lifecycle from registration to profile updates
- **File Upload**: Cloudinary integration for avatar management
- **Email Services**: Password reset functionality via email
- **Scalable Architecture**: Modular design with MVC pattern
- **Error Handling**: Centralized error management with custom utilities
- **Ongoing Development**: Actively building towards full LMS functionality

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **File Handling**: Multer
- **Development**: Nodemon for auto-restart

### DevOps & Tools
- **Process Management**: PM2 (planned)
- **Testing**: Jest/Mocha (planned)
- **Documentation**: Swagger/OpenAPI (planned)

## ✨ Features

### ✅ Completed Features

#### 🔐 User Authentication & Authorization
- **User Registration**: Secure signup with optional avatar upload
- **User Login**: Email/password authentication with JWT tokens
- **User Logout**: Secure token invalidation
- **Password Management**:
  - Change password (authenticated users)
  - Forgot password with email reset links
  - Secure password reset functionality
- **Profile Management**:
  - Get user profile
  - Update user information (name, avatar)
- **Role-based Access**: USER and ADMIN roles (foundation laid)

#### 📁 File Management
- **Avatar Upload**: Multer middleware for file handling
- **Cloud Storage**: Cloudinary integration for secure image storage
- **File Cleanup**: Automatic local file removal after upload

#### 🛡️ Security & Middleware
- **JWT Authentication**: Secure token-based auth with cookie storage
- **Password Security**: bcrypt hashing with salt rounds
- **CORS Configuration**: Cross-origin resource sharing setup
- **Error Handling**: Centralized error middleware with custom error classes
- **Input Validation**: Comprehensive validation for all endpoints

#### 📧 Communication
- **Email Service**: Nodemailer integration for password reset emails
- **Template Support**: HTML email templates for better UX

### 🚧 Upcoming Features
- [ ] **Course Management**: Create, update, delete courses
- [ ] **Video Upload & Streaming**: Cloudinary video integration
- [ ] **Payment Gateway**: Razorpay integration for course purchases
- [ ] **Admin Dashboard**: Administrative controls and analytics
- [ ] **Enrollment System**: Course enrollment and progress tracking
- [ ] **Discussion Forums**: User interaction features
- [ ] **Certificate Generation**: Course completion certificates
- [ ] **Analytics & Reporting**: User and course statistics

## 📁 Project Structure

```
LMS_Project/
│
├── client/                          # Frontend application (planned)
│
├── server/                          # Backend application
│   ├── config/
│   │   ├── cloudinary.js           # Cloudinary configuration
│   │   └── dbConnection.js         # MongoDB connection setup
│   │
│   ├── controllers/
│   │   └── controllers.js          # User authentication controllers
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js       # JWT authentication middleware
│   │   ├── errorMiddleware.js      # Centralized error handling
│   │   └── multerMiddleware.js     # File upload middleware
│   │
│   ├── models/
│   │   └── userModel.js            # User schema and model
│   │
│   ├── routes/
│   │   └── userRoutes.js           # User-related API routes
│   │
│   ├── utils/
│   │   ├── cloudinary.js           # Cloudinary upload utility
│   │   ├── errorUtils.js           # Custom error class
│   │   └── sentEmail.js            # Email sending utility
│   │
│   ├── uploads/                    # Temporary file storage
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # Server entry point
│   ├── package.json                # Dependencies and scripts
│   └── jsconfig.json               # JavaScript configuration
│
├── README.md                       # Project documentation
└── .gitignore                      # Git ignore rules
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for file storage
- Email service for SMTP (Gmail, SendGrid, etc.)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd LMS_Project
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `server/` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/lms_db

   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRY=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Service
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Server
   PORT=5000
   ```

4. **Start MongoDB**
   Ensure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📡 API Endpoints

### Authentication Routes
All user-related endpoints are prefixed with `/api/v1/user`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration with optional avatar | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | No |
| POST | `/getProfile` | Get user profile | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password/:resetToken` | Reset password with token | No |
| POST | `/change-password` | Change password | Yes |
| PUT | `/update-user` | Update user profile | Yes |

### Request/Response Examples

#### User Registration
```bash
POST /api/v1/user/register
Content-Type: multipart/form-data

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
  // avatar: file (optional)
}
```

#### User Login
```bash
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow MVC architecture
- Write clean, documented code
- Add tests for new features
- Update documentation as needed
- Use meaningful commit messages

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Developer**: [Your Name]
- **Email**: your.email@example.com
- **LinkedIn**: [Your LinkedIn Profile]
- **GitHub**: [Your GitHub Profile]

---

*This is an ongoing project. Stay tuned for more features and improvements!*

---

*This is an ongoing project. Stay tuned for more features and improvements!*