# Recruitment Management System

A full-stack Recruitment Management System built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## Features

- **Role-based Authentication**: Candidates, Recruiters, and Admins.
- **Job Management**: Create, edit, publish, and track job postings.
- **Application Tracking**: Submit applications with resume uploads, review status, and manage candidate workflows.
- **Interactive Dashboards**: Dashboards tailored for Candidates, Recruiters, and Admins with analytics and charts (Recharts).
- **Responsive UI**: Modern interface built with React, Vite, Tailwind CSS, and Lucide Icons.

## Project Structure

```text
├── client/              # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/         # Axios API client
│   │   ├── components/  # Role-specific and shared UI components
│   │   ├── context/     # Auth context & state management
│   │   ├── pages/       # Application views & routing
│   │   └── main.jsx
│   └── package.json
└── server/              # Express backend (Node.js + MongoDB)
    ├── controllers/     # Request handlers
    ├── middleware/      # Auth & file upload middleware
    ├── models/          # Mongoose schemas
    ├── routes/          # Express API routes
    ├── utils/           # Utility helpers
    ├── seed.js          # Database seeding script
    ├── server.js        # Server entry point
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)

### Setup Backend

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
4. (Optional) Seed the database:
   ```bash
   npm run seed # or: node seed.js
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```

### Setup Frontend

1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
<img width="1917" height="902" alt="image" src="https://github.com/user-attachments/assets/7cd06aa3-3343-4fc7-8826-46097b7778cd" />
<img width="1896" height="902" alt="image" src="https://github.com/user-attachments/assets/62184683-7b1e-41f0-9637-7e0122d92f7e" />
<img width="1901" height="902" alt="image" src="https://github.com/user-attachments/assets/fd9544ff-ac1f-4093-a72a-ddbe212102d2" />
