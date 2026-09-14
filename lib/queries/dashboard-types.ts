// ---- raw query rows ----

export interface BreakdownRow {
  [labelColumn: string]: string;
}

export interface DailyRow {
  date: string;
  reservations: string;
  guests: string;
}

export interface HeatmapRow {
  weekday: string;
  weekday_char: string;
  hour: string;
  reservations: string;
}

export interface KpiRow {
  period: "current" | "previous";
  total_reservations: string;
  total_guests: string;
  average_guests: string;
  cancelled_reservations: string;
  cancellation_rate: string;
  no_show_reservations: string;
  no_show_rate: string;
}

export interface PartySizeRow {
  number_of_people: string;
  reservations: string;
}

export interface BookingChannelRateRow {
  booking_channel: string;
  cancel_or_no_show_rate: number | string | null;
}

// ---- normalized dashboard data ----

export interface BreakdownPoint {
  label: string;
  reservations: number;
}

export interface DailyPoint {
  date: string;
  reservations: number;
  guests: number;
}

export interface HeatmapPoint {
  weekday: number;
  weekday_char: string;
  hour: number;
  reservations: number;
}

export interface KpiPeriod {
  period: "current" | "previous";
  total_reservations: number;
  total_guests: number;
  average_guests: number;
  cancelled_reservations: number;
  cancellation_rate: number;
  no_show_reservations: number;
  no_show_rate: number;
}

export interface KpiData {
  current: KpiPeriod;
  previous: KpiPeriod;
}

export interface PartySizePoint {
  number_of_people: number;
  reservations: number;
}

export interface BookingChannelRatePoint {
  booking_channel: string;
  cancel_or_no_show_rate: number;
}

export interface DashboardPayload {
  kpi: KpiRow[];
  daily: DailyRow[];
  heatmap: HeatmapRow[];
  party_size: PartySizeRow[];
  booking_channel: BreakdownRow[];
  booking_channel_rate: BookingChannelRateRow[];
  customer_type: BreakdownRow[];
  service_location: BreakdownRow[];
  booking_customer_gender: BreakdownRow[];
}

export interface DashboardData {
  kpi: KpiData;
  daily: DailyPoint[];
  heatmap: HeatmapPoint[];
  party_size: PartySizePoint[];
  booking_channel: BreakdownPoint[];
  booking_channel_rate: BookingChannelRatePoint[];
  customer_type: BreakdownPoint[];
  service_location: BreakdownPoint[];
  booking_customer_gender: BreakdownPoint[];
}

export const SAMPLE_KPI_DATA: KpiData = {
  current: {
    period: "current",
    total_reservations: 82,
    total_guests: 463,
    average_guests: 5.65,
    cancelled_reservations: 11,
    cancellation_rate: 13.41,
    no_show_reservations: 3,
    no_show_rate: 3.66,
  },
  previous: {
    period: "previous",
    total_reservations: 89,
    total_guests: 364,
    average_guests: 4.09,
    cancelled_reservations: 8,
    cancellation_rate: 8.99,
    no_show_reservations: 2,
    no_show_rate: 2.25,
  },
};
