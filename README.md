# 📅 Scaler Scheduling Platform

A full-stack meeting scheduling platform inspired by **Calendly**. Hosts can create event types, set availability windows, and share public booking links. Guests book time slots directly — no account needed — and both parties receive automated email notifications.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [How the Website Works — Full Workflow](#-how-the-website-works--full-workflow)
- [API Reference](#-api-reference)
- [Assumptions Made](#-assumptions-made)

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 8 | Build tool & dev server |
| **React Router DOM** | 7 | Client-side routing (SPA) |
| **Tailwind CSS** | 3 | Utility-first styling |
| **Axios** | 1.15 | HTTP client for API calls |
| **date-fns** | 4 | Date formatting & manipulation |
| **clsx + tailwind-merge** | latest | Conditional class name merging |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ (LTS) | Runtime environment |
| **Express.js** | 4 | HTTP server & routing |
| **MySQL2** | 3 | MySQL database driver (promise-based) |
| **Zod** | 4 | Schema validation & request parsing |
| **Resend** | 6 | Transactional email service |
| **date-fns** | 4 | Server-side date math (slot calculation) |
| **uuid** | 13 | UUID v4 generation for all primary keys |
| **dotenv** | 17 | Environment variable loading |
| **express-async-errors** | 3 | Async error forwarding to global handler |
| **nodemon** | 3 | Auto-restart in development |

### Database

| Technology | Purpose |
|---|---|
| **MySQL** | Relational database (hosted Aiven) |

### Deployment

| Layer | Platform |
|---|---|
| **Frontend** | Vercel (with SPA catch-all rewrite) |
| **Backend** | Render |
| **Database** | Aiven |
| **Emails** | Resend (transactional email API) |

---

## 📁 Project Structure

```
Scaler/
├── database/
│   └── setup.sql              # All CREATE TABLE statements + indexes
│
├── backend/
│   ├── server.js              # Entry point — starts Express on PORT
│   ├── app.js                 # Express app: CORS, middleware, route mounting
│   ├── .env.example           # Template for required environment variables
│   └── src/
│       ├── config/
│       │   └── db.js          # MySQL2 connection pool setup
│       ├── routes/
│       │   ├── eventTypes.js  # CRUD routes for event types
│       │   ├── availability.js# GET/POST user availability
│       │   ├── slots.js       # GET available time slots (public)
│       │   ├── bookings.js    # Create / list / cancel / reschedule bookings
│       │   └── users.js       # User profile (GET / POST seed)
│       ├── controllers/
│       │   ├── eventTypesController.js
│       │   ├── availabilityController.js
│       │   ├── slotsController.js
│       │   ├── bookingsController.js
│       │   └── userController.js
│       ├── services/
│       │   ├── slotService.js   # Core slot-generation algorithm
│       │   └── emailService.js  # Resend email templates (confirm/cancel/reschedule)
│       ├── middlewares/
│       │   └── errorHandler.js  # Global error handler (Zod + generic)
│       └── utils/              # Shared helpers
│
└── frontend/
    ├── index.html
    ├── vercel.json             # SPA catch-all rewrite for Vercel
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx            # ReactDOM.createRoot entry
        ├── App.jsx             # Router + ThemeSwitcher + all Routes
        ├── api.js              # Axios instance with base URL + MOCK_USER_ID header
        ├── index.css           # Global design tokens + Tailwind base
        ├── pages/
        │   ├── Dashboard.jsx      # Host's home — event type list
        │   ├── CreateEvent.jsx    # Form to create a new event type
        │   ├── EditEvent.jsx      # Pre-filled edit form per slug
        │   ├── Availability.jsx   # Set weekly availability + timezone
        │   ├── Meetings.jsx       # View + manage all bookings
        │   ├── BookingFlow.jsx    # Public booking page (calendar + form)
        │   └── BookingConfirmation.jsx  # Post-booking success screen
        └── components/
            ├── Layout.jsx         # Sidebar navigation shell
            ├── EventCard.jsx      # Card for each event type
            ├── EventForm.jsx      # Shared create/edit form fields
            ├── Toast.jsx          # Global toast notification system
            ├── ConfirmDialog.jsx  # Reusable confirmation modal
            ├── BufferTimeInput.jsx# Buffer before/after input control
            ├── DurationSelector.jsx
            ├── Tabs.jsx           # Upcoming / Past / Canceled tab switcher
            └── ...other shared components
```

---

## 🗄 Database Schema

```sql
users
  id (UUID PK), name, email (UNIQUE), timezone, created_at

event_types
  id (UUID PK), user_id (FK → users), name, description,
  duration (minutes), slug (UNIQUE per user),
  buffer_before (minutes), buffer_after (minutes), created_at

event_availabilities          -- per-event-type override windows
  id (UUID PK), event_type_id (FK → event_types),
  day_of_week (0=Sun … 6=Sat), start_time (TIME), end_time (TIME)

availabilities                -- host's generic weekly availability
  id (UUID PK), user_id (FK → users),
  day_of_week (0=Sun … 6=Sat), start_time (TIME), end_time (TIME)

bookings
  id (UUID PK), event_type_id (FK), user_id (FK → users),
  booker_name, booker_email,
  start_time (DATETIME UTC), end_time (DATETIME UTC),
  status (SCHEDULED | CANCELED), created_at
```

**Indexes for performance:**
- `idx_user_id` on `event_types(user_id)`
- `idx_availability_user_id` on `availabilities(user_id)`
- `idx_bookings_user_id`, `idx_bookings_event_type`, `idx_bookings_start_time` on `bookings`

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9
- **MySQL** database (local or cloud — PlanetScale, Railway, Azure)
- **Resend** account for email (free tier is sufficient)

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Scaler
```

---

### 2. Database Setup

Connect to your MySQL instance and run the setup file:

```bash
mysql -h <host> -u <user> -p <database_name> < database/setup.sql
```

Or paste the contents of `database/setup.sql` directly into your MySQL client / cloud dashboard.

**Then seed a demo user** (the app uses a hardcoded `MOCK_USER_ID = "demo-user-1"`):

```sql
INSERT INTO users (id, name, email, timezone)
VALUES ('demo-user-1', 'Demo Host', 'host@example.com', 'Asia/Kolkata');
```

---

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env (see Environment Variables section)
npm install
npm run dev       # development with auto-reload
# or
npm start         # production
```

The server starts on `http://localhost:5000` by default.

**Health check:** `GET http://localhost:5000/api/health` → `{ "status": "ok" }`

---

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev       # starts on http://localhost:5173
```

---

### 5. Production Deployment

#### Frontend → Vercel

1. Push `frontend/` to GitHub and import into Vercel.
2. Set **Build Command**: `npm run build`
3. Set **Output Directory**: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. The `vercel.json` already contains the SPA catch-all rewrite:
   ```json
   { "source": "/(.*)", "destination": "/index.html" }
   ```

#### Backend → Railway / Render

1. Connect your GitHub repo.
2. Set root directory to `backend/`.
3. Set **Start Command**: `node server.js`
4. Add all environment variables from `.env.example`.

---

## 🔑 Environment Variables

### Backend `.env`

```env
# MySQL Database
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_SSL=true
# Server
PORT=5000
NODE_ENV=development

# Email — get your API key from resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# CORS — your deployed frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend `.env.local`

```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🔄 How the Website Works — Full Workflow

### Overview

The platform has two distinct user experiences:

1. **Host Dashboard** (authenticated / dark theme) — manage event types, availability, and bookings.
2. **Public Booking Page** (unauthenticated / light theme) — a guest visits a shareable link and books a time.

---

### 🏠 Host Workflow

#### Step 1 — Dashboard (`/`)
- The host lands on the Dashboard, which fetches all their **event types** via `GET /api/event-types` (authenticated with `x-user-id` header).
- Each event type is displayed as a card showing name, duration, and a public booking link (`/book/:slug`).
- The host can **copy the link**, **open it**, **edit**, or **delete** an event type.

#### Step 2 — Create Event Type (`/create-event`)
- The host fills in:
  - **Name** (e.g., "30 Min Chat")
  - **Slug** (URL-friendly, auto-generated or custom, e.g., `30-min-chat`)
  - **Duration** (minutes)
  - **Description** (optional meeting instructions)
  - **Buffer Before / After** (gap time in minutes to prevent back-to-back meetings)
  - **Event-specific availability windows** (which days/times this event is available)
- On submit → `POST /api/event-types` — creates the event type in a **database transaction** (event_types + event_availabilities rows).

#### Step 3 — Set Availability (`/availability`)
- The host sets their **generic weekly schedule** — which days and hours they are generally available.
- Also sets their **timezone** (stored on the `users` record).
- On save → `POST /api/availability` — replaces all availability rows in a transaction; validates no overlapping time ranges on the same day.

#### Step 4 — Meetings (`/meetings`)
- Lists all bookings for the host fetched via `GET /api/bookings`.
- **Filters**: Upcoming / Past / Canceled tabs, plus filter by event type or duration.
- Per booking, the host can:
  - **View Details** — see full booking info including booker contact.
  - **Reschedule** → opens an inline calendar picker → `PUT /api/bookings/:id/reschedule` (uses a DB transaction to check for conflicts with the new slot).
  - **Cancel** → confirmation dialog → `DELETE /api/bookings/:id` → status set to `CANCELED`; cancellation emails sent automatically.
  - **Add to Google Calendar** — generates a Google Calendar event URL and opens it in a new tab.

---

### 👤 Guest Booking Workflow

#### Step 1 — Land on Public Booking Page (`/book/:slug`)
- The guest receives a link from the host (e.g., `https://yourapp.vercel.app/book/30-min-chat`).
- The frontend loads **BookingFlow** — a standalone page (no sidebar, light theme).
- `GET /api/event-types/:slug` is called to fetch event type details (name, duration, description, buffer times, availability windows).

#### Step 2 — Pick a Date
- A **calendar** is rendered showing the current month.
- When the guest clicks a date, the frontend calls:
  `GET /api/slots?date=YYYY-MM-DD&slug=30-min-chat&userId=<owner-id>`
- The **Slot Service** runs the core algorithm:
  1. Fetch the event type and its `buffer_before` / `buffer_after`.
  2. Fetch generic availability for that day of week.
  3. Fetch event-specific availability overrides for that day.
  4. **Intersect** both — only times that fall within both windows are considered.
  5. Fetch all existing `SCHEDULED` bookings for that date.
  6. Generate time slots of `duration` minutes back-to-back.
  7. For each slot, expand it by `buffer_before` / `buffer_after` and check for overlap with existing bookings.
  8. Filter out any slots in the past (before `NOW()`).
  9. Return the valid slots array + the host's timezone.

#### Step 3 — Pick a Time Slot
- Available slots are shown as buttons.
- Clicking a slot selects it and reveals the **booking form**.

#### Step 4 — Enter Details & Submit
- The guest fills in their **Name** and **Email**.
- On submit → `POST /api/bookings`:
  - Parses and validates input with Zod schema.
  - Fetches event type to get `duration` and `user_id`.
  - Calculates `end_time = start_time + duration`.
  - Opens a **MySQL transaction** with `FOR UPDATE` lock → checks for double-booking → inserts the booking.
  - Asynchronously sends **confirmation emails** to both the host and the guest via Resend.
  - Returns the booking object.

#### Step 5 — Booking Confirmed (`/booking-confirmed`)
- The guest is redirected to a confirmation page showing all booking details (event name, date, time, duration, booker info).
- A **"Book Another"** button links back to the same event's booking page.

---

### 📧 Email Notifications (Async)

All emails are sent **after** the HTTP response is returned — they do not block the request.

| Trigger | Recipients | Content |
|---|---|---|
| New booking created | Host + Guest | Event name, date/time, booker details |
| Booking canceled | Host + Guest | Cancellation notice with original time |
| Booking rescheduled | Host + Guest | Old vs. new time comparison |

Emails are templated HTML built inside `emailService.js` using the **Resend** API.

## 📡 API Reference

All protected routes require the `x-user-id` header. Public routes do not.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` |Server health check |
| `GET` | `/api/users`  |Get current user profile |
| `POST` | `/api/users` |Create/seed a user |
| `GET` | `/api/event-types`  |List host's event types |
| `GET` | `/api/event-types/:slug` |Get event type by slug (public) |
| `POST` | `/api/event-types`  |Create a new event type |
| `PUT` | `/api/event-types/:id`  |Update an event type |
| `DELETE` | `/api/event-types` | Delete an event type |
| `GET` | `/api/availability`  |Get host's weekly availability |
| `POST` | `/api/availability`  |Save/replace host's availability |
| `GET` | `/api/slots` |Get available slots for a date/event |
| `GET` | `/api/bookings`  |List bookings (filter by type/duration) |
| `POST` | `/api/bookings` |Create a new booking (guest action) |
| `DELETE` | `/api/bookings/:id`  |Cancel a booking |
| `PUT` | `/api/bookings/:id/reschedule`  |Reschedule a booking |

**Query params for `GET /api/bookings`:**
- `type` — `upcoming` | `past` (filters by time)
- `event_type_id` — filter by event type UUID
- `duration` — filter by duration in minutes

**Query params for `GET /api/slots`:**
- `date` — `YYYY-MM-DD` format
- `slug` — event type slug
- `userId` — host's user ID (used for availability lookup)

---

## 📌 Assumptions Made

1. **Single-host architecture** — the app is designed for one host account. Authentication is mocked via a hardcoded `MOCK_USER_ID = "demo-user-1"` passed as an `x-user-id` HTTP header. No login/registration flow is implemented.

2. **No real authentication** — the `x-user-id` header is trusted without JWT, OAuth, or session verification. For a production system, this would be replaced by a proper auth layer (e.g., JWT middleware).

3. **Times stored in UTC** — all `start_time` and `end_time` values in the `bookings` table are stored in UTC. The host's timezone is stored separately and passed to the frontend for display purposes only.

4. **Slot generation is server-side** — the backend calculates all available slots on each request rather than caching, ensuring real-time accuracy at the cost of slightly more DB load.

5. **Buffer times are enforced at slot generation, not at booking** — the buffer before/after expands the occupied window during slot calculation, effectively blocking those adjacent slots from being offered. A booking itself stores only its actual `start_time` and `end_time`.

6. **Resend API key required for emails** — if `RESEND_API_KEY` is not set or invalid, emails will silently fail with a console warning. The booking itself will still succeed — email failure does not roll back the transaction.

7. **Double-booking protection via DB transaction** — a `SELECT ... FOR UPDATE` lock is used inside a MySQL transaction to ensure concurrent requests cannot book the same slot. The `UNIQUE KEY (event_type_id, start_time)` on the `bookings` table provides a second layer of protection.

8. **Slug uniqueness is per-user** — two different hosts can have event types with the same slug (e.g., both can have `30-min-chat`). Uniqueness is enforced at the `(user_id, slug)` composite level.

9. **Guest does not need an account** — any person with the booking link can book a slot. Only name and email are collected from the guest.

10. **Event-specific availability** — each event type can optionally have its own availability overrides (stored in `event_availabilities`). If none are set, the system falls back to the host's generic weekly availability.
