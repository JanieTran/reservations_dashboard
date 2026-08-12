import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Delta, DeltaTone } from "@/lib/delta";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta: Delta;
}

const toneStyles: Record<DeltaTone, string> = {
  good: "text-emerald-600",
  bad: "text-red-600",
  neutral: "text-muted-foreground",
};

const directionIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
} as const;

export default function KpiCard({ label, value, delta }: KpiCardProps) {
  const Icon = directionIcons[delta.direction];

  return (
    <Card size="sm">
      <CardContent>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-sm",
            toneStyles[delta.tone]
          )}
        >
          <Icon className="size-4" aria-hidden />
          <span>
            {delta.text}{" "}
            <span className="text-muted-foreground">vs previous</span>
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
