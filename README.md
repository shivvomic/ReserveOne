# ReserveOne
# College Hall Reservation System

A full-stack web app for browsing, booking, and managing campus resources —
computer labs, seminar halls, meeting rooms, and portable equipment — with
role-based approval workflows, live status updates, and audit logging.

Built as a portfolio project to demonstrate practical full-stack engineering:
authentication, authorization, concurrency-safe booking logic, real-time
updates, and a polished, production-styled frontend.



## Features

- JWT authentication with bcrypt password hashing; student/admin roles enforced on the backend, not just hidden in the UI
- Resource browsing with search, category, and status filters
- Booking requests with a 30-minute trailing buffer, overlap prevention via Postgres advisory locks, and a written-reason + undertaking requirement
- Admin approve/reject/modify workflow, with a re-validated conflict check at approval time
- Star-rating reviews, gated to students with a completed, approved booking for that resource
- Live booking status updates via Server-Sent Events — no polling, no page refresh
- Email notifications (approve/reject/cancel/modify) with an attached PDF undertaking, generated server-side
- Admin audit log for every approve/reject/modify action
- Fully responsive, dark-themed UI with page transitions, a mobile navigation drawer, and reduced-motion support

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS v4, React Router, Axios, Context API, Framer Motion, Lucide icons |
| Backend | Node.js, Express, raw SQL via `pg` (no ORM) |
| Database | PostgreSQL |
| Auth | JWT, bcrypt |
| Email | Resend |
| PDF generation | pdfkit |
| Testing | Jest, Supertest |

## Project structure
campus-resource-management/
├── frontend/ React + Vite app
├── backend/ Express API + PostgreSQL access
├── README.md
└── deployment-guide.md

## Prerequisites

- Node.js 22 or 24 (LTS)
- PostgreSQL 17 or 18
- Git

## Local setup

**1. Clone and install**

```bash
git clone https://github.com/<your-username>/campus-resource-management.git
cd campus-resource-management/backend && npm install
cd ../frontend && npm install
```

**2. Create the database**

```bash
psql -U postgres -c "CREATE DATABASE campus_resource_db;"
```

**3. Configure environment variables**

Copy each `.env.example` to `.env` and fill in real values:

`backend/.env`
```env
PORT=5000
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/campus_resource_db
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
RESEND_API_KEY=<your Resend API key>
EMAIL_FROM=<your verified sending address, e.g. bookings@mail.yourdomain.me>
```

`frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

**4. Initialize the database**

```bash
cd backend
npm run init-db
npm run migrate
npm run seed
```

**5. Run it**

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Visit `http://localhost:5173`.

## Demo credentials

Development only — change before any real deployment.

| Role | Email | Password |
|---|---|---|
| Admin | admin@campus.com | Admin@123 |
| Student | student@campus.com | Student@123 |

## Testing

```bash
cd backend
npm run init-test-db
npm run migrate:test
npm test
```

Covers authentication, authorization boundaries, booking conflict/buffer logic, admin workflows, and audit logging.

## API overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Area | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET/PUT /auth/profile` |
| Resources | `GET /resources`, `GET/POST/PUT/DELETE /resources/:id`, `GET /resources/:id/availability` |
| Reviews | `GET/POST /resources/:id/reviews` |
| Bookings | `POST /bookings`, `GET /bookings/my`, `GET /bookings` (admin), `PUT /bookings/:id/status`, `PUT /bookings/:id` (modify), `DELETE /bookings/:id`, `GET /bookings/:id/undertaking/pdf` |
| Users | `GET /users` (admin) |
| Dashboard | `GET /dashboard/stats` (admin) |
| Events | `GET /events/stream` (SSE) |
| Admin | `GET /admin/audit-logs` |

## Troubleshooting

| Problem | Likely cause |
|---|---|
| `/api/health/db` fails | Wrong password in `DATABASE_URL`, Postgres service not running, or an un-encoded special character in the password |
| Emails not arriving | Domain not yet verified in Resend, or `EMAIL_FROM` still pointing at the sandbox address |
| SSE toasts not firing | Backend restarted — `EventSource` reconnects automatically within a few seconds |
| `bcrypt` install fails on Windows | Run `npm install bcryptjs` instead and swap the `require()` line in `authController.js`/seed scripts |

## License

Built as a personal portfolio project.