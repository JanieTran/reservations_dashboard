"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

type StackValueMode = "count" | "percent";

type StackedBarCardProps<T extends Record<string, unknown>> = {
  title: string;
  description: string;
  data: T[];
  xKey: keyof T & string;
  stackKeys: string[];
  stackLabels?: Record<string, string>;
  valueMode?: StackValueMode;
  yDomain?: [number, number];
  barColors?: string[];
  showLegend?: boolean;
  layout?: "vertical" | "horizontal";
};

const DEFAULT_COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-2)", "var(--chart-4)"];

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

export default function StackedBarCard<T extends Record<string, unknown>>({
  title,
  description,
  data,
  xKey,
  stackKeys,
  stackLabels,
  valueMode = "count",
  yDomain,
  barColors = DEFAULT_COLORS,
  showLegend = true,
  layout = "vertical",
}: StackedBarCardProps<T>) {
  const chartData = data.map((row) => {
    const groupName = String(row[xKey] ?? "Unknown");
    return {
      __label: groupName,
      ...Object.fromEntries(
        stackKeys.map((key) => [key, toNumber(row[key])])
      ),
    };
  });

  const activeYDomain =
    yDomain ?? (valueMode === "percent" ? [0, 100] : undefined);
  const isHorizontal = layout === "horizontal";

  const formatTick = (value: number) =>
    valueMode === "percent" ? `${value.toFixed(0)}%` : `${Math.round(value)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout={isHorizontal ? "vertical" : "horizontal"}
              margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                vertical={isHorizontal}
                horizontal={!isHorizontal}
              />
              {isHorizontal ? (
                <>
                  <XAxis
                    type="number"
                    domain={activeYDomain}
                    tickFormatter={formatTick}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="__label"
                    width={90}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="__label"
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis
                    allowDecimals={false}
                    domain={activeYDomain}
                    tickFormatter={formatTick}
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                </>
              )}
              <Tooltip
                formatter={(value, name) => {
                  const numeric = Number(value ?? 0);
                  const label = stackLabels?.[String(name)] ?? String(name);

                  if (valueMode === "percent") {
                    return [`${numeric.toFixed(1)}%`, label];
                  }

                  return [String(Math.round(numeric)), label];
                }}
              />
              {showLegend && <Legend />}
              {stackKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="stack"
                  fill={barColors[index % barColors.length]}
                  radius={
                    isHorizontal
                      ? index === stackKeys.length - 1
                        ? [0, 4, 4, 0]
                        : [0, 0, 0, 0]
                      : index === stackKeys.length - 1
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                  }
                  name={stackLabels?.[key] ?? key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}