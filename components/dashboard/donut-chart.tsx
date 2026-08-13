"use client";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BreakdownPoint } from "@/lib/queries/breakdown";

const COLORS = [
  "var(--chart-5)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
];

interface DonutChartProps {
  title: string;
  description?: string;
  data: BreakdownPoint[];
}

export default function DonutChart({
  title,
  description,
  data,
}: DonutChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No data available for the selected period.
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, point) => sum + point.reservations, 0);

  const colorByLabel = new Map(
    data.map((point, index) => [point.label, COLORS[index % COLORS.length]])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="reservations"
                nameKey="label"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
                shape={(props) => (
                  <Sector
                    {...props}
                    fill={
                      props.name
                        ? colorByLabel.get(props.name) ?? COLORS[0]
                        : COLORS[0]
                    }
                  />
                )}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value} (${Math.round(
                    (Number(value) / total) * 100
                  )}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex w-full flex-col gap-1.5">
          {data.map((point, index) => (
            <li
              key={`item-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-muted-foreground">{point.label}</span>
              <span className="ml-auto tabular-nums">
                {point.reservations} (
                {Math.round((point.reservations / total) * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
