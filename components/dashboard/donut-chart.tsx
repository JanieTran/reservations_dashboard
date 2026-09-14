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
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
              <Pie
                data={data}
                dataKey="reservations"
                nameKey="label"
                startAngle={90}
                endAngle={-270}
                innerRadius="40%"
                outerRadius="80%"
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={1}
                labelLine={false}
                label={({ name, percent }) => {
                  if ((percent ?? 0) < 0.1) {
                    return null;
                  }
                  const label = String(name ?? "");
                  const displayLabel =
                    label.length > 18 ? `${label.slice(0, 17)}...` : label;

                  return `${displayLabel} ${Math.round(
                    (percent ?? 0) * 100
                  )}%`;
                }}
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
      </CardContent>
    </Card>
  );
}
