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

type ValueFormat = "whole" | "decimal-one" | "decimal-two" | "percent";

interface BarChartCardProps<T extends object> {
  title: string;
  description: string;
  data: T[];
  xKey: string;
  valueKey: string;
  barName?: string;
  barColor?: string;
  maxBarSize?: number;
  yDomain?: [number | string, number | string];
  valueFormat?: ValueFormat;
  tooltipLabel?: string;
  xAngle?: number;
  xHeight?: number;
  xTextAnchor?: "start" | "middle" | "end";
  margin?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  showValueLabels?: boolean;
}

export default function BarChartCard<T extends object>({
  title,
  description,
  data,
  xKey,
  valueKey,
  barName,
  barColor,
  maxBarSize,
  yDomain,
  valueFormat = "whole",
  tooltipLabel,
  xAngle,
  xHeight,
  xTextAnchor,
  margin,
  showValueLabels = false,
}: BarChartCardProps<T>) {
  const formatNumber = (value: number | string) => {
    const numeric = Number(value ?? 0);

    if (valueFormat === "decimal-one") {
      return Number.isFinite(numeric) ? numeric.toFixed(1) : "0.0";
    }

    if (valueFormat === "decimal-two") {
      return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
    }

    if (valueFormat === "percent") {
      return Number.isFinite(numeric) ? `${numeric.toFixed(1)}%` : "0.0%";
    }

    return Number.isFinite(numeric) ? String(Math.round(numeric)) : "0";
  };

  const formatTooltipValue = (value: any, name?: string | number) => {
    const label = tooltipLabel ?? String(name ?? barName ?? valueKey);
    return [formatNumber(value), label] as [string, string];
  };

  const formatValueLabel = (value: any) => formatNumber(value);
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={margin ?? { top: 16, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey={xKey}
                angle={xAngle}
                height={xHeight}
                textAnchor={xTextAnchor}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                allowDecimals={true}
                domain={yDomain}
                tickFormatter={(value) =>
                  valueFormat === "percent"
                    ? `${Number(value).toFixed(1)}%`
                    : String(value)
                }
                tickLine={false}
                axisLine={false}
                width={44}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                formatter={formatTooltipValue}
                cursor={{ fill: "var(--muted)" }}
              />
              <Bar
                dataKey={valueKey}
                fill={barColor ?? "var(--chart-2)"}
                radius={[4, 4, 0, 0]}
                maxBarSize={maxBarSize ?? 48}
                name={barName ?? valueKey}
              >
                {showValueLabels && (
                  <LabelList
                    dataKey={valueKey}
                    position="top"
                    formatter={formatValueLabel}
                    fill="var(--muted-foreground)"
                    fontSize={11}
                  />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
