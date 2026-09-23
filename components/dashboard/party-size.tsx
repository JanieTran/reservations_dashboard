"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
import type { PartySizePoint } from "@/lib/queries/dashboard-types";

interface PartySizeProps {
  data: PartySizePoint[];
}

export default function PartySize({ data }: PartySizeProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Average Party Size</CardTitle>
          <CardDescription>Average guests by banquet type</CardDescription>
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
        <CardTitle>Average Party Size</CardTitle>
        <CardDescription>Average number of guests by banquet type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="banquet_type"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                allowDecimals={true}
                tickLine={false}
                axisLine={false}
                width={40}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                formatter={(value, name) => [
                  String(value),
                  name === "average_party_size" ? "Average Party Size" : String(name),
                ]}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar
                dataKey="average_party_size"
                className="fill-chart-2"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                name="Average Party Size"
              >
                <LabelList
                  dataKey="average_party_size"
                  position="top"
                  formatter={(value) => {
                    const numeric = Number(value ?? 0);
                    return Number.isFinite(numeric) ? numeric.toFixed(1) : "0.0";
                  }}
                  fill="var(--muted-foreground)"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
