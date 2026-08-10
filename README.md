# Restaurant Reservation Analytics Dashboard

A modern web application for visualising restaurant reservation data through interactive dashboards and business intelligence reports.

The dashboard is designed for restaurant owners and managers to monitor reservation trends, customer behaviour, occupancy, and operational performance. It demonstrates full-stack web development, SQL analytics, and data visualisation using a modern TypeScript stack.

---

## Features

### Executive Overview

- Daily reservation summary
- Total guests
- Occupancy rate
- Average party size
- Cancellation rate
- No-show rate

### Reservation Analytics

- Reservation trends over time
- Guest trends
- Reservations by hour
- Reservations by weekday
- Hour × weekday reservation heatmap

### Customer Insights

- Party size distribution
- Returning vs new customers
- Booking lead time analysis
- Reservation status distribution
- Booking source distribution

### Operational Insights

- Table utilisation
- Occupancy timeline
- Reservation details table
- Interactive filtering

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

- PostgreSQL

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
Next.js App Router
(Server Components)
    │
SQL Queries
    │
PostgreSQL
```

The application intentionally keeps the architecture simple.

- SQL performs filtering, joins, aggregations, and business calculations.
- Next.js Server Components execute SQL queries securely.
- React Client Components render interactive charts.
- No separate backend service is required.

---

## Project Structure

```
restaurant-dashboard/
│
├── app/
│   ├── dashboard/
│   ├── api/
│   └── layout.tsx
│
├── components/
│   ├── charts/
│   ├── dashboard/
│   ├── filters/
│   ├── tables/
│   └── ui/
│
├── lib/
│   ├── db.ts
│   ├── queries/
│   ├── utils.ts
│   └── constants.ts
│
├── public/
│
├── styles/
│
├── types/
│
└── README.md
```

---

## Dashboard Layout

```
+------------------------------------------------------------+
| KPI Cards                                                  |
+------------------------------------------------------------+

+----------------------------+-------------------------------+
| Reservation Trend          | Guest Trend                   |
+----------------------------+-------------------------------+

+----------------------------+-------------------------------+
| Reservations by Hour       | Reservations by Weekday       |
+----------------------------+-------------------------------+

+------------------------------------------------------------+
| Reservation Heatmap                                         |
+------------------------------------------------------------+

+------------------+------------------+----------------------+
| Party Size       | Lead Time        | Reservation Status   |
+------------------+------------------+----------------------+

+------------------+------------------+----------------------+
| Booking Source   | Returning Users  | Table Utilisation    |
+------------------+------------------+----------------------+

+------------------------------------------------------------+
| Occupancy Timeline                                         |
+------------------------------------------------------------+

+------------------------------------------------------------+
| Reservation Details Table                                  |
+------------------------------------------------------------+
```

---

## Database

The dashboard assumes a PostgreSQL database containing reservation-related information.

Typical entities include:

- Reservations
- Customers
- Tables
- Reservation Status
- Booking Source

The dashboard is query-driven, meaning charts consume aggregated SQL results instead of raw transactional data whenever possible.

---

## SQL Philosophy

Business logic should be implemented inside SQL whenever practical.

Examples include:

- CTEs
- Window functions
- Aggregate functions
- Conditional aggregation
- Date/time bucketing
- Ranking
- Joins

The frontend should receive datasets already shaped for visualisation.

Example output:

```json
[
  {
    "day": "2026-08-01",
    "reservations": 42
  },
  {
    "day": "2026-08-02",
    "reservations": 51
  }
]
```

instead of raw reservation records.

---

## Development

Install dependencies

```bash
pnpm install
```

Run development server

```bash
pnpm dev
```

Open

```
http://localhost:3000
```

---

## Design Principles

- Keep the UI clean and minimal.
- Prioritise business insights over decorative charts.
- Perform heavy data processing in SQL.
- Minimise frontend data transformation.
- Optimise for fast dashboard loading.
- Build reusable components.

---

## License

MIT
