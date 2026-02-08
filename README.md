# PixelForge Nexus 🚀

PixelForge Nexus is a robust project management system built with the MERN stack (MongoDB, Express, React, Node.js) and Vite. It features a secure, role-based access control (RBAC) system with multi-factor authentication (MFA) to manage projects, teams, and documents efficiently.

## 🌟 Key Features

- **Separate Admin & User Portals**: Dedicated collections in MongoDB for administrators and team members for enhanced security and data separation.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full control over projects, users, and system settings.
  - **Project Lead**: Manage assigned projects, assign developers, and upload documents.
  - **Developer**: View assigned projects and access project-related documents.
- **Security & MFA**: 
  - Secure login with bcrypt password hashing.
  - Optional Multi-Factor Authentication (MFA) using TOTP (Time-based One-Time Password) with QR code integration.
  - Protected API routes and JWT-based authentication.
- **Project Management**: Create, update, and track projects with encrypted descriptions.
- **Document Management**: Secure file uploads and document sharing within project teams.
- **Audit Logging**: Comprehensive activity tracking for all major system actions.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT.
- **Security**: Helmet, Express Rate Limit, bcryptjs, Speakeasy (MFA).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "PixelForge Nexus"
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Seed Admin Account**:
   In the `backend` directory, run the seed script to create the initial admin user:
   ```bash
   npm run seed
   ```

### Running the Application

- **Start Backend**: 
  ```bash
  cd backend
  npm run dev
  ```
- **Start Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```

## 🔐 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@pixelforge.com` | `AdminPassword123!` |

## 📁 Project Structure

```text
PixelForge Nexus/
├── backend/            # Express server, MongoDB models, & API routes
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas (Admin, User, Project, etc.)
│   ├── routes/         # API endpoints
│   └── middleware/     # Auth & error handling
├── frontend/           # Vite React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth state management
│   │   ├── pages/      # View components
│   │   └── utils/      # API configurations
└── credentials.txt     # Quick access to setup info
```

---
Built with ❤️ for secure and efficient project collaboration.
