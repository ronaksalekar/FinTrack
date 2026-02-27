# FinTrack - Simple Personal Finance Tracker

FinTrack is a full-stack web app that helps users manage personal money in one place.

In simple words, this project lets a user:
- create an account and log in
- add income and expense transactions
- create category budgets
- view dashboard and report analytics
- switch light/dark theme
- manage profile and preferences

## What This Project Does

FinTrack focuses on daily money tracking with a clean flow:
1. User signs up or logs in.
2. User adds transactions and budgets.
3. Dashboard shows quick financial health (income, expense, savings, budget usage).
4. Reports page shows trends and category breakdown.
5. Settings page controls profile, notifications, and theme.

## Security Idea (Easy Version)

- Data is encrypted on the client side before being stored on the server.
- Server mainly stores encrypted blobs for finance records.
- JWT-based authentication is used for protected APIs.

## Main Features

- Authentication (signup/login)
- Protected routes
- Onboarding/welcome flow
- Transaction management
- Budget management
- Dashboard analytics (period filters: weekly/month/year)
- Reports analytics with charts
- Theme support (light/dark/auto)
- Profile and notification settings
- Data export

## Tech Stack

### Frontend
- React
- React Router
- Context API
- Recharts (charts)
- Lucide React + React Icons
- Plain CSS

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Rate limiting + Helmet + CORS

## Project Structure (High Level)

```text
finance_tracker/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
  frontend/
    public/
    src/
      components/
      hooks/
      utils/
      workers/
      App.js
```

## How To Run Locally

## 1) Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` (example):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_tracker_encrypted
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRE=7d
NODE_ENV=development
AUTH_RATE_LIMIT_ENABLED=false
```

## 2) Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`.

## Current Goal of This Project

Build a user-friendly, secure, and fast personal finance app that is easy to maintain and improve over time.
