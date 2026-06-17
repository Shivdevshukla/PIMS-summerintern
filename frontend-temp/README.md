# Production Incentive Management System (PIMS)

## Overview

The Production Incentive Management System (PIMS) is a web-based application designed to automate and manage production incentive calculations, approval workflows, worker records, and reporting processes within an organization.

The system provides role-based access control, production entry tracking, incentive calculation, dashboard analytics, approval management, audit logging, worker self-service access, and report generation.

---

## Live Deployment

### Frontend (Vercel)

**Live URL:** https://pims-summerintern.vercel.app/

### Backend (Render)

**API URL:** https://pims-summerintern.onrender.com

### Database (Aiven Cloud MySQL)

**Host:** mysql-2d450b71-shivdevshukla89-5643.e.aivencloud.com

**Database Provider:** Aiven.io Cloud MySQL

---

## Features

### Authentication & Authorization

* Secure JWT-based authentication
* Role-based access control
* Protected API routes

### Production Entry Management

* Create and manage production entries
* Track incentive amounts
* Store production-related records
* Entry status tracking

### Multi-Level Approval Workflow

* Shift Incharge Approval
* HOD Approval
* Superintendent Approval
* HR Approval
* Final Approval Process

### Dashboard & Analytics

* Total production entries
* Pending approvals
* Approved entries
* Incentive summaries
* Recent activity tracking

### Worker Management

* Worker profile management
* Worker portal access
* Production history
* Incentive details

### User Management

* Create users
* Update user information
* Assign roles
* Manage permissions

### Reports & Exports

* Excel export support
* PDF report generation
* Payslip generation
* Downloadable records

### Audit & Notifications

* Activity logging
* Audit trail tracking
* System notifications

---

## Technology Stack

### Frontend

* React.js
* Vite
* Redux Toolkit
* React Router
* Tailwind CSS
* Axios
* Chart.js
* React Toastify

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer
* Nodemailer

### Database

* MySQL (Aiven Cloud)

### Reporting

* ExcelJS
* XLSX
* PDFKit

---

## Project Structure

```text
PIMS/
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── db.js
│
├── frontend-temp/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

---

## Deployment Architecture

```text
┌─────────────────────┐
│  React + Vite App   │
│      (Vercel)       │
└──────────┬──────────┘
           │ API Calls
           ▼
┌─────────────────────┐
│ Node.js + Express   │
│      (Render)       │
└──────────┬──────────┘
           │ SQL Queries
           ▼
┌─────────────────────┐
│  Aiven Cloud MySQL  │
│     Database        │
└─────────────────────┘
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd PIMS
```

---

## Backend Setup

Navigate to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
PORT=5000

DB_HOST=mysql-2d450b71-shivdevshukla89-5643.e.aivencloud.com
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=pims

JWT_SECRET=your_secret_key

FRONTEND_URL=https://pims-summerintern.vercel.app
```

Start backend server:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

Navigate to frontend folder:

```bash
cd frontend-temp
```

Install dependencies:

```bash
npm install
```

Create environment file:

```env
VITE_API_URL=https://pims-summerintern.onrender.com
```

Start development server:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Modules

### Authentication

* Login
* User verification
* JWT token generation

### Production Entries

* Add entry
* Update entry
* View entries
* Approval status

### Dashboard

* Statistics
* Recent entries
* Incentive summaries

### Workers

* Worker records
* Worker portal

### Users

* User management
* Role management

### Audit

* Activity logs
* System tracking

### Payslips

* Generate payslips
* Download reports

### Export

* Excel exports
* PDF exports

---

## User Roles

### Admin

* Full system access

### Shift Incharge

* Manage production entries
* View assigned records

### HOD

* Review and approve entries

### Superintendent

* Approve departmental records

### HR

* Final approval and verification

### Worker

* View personal records
* Access payslips and incentive information

---

## Security Features

* JWT Authentication
* Password Hashing
* Role-Based Access Control (RBAC)
* Protected Routes
* Secure API Communication
* Audit Logging for User Activities

---

## Future Enhancements

* Email notifications
* Advanced analytics dashboard
* Mobile responsive enhancements
* Real-time approval tracking
* Attendance integration
* Payroll system integration
* SMS notifications
* AI-based production insights


---

## Author

**Shivdev Shukla**

Summer Internship Project

Production Incentive Management System (PIMS)

Built using React, Node.js, Express.js, MySQL, Vercel, Render, and Aiven Cloud Database.

---

## Project Links

**Frontend:** https://pims-summerintern.vercel.app/

**Backend API:** https://pims-summerintern.onrender.com

**Database:** Aiven Cloud MySQL

**GitHub Repository:** https://github.com/Shivdevshukla/PIMS-summerintern
