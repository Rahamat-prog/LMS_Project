# LMS Project
A comprehensive Learning Management System backend built with Node.js, Express.js, and MongoDB. This system provides APIs for user management, course management, payment processing, and more.


# 🚀 Tech Stack
Runtime: Node.js
Framework: Express.js
Database: MongoDB with Mongoose ODM
Authentication: JSON Web Tokens (JWT)
File Storage: Cloudinary
Payment Gateway: Razorpay
Email Service: Nodemailer
Password Hashing: bcryptjs
Development: Nodemon for auto-restart


# ✨ Features

## Completed Features

- Express server setup
- MongoDB connection
-feat(auth): implement user authentication and profile management
- Added registration, login, logout, and getUserProfile controllers
- Implemented JWT authentication with cookie storage
- Created custom methods for password hashing and token generation
- Added auth middleware for protected routes
- Added centralized error handling middleware and custom error utility
- Defined user schema and mode
- feat(auth): implement avatar(image) upload during user registration
- Added multer middleware for file handling
- Integrated Cloudinary for avatar upload
- Stored avatar public_id and secure_url in database
- Added local file cleanup after successful upload

## Upcoming Features

- [ ] User Authentication
- [ ] Role-based Authorization
- [ ] Course Management
- [ ] Video Upload
- [ ] Payment Gateway
- [ ] Admin Dashboard

---

# 📁 Folder Structure

```bash
project/
│
├── client/
├── server/
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <your-repo-url>
```

Install dependencies:

```bash
npm install
express
cookie-parser
bcrypt
mongoose
jsonwebtoken
cors
email-validator
dotenv
cloudinary
multer
fs
nodemailer
```

---

# ▶️ Run Project

Frontend:

```bash
npm start
```

Backend:

```bash
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside server folder.

```env
PORT=
MONGODB_URL=
JWT_SECRET=
```

---

# 📌 API Routes

| Method | Route   | Description |
| ------ | ------- | ----------- |
| GET    | /api/v1 | Test Route  |

(Add more later)

---

# 📸 Screenshots

(Add screenshots later)

---

# 🌍 Live Demo

(Add deployment link later)

---

# 👨‍💻 Author

Your Name

GitHub:
https://github.com/your-github

LinkedIn:
(Add later)
