"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PartySizePoint } from "@/lib/queries/party-size";

interface PartySizeProps {
  data: PartySizePoint[];
}

export default function PartySize({ data }: PartySizeProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Party Size Distribution</CardTitle>
          <CardDescription>Bookings by party size</CardDescription>
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
        <CardTitle>Party Size Distribution</CardTitle>
        <CardDescription>Bookings by party size</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="number_of_people"
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
                formatter={(value, name) => [
                  String(value),
                  name === "reservations" ? "Reservations" : String(name),
                ]}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar
                dataKey="reservations"
                className="fill-chart-2"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
