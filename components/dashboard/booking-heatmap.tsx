import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HeatmapPoint } from "@/lib/queries/dashboard-types";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Tints a cell background along a muted -> foreground ramp, where t is the
 * intensity as a percentage (0 = muted, 100 = foreground). color-mix keeps
 * the ramp theme-aware in both light and dark mode.
 */
function cellColor(t: number): string {
  return `color-mix(in oklab, var(--foreground) ${t}%, var(--muted))`;
}

/**
 * Maps an ISODOW weekday (1 = Monday ... 7 = Sunday) to its short label.
 */
function dayLabel(weekday: number): string {
  return DAYS[weekday - 1] ?? String(weekday);
}

interface BookingHeatmapProps {
  data: HeatmapPoint[];
  className?: string;
}

export default function BookingHeatmap({
  data,
  className,
}: BookingHeatmapProps) {
  // Aggregate the rows into a lookup keyed by "weekday:hour" so each grid
  // cell can be filled directly by its coordinates. Also track the busiest
  // hour (to normalize intensity) and the first/last observed hour (to size
  // the rows).
  const counts = new Map<string, number>();
  let max = 0;
  let minHour = 24;
  let maxHour = 0;
  for (const point of data) {
    counts.set(`${point.weekday}:${point.hour}`, point.reservations);
    max = Math.max(max, point.reservations);
    minHour = Math.min(minHour, point.hour);
    maxHour = Math.max(maxHour, point.hour);
  }

  // Rows cover every hour from the first to the last observed booking.
  const hours: number[] = [];
  for (let hour = minHour; hour <= maxHour; hour++) {
    hours.push(hour);
  }

  // Flatten the whole grid into a single list of cells so CSS grid can lay
  // it out. The list starts with the empty top-left corner, then the seven
  // day headers, then one row per hour (hour label + seven day cells).
  const cells: ReactNode[] = [<div key="corner" />];
  for (const day of DAYS) {
    cells.push(
      <div
        key={`day-${day}`}
        className="text-center text-xs font-medium text-muted-foreground"
      >
        {day}
      </div>
    );
  }
  for (const hour of hours) {
    cells.push(
      <div
        key={`hour-${hour}`}
        className="flex items-center justify-end pr-1 text-xs text-muted-foreground"
      >
        {hour}
      </div>
    );
    // Weekdays run 1 (Mon) to 7 (Sun), matching the ISODOW values in SQL.
    for (let w = 1; w <= DAYS.length; w++) {
      const value = counts.get(`${w}:${hour}`);
      // Intensity is the cell's share of the busiest hour, mapped onto the
      // muted -> foreground ramp. Missing or zero cells stay at the muted
      // baseline.
      const t = value && value > 0 && max > 0
        ? Math.round((value / max) * 100)
        : 0;
      cells.push(
        <div
          key={`${hour}-${w}`}
          title={`${dayLabel(w)} ${String(hour).padStart(2, "0")}:00 · ${
            value ?? 0
          } ${value === 1 ? "reservation" : "reservations"}`}
          aria-label={`${dayLabel(w)} ${hour}:00, ${value ?? 0} reservations`}
          className={cn("h-8 rounded-sm", t === 0 && "bg-muted/60")}
          style={
            t > 0 ? { backgroundColor: cellColor(t) } : undefined
          }
        />
      );
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Booking Heatmap</CardTitle>
        <CardDescription>Hour × Day of Week</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        ) : (
          <>
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: "2.5rem repeat(7, minmax(0, 1fr))" }}
            >
              {cells}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="flex gap-1">
                {[0, 25, 50, 75, 100].map((t) => (
                  <span
                    key={t}
                    className="h-3 w-5 rounded-sm"
                    style={{ backgroundColor: cellColor(t) }}
                  />
                ))}
              </div>
              <span>High</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
