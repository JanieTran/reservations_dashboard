# Restaurant Analytics Dashboard

A modern web application for visualising restaurant data through interactive dashboards and business intelligence reports.

The dashboard is designed for restaurant owners and managers to monitor trends, customer behaviour, and operational performance. It demonstrates full-stack web development, SQL analytics, and data visualisation using a modern TypeScript stack.

---

## Features

### Authentication

- Log in with PostgreSQL database credentials
- Credentials are encrypted into a 7-day HttpOnly session cookie using AES-256-GCM; they are not stored in environment variables
- The login page redirects to the dashboard when already authenticated; the dashboard redirects to `/login` otherwise
- Log out clears the session

### Dashboard Controls

- Choose an active merchant; the selected merchant is used for dashboard queries and retained when switching tabs or date ranges.
- Choose the current week, month, quarter, or year-to-date, or the last complete week, month, quarter, or year
- Compare each selected period with the preceding equivalent period

### Dashboard Sections

- **Overview:** KPI comparison, daily trend, booking heatmap, bookings by location, and table utilisation.
- **Reservations:** Location, source, and banquet-type breakdowns; party size, weekday, and lead-time charts.
- **Cancellation:** Cancellation/no-show rates and reason counts.
- **Customers:** Customer type, nationality, and reservation-holder gender breakdowns.

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
Next.js App Router (Server Components)
    │
    ▼
Session-backed PostgreSQL queries
  ├─ Active merchant options
  └─ Dashboard aggregates (CTEs + json_agg)
    │
    ▼
PostgreSQL
```

- The server loads active merchant options, then runs one combined dashboard query for the selected merchant and date range.
- The dashboard query uses common-table expressions to aggregate KPIs, trends, heatmaps, reservations, cancellations, and customer insights. Each section is returned as a separate `json_agg` result column.
- Server Components call `getDashboardData()`, which runs the parameterized query with the logged-in user's database credentials and parses each section into typed data.
- React Client Components render interactive charts from that typed data.
- No separate backend service is required.

---

## Project Structure

```
restaurant-reservations/
│
├── app/
│   ├── api/auth/            # Login / logout API routes
│   ├── login/               # Login page and client form
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx             # Dashboard route and query parameter validation
│
├── components/
│   ├── dashboard/           # Dashboard tabs, shell, sidebar, and KPI grid
│   ├── charts/              # Reusable chart, heatmap, and KPI components
│   └── ui/                  # shadcn/ui primitives
│
├── lib/
│   ├── db.ts                # Session-backed PostgreSQL query helper
│   ├── session.ts           # Encrypted session cookie and DB connection helpers
│   ├── ranges.ts            # Current and last-period date range calculations
│   ├── delta.ts             # Delta computation for KPI comparisons
│   ├── format.ts            # Number / percentage formatting
│   ├── utils.ts             # cn() helper
│   └── queries/             # Dashboard SQL, raw row types, and parsers
│
├── wireframe.txt            # Design reference for planned sections
│
└── README.md
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

The dashboard query returns section aggregates as separate JSON columns, shaped for visualisation rather than exposing raw reservation records.

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
- Keep dashboard aggregates in one query; load merchant options separately.
- Build reusable components.

---

## License

MIT
