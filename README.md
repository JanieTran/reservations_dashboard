# Restaurant Reservation Analytics Dashboard

A modern web application for visualising restaurant reservation data through interactive dashboards and business intelligence reports.

The dashboard is designed for restaurant owners and managers to monitor reservation trends, customer behaviour, and operational performance. It demonstrates full-stack web development, SQL analytics, and data visualisation using a modern TypeScript stack.

---

## Features

### Authentication

- Log in with PostgreSQL database credentials (username and password are entered in the login form, never stored)
- Credentials are encrypted into a 7-day HttpOnly session cookie using AES-256-GCM
- The login page redirects to the dashboard when already authenticated; the dashboard redirects to `/login` otherwise
- Log out clears the session

### Executive Overview

- KPI cards for reservations, guests, average party size, cancellation rate, and no-show rate
- Each card compares the current period against the previous period
  - Counts (reservations, guests) show percentage change
  - Rates show percentage-point change
  - Deltas are coloured emerald or red depending on whether the move is good or bad for the business

### Reservation Analytics

- Reservations / guests trend line chart with a metric toggle
- Reservation heatmap by hour × day of week with a grayscale intensity legend

### Customer Insights

- Party size distribution bar chart
- Donut charts for booking source, customer type, and customer gender

---

## Technology Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### Database

- PostgreSQL (`pg` driver)

### Development

- ESLint
- Prettier
- pnpm

---

## Architecture

```
Browser
    │
    ▼
Login (DB credentials)
    │
    ▼
Next.js App Router
(Server Components)
    │
    ▼
Single SQL query
(CTEs + json_build_object)
    │
    ▼
PostgreSQL
```

- The dashboard loads with a single combined SQL query: common-table expressions filter bookings and aggregate all sections (KPI summary, daily trend, heatmap, party size, and breakdowns), then `json_build_object` returns them in one payload.
- Server Components call `getDashboardData()`, which runs the query with the logged-in user's database credentials and parses each section into typed data.
- React Client Components render interactive charts from that typed data.
- No separate backend service is required.

---

## Project Structure

```
restaurant-reservations/
│
├── app/
│   ├── api/auth/            # Login / logout API routes
│   ├── login/               # Login page (server guard + client form)
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx             # Dashboard page
│
├── components/
│   ├── dashboard/           # Chart components (kpi, trend, heatmap, party size, donut)
│   └── ui/                  # shadcn/ui primitives
│
├── lib/
│   ├── db.ts                # Per-request pg client + debug logging
│   ├── session.ts           # Session cookie encryption / auth helpers
│   ├── ranges.ts            # Date ranges and date formatting
│   ├── delta.ts             # Delta computation for KPI comparisons
│   ├── format.ts            # Number / percentage formatting
│   ├── utils.ts             # cn() helper
│   └── queries/             # SQL + parsers per dashboard section
│
├── wireframe.txt            # Design reference for planned sections
│
└── README.md
```

---

## Dashboard Layout

```
+-------------------------------------------------------------+
| KPI Cards: Reservations · Guests · Avg Party · Cancellation │
|            Rate · No-show Rate                              │
+-------------------------------------------------------------+

+-----------------------------+-------------------------------+
| Reservations / Guests Trend | Reservation Heatmap           |
+-----------------------------+  (spanning 2 rows)            |
| Party Size Distribution     |                               |
+-----------------------------+-------------------------------+

+--------------------------+--------------------------+---------+
| Booking Source (donut)   | Customer Type (donut)    | Customer|
|                          |                          | Gender  |
+--------------------------+--------------------------+---------+
```

---

## SQL Philosophy

Business logic should be implemented inside SQL whenever practical.

Examples include:

- CTEs
- Aggregate functions
- Conditional aggregation
- Date/time bucketing
- Joins

The frontend receives datasets already shaped for visualisation via a single `json_build_object` payload:

```json
{
  "kpi": [...],
  "daily": [...],
  "heatmap": [...],
  "party_size": [...],
  "booking_channel": [...],
  "customer_type": [...],
  "booking_customer_gender": [...]
}
```

instead of raw reservation records.

---

## Development

### Setup

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Configure the database connection

   ```bash
   cp .env.example .env.local
   ```

   Fill in `DATABASE_HOST`, `DATABASE_PORT`, and `DATABASE_NAME`. The database username and password are entered at login, not stored in environment variables.

3. Generate a session secret

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   and set it as `AUTH_SECRET` in `.env.local`.

4. Run the development server

   ```bash
   pnpm dev
   ```

5. Open the dashboard

   ```
   http://localhost:3000
   ```

   and log in with your PostgreSQL credentials.

### Debugging

Set `SQL_DEBUG=1` in `.env.local` to log every query, its parameters, and its rows to the server console.

---

## Design Principles

- Keep the UI clean and minimal.
- Prioritise business insights over decorative charts.
- Perform heavy data processing in SQL.
- Minimise frontend data transformation.
- Optimise for fast dashboard loading (single query per page load).
- Build reusable components.

---

## License

MIT
