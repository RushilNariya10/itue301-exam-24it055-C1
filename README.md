# EventHub Ticket Booking System

ITUE301 · Open-Book Practical Examination · SET F  
Roll Number: 24IT055 | Batch: C1

---

## Project Overview

EventHub is a full-stack event ticketing platform built with:
- **Frontend**: React (Vite) + React Router + Context API
- **Backend**: Express.js + Node.js
- **Database**: MongoDB with Mongoose

---

## Folder Structure

```
itue301-exam-24it055-A/
├── frontend/          # React application
├── backend/           # Express.js API server
├── .env.example       # Environment variable template
└── README.md
```

---

## MongoDB Setup

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Copy your connection string
3. In `/backend`, copy `.env.example` to `.env` and paste your connection string as `MONGO_URI`

---

## Backend Setup & Run

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in your MONGO_URI and PORT
npm start
# or: node server.js
```

The backend starts on `http://localhost:5000` by default.

---

## Frontend Setup & Run

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` by default.

---

## REST API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/login` | Public | Authenticate attendee, issue token |
| GET | `/api/v1/events` | Public | Return all events |
| POST | `/api/v1/tickets` | Protected | Book tickets for an event |
| GET | `/api/v1/tickets/my` | Protected | Return attendee's own tickets |
| PATCH | `/api/v1/tickets/:id/status` | Protected | Update ticket status |

---

## Test Credentials

After seeding or manually inserting an attendee:
- **Email**: `admin@eventhub.com`
- **Password**: `password123`
- **Role**: `admin`

---

## Environment Variables

See `.env.example` for required variables.

---

## Submission

- GitHub Repo: `itue301-exam-24it055-C1`
