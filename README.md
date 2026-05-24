# Complaint & Issue Tracking System

Full-stack complaint management app built with React, Node.js/Express, and SQLite.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite

## Features
- Customer complaint creation with attachments
- Duplicate complaint prevention within configurable time window
- Support agent status updates and comments
- Admin ticket assignment and analytics dashboard
- Escalation tracking and communication history logs
- Role-based protected routes (customer, agent, admin)
- Filtering by status, priority, category, and assigned agent
- Pagination for complaint history

## Demo Credentials
- Customer: `customer@example.com` / `password123`
- Agent: `agent@example.com` / `password123`
- Admin: `admin@example.com` / `password123`

## Project Structure
- `client` - React frontend
- `server` - Express API + SQLite initialization

## Setup
1. Install dependencies:
```bash
npm run install:all
```

2. Start both frontend and backend:
```bash
npm run dev
```

3. Open app:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Production Build (Single Service)
- Frontend is built from `client` and served by Express in production.
- Run:
```bash
npm run build:all
npm run start
```
- In production, app and API run from the same domain:
  - UI: `/`
  - API: `/api/*`

## Environment Variables
Copy `.env.example` to `.env` and adjust values as needed.

Additional optional variable:
- `DATA_DIR` (default: `server/`)  
  Use this in deployment so SQLite DB + uploads are stored on persistent disk.

## Database Initialization
- SQLite DB file is created automatically at first backend startup:
  - Local default: `server/complaints.sqlite`
  - If `DATA_DIR` is set: `${DATA_DIR}/complaints.sqlite`
- Seeded categories and demo users are inserted automatically.

## Deploy (Render - Recommended)
This repo includes [render.yaml](/Users/equinoxzi/Desktop/Project/render.yaml) for one-click style setup.

1. Push this repo to GitHub.
2. In Render, create a new Blueprint / Web Service from the repo.
3. Confirm settings from `render.yaml`:
   - Build Command: `npm run build:all`
   - Start Command: `npm run start`
   - Environment:
     - `NODE_ENV=production`
     - `PORT=10000`
     - `JWT_SECRET` (auto-generated)
     - `DATA_DIR=/data`
   - Persistent Disk mounted at `/data`
4. Deploy.
5. Open deployed URL and login with demo credentials.

## API Endpoint Summary
- `POST /api/auth/login` - Login
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id/status` - Update complaint status
- `POST /api/complaints/:id/comment` - Add comment
- `GET /api/complaints` - List complaints (with filters + pagination)
- `GET /api/complaints/:id` - Complaint detail (history, comments, attachments, escalations, resolution)
- `PUT /api/complaints/:id/assign` - Assign complaint (admin)
- `POST /api/complaints/:id/escalate` - Escalate complaint
- `GET /api/dashboard/admin` - Admin analytics
- `GET /api/meta/categories` - Categories
- `GET /api/meta/agents` - Support agents

## Submission Checklist
Add these links before final assignment submission:
- GitHub repository link: `https://github.com/Sitesh-Ranjan-Mohanty/Complaint-Tracker.git`
- Deployed app link: `https://complaint-tracker-app.onrender.com`
- Video walkthrough (5-8 minutes): `https://drive.google.com/file/d/1Uf6xuI0Vch4YLSAvabD6zt1jPdwTB7aP/view?usp=drive_link`

## Screens Included
- Complaint submission page
- Complaint tracking page
- Support agent dashboard
- Escalation management page
- Complaint details page
- Admin analytics page

## Notes
- Includes proper HTTP status handling and validation with `express-validator`.
- Includes loading/empty states in major screens and responsive CSS layout.
# Complaint-Tracker
