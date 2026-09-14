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
import type { BookingChannelRatePoint } from "@/lib/queries/booking-channel-rates";

interface BookingChannelRateProps {
  data: BookingChannelRatePoint[];
}

export default function BookingChannelRate({
  data,
}: BookingChannelRateProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cancellation and No-Show Rate</CardTitle>
          <CardDescription>Combined rate by booking source</CardDescription>
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
        <CardTitle>Cancellation and No-Show Rate</CardTitle>
        <CardDescription>Combined rate by booking source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 24, left: 4, right: 4 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="booking_channel"
                angle={-20}
                height={48}
                textAnchor="end"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                axisLine={false}
                width={44}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toFixed(2)}%`,
                  "Cancel / no-show rate",
                ]}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar
                dataKey="cancel_or_no_show_rate"
                className="fill-chart-3"
                radius={[4, 4, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
