"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DailyPoint } from "@/lib/queries/dashboard-types";
import { cn } from "@/lib/utils";

type Metric = "reservations" | "guests";

const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: "reservations", label: "Reservations", color: "stroke-chart-2" },
  { key: "guests", label: "Guests", color: "stroke-chart-3" },
];

function formatTick(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ReservationsTrendProps {
  data: DailyPoint[];
}

export default function ReservationsTrend({ data }: ReservationsTrendProps) {
  const [metric, setMetric] = useState<Metric>("reservations");
  const active = METRICS.find((m) => m.key === metric) ?? METRICS[0];

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reservations Trend</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No data available for the selected period.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{active.label} Trend</CardTitle>
        <CardAction>
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetric(m.key)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm",
                  metric === m.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={40}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                labelFormatter={(label) => formatTick(String(label))}
                formatter={(value, name) => [
                  String(value),
                  name === "reservations" ? "Reservations" : "Guests",
                ]}
                cursor={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.5 }}
              />
              <Line
                type="monotone"
                dataKey={metric}
                className={active.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
