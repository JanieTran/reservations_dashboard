import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface HeatmapColumn {
  key: string;
  label: string;
  title?: string;
}

export interface HeatmapCell {
  value: number;
  title: string;
  ariaLabel: string;
}

export interface HeatmapRow {
  key: string;
  label: string;
  cells: HeatmapCell[];
}

interface HeatmapCardProps {
  title: string;
  description: string;
  rows: HeatmapRow[];
  columns: HeatmapColumn[];
  scaleMax: number;
  legendLow: string;
  legendHigh: string;
  rowHeaderWidth: string;
  columnWidth: string;
  scrollable?: boolean;
  rowLabelAlign?: "start" | "end";
  className?: string;
}

function cellColor(intensity: number): string {
  return `color-mix(in oklab, var(--foreground) ${intensity}%, var(--muted))`;
}

export default function HeatmapCard({
  title,
  description,
  rows,
  columns,
  scaleMax,
  legendLow,
  legendHigh,
  rowHeaderWidth,
  columnWidth,
  scrollable = false,
  rowLabelAlign = "start",
  className,
}: HeatmapCardProps) {
  const hasData = rows.length > 0 && columns.length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            No data available for the selected period.
          </p>
        ) : (
          <div className={scrollable ? "overflow-x-auto" : undefined}>
            <div
              className={cn(
                "grid gap-1.5",
                scrollable ? "w-max min-w-full" : "w-full"
              )}
              style={{
                gridTemplateColumns: `${rowHeaderWidth} repeat(${columns.length}, ${columnWidth})`,
              }}
            >
              <div />
              {columns.map((column) => (
                <div
                  key={column.key}
                  title={column.title}
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {column.label}
                </div>
              ))}
              {rows.flatMap((row) => [
                <div
                  key={`row-${row.key}`}
                  title={row.label}
                  className={cn(
                    "flex h-8 items-center truncate pr-2 text-xs text-muted-foreground",
                    rowLabelAlign === "end" && "justify-end pr-1"
                  )}
                >
                  {row.label}
                </div>,
                ...columns.map((column, index) => {
                  const cell = row.cells[index] ?? {
                    value: 0,
                    title: `${row.label} · ${column.label}: 0`,
                    ariaLabel: `${row.label}, ${column.label}: 0`,
                  };
                  const intensity =
                    scaleMax > 0
                      ? Math.max(0, Math.min((cell.value / scaleMax) * 100, 100))
                      : 0;

                  return (
                    <div
                      key={`${row.key}-${column.key}`}
                      title={cell.title}
                      aria-label={cell.ariaLabel}
                      className={cn(
                        "h-8 rounded-sm",
                        intensity === 0 && "bg-muted/60"
                      )}
                      style={
                        intensity > 0
                          ? { backgroundColor: cellColor(intensity) }
                          : undefined
                      }
                    />
                  );
                }),
              ])}
            </div>
          </div>
        )}
        {hasData ? (
          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>{legendLow}</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map((intensity) => (
                <span
                  key={intensity}
                  className="h-3 w-5 rounded-sm"
                  style={{ backgroundColor: cellColor(intensity) }}
                />
              ))}
            </div>
            <span>{legendHigh}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}