export interface DateRange {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
}

export function getDefaultDateRange(): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentStart = today;
  const currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
  const previousStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
  const previousEnd = currentStart;

  return { currentStart, currentEnd, previousStart, previousEnd };
}
