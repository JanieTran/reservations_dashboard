// ---- raw query rows ----

export interface BreakdownRow {
  [labelColumn: string]: string;
}

export interface DailyRow {
  period?: "current" | "previous";
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

export interface TableUtilisationRow {
  service_location_name?: string;
  booking_date: string;
  table_utilisation_rate: number | string | null;
}

export interface EventTypeByLocationRow {
  service_location_name?: string;
  total_bookings?: number | string | null;
  banquet_count?: number | string | null;
  dine_in_count?: number | string | null;
  banquet_rate?: number | string | null;
  dine_in_rate?: number | string | null;
}

export interface KpiRow {
  period: "current" | "previous";
  total_bookings: string;
  total_guests: string;
  average_guests?: string;
  total_reservations?: string;
  reservation_rate: string;
  cancelled_reservations: string;
  cancellation_rate: string;
  no_show_reservations?: string;
  no_show_rate?: string;
}

export interface PartySizeRow {
  banquet_type: string;
  average_party_size: string;
}

export interface ReservationCountByLocationRow {
  service_location_name?: string | null;
  reservations: number | string | null;
}

export interface BookingChannelRateRow {
  booking_channel: string;
  cancel_or_no_show_rate: number | string | null;
}

export interface CancelRateRow {
  booking_channel?: string;
  service_location_name?: string;
  event_type?: string;
  banquet_type?: string;
  cancel_rate: number | string | null;
}

export interface CancelReasonsCountRow {
  cancel_reason?: string;
  reservations: number | string | null;
}

export interface CustomerTypeRow {
  service_location_name?: string;
  booking_channel?: string;
  new_count?: number | string | null;
  returning_count?: number | string | null;
  new_rate?: number | string | null;
  returning_rate?: number | string | null;
}

export interface CustomerNationalityRow {
  service_location_name?: string;
  vietnamese_count?: number | string | null;
  foreigner_count?: number | string | null;
  vietnamese_rate?: number | string | null;
  foreigner_rate?: number | string | null;
}

export interface BookingCustomerGenderRow {
  service_location_name?: string;
  female_count?: number | string | null;
  male_count?: number | string | null;
  female_rate?: number | string | null;
  male_rate?: number | string | null;
}

// ---- normalized dashboard data ----

export interface BreakdownPoint {
  label: string;
  reservations: number;
}

export interface DailyPoint {
  date: string;
  currentBookings: number;
  previousBookings: number;
  currentGuests: number;
  previousGuests: number;
}

export interface HeatmapPoint {
  weekday: number;
  weekday_char: string;
  hour: number;
  reservations: number;
}

export interface TableUtilisationLocation {
  service_location_name: string;
  utilisation_rates: number[];
}

export interface TableUtilisationHeatmapData {
  dates: string[];
  locations: TableUtilisationLocation[];
}

export interface EventTypeByLocationPoint {
  [key: string]: string | number | undefined;
  service_location_name: string;
  total_bookings: number;
  banquet_count: number;
  dine_in_count: number;
  banquet_rate: number;
  dine_in_rate: number;
}

export interface KpiPeriod {
  period: "current" | "previous";
  total_bookings: number;
  total_guests: number;
  average_guests: number;
  reservation_rate: number;
  cancelled_reservations: number;
  cancellation_rate: number;
}

export interface KpiData {
  current: KpiPeriod;
  previous: KpiPeriod;
}

export interface PartySizePoint {
  banquet_type: string;
  average_party_size: number;
}

export interface BookingChannelRatePoint {
  booking_channel: string;
  cancel_or_no_show_rate: number;
}

export interface CancelRatePoint {
  label: string;
  cancel_rate: number;
}

export interface CustomerTypeLocationPoint {
  [key: string]: string | number | undefined;
  service_location_name: string;
  new_count: number;
  returning_count: number;
  new_rate: number;
  returning_rate: number;
}

export interface CustomerTypeChannelPoint {
  [key: string]: string | number | undefined;
  booking_channel: string;
  new_count: number;
  returning_count: number;
  new_rate: number;
  returning_rate: number;
}

export interface CustomerNationalityPoint {
  [key: string]: string | number | undefined;
  service_location_name: string;
  vietnamese_count: number;
  foreigner_count: number;
  vietnamese_rate: number;
  foreigner_rate: number;
}

export interface BookingCustomerGenderPoint {
  [key: string]: string | number | undefined;
  service_location_name: string;
  female_count: number;
  male_count: number;
  female_rate: number;
  male_rate: number;
}

export interface DashboardQueryRow {
  [column: string]: unknown;
  kpi: KpiRow[] | null;
  daily: DailyRow[] | null;
  heatmap: HeatmapRow[] | null;
  table_utilisation_heatmap: TableUtilisationRow[] | null;
  event_type_by_location: EventTypeByLocationRow[] | null;
  resv_count_by_locations: ReservationCountByLocationRow[] | null;
  party_size: PartySizeRow[] | null;
  booking_channel: BreakdownRow[] | null;
  banquet_type: BreakdownRow[] | null;
  resv_day_of_week: BreakdownRow[] | null;
  resv_lead_time: BreakdownRow[] | null;
  cancel_by_location: CancelRateRow[] | null;
  cancel_by_channel: CancelRateRow[] | null;
  cancel_by_event_type: CancelRateRow[] | null;
  cancel_by_banquet_type: CancelRateRow[] | null;
  cancel_reasons_count: CancelReasonsCountRow[] | null;
  customer_type: CustomerTypeRow[] | null;
  customer_type_by_channel: CustomerTypeRow[] | null;
  customer_nationality: CustomerNationalityRow[] | null;
  booking_customer_gender: BookingCustomerGenderRow[] | null;
}

export interface DashboardData {
  kpi: KpiData;
  daily: DailyPoint[];
  heatmap: HeatmapPoint[];
  table_utilisation_heatmap: TableUtilisationHeatmapData;
  event_type_by_location: EventTypeByLocationPoint[];
  resv_count_by_locations: BreakdownPoint[];
  party_size: PartySizePoint[];
  booking_channel: BreakdownPoint[];
  banquet_type: BreakdownPoint[];
  resv_day_of_week: BreakdownPoint[];
  resv_lead_time: BreakdownPoint[];
  cancel_by_location: CancelRatePoint[];
  cancel_by_channel: CancelRatePoint[];
  cancel_by_event_type: CancelRatePoint[];
  cancel_by_banquet_type: CancelRatePoint[];
  cancel_reasons_count: BreakdownPoint[];
  booking_channel_rate: BookingChannelRatePoint[];
  customer_type: CustomerTypeLocationPoint[];
  customer_type_by_channel: CustomerTypeChannelPoint[];
  customer_nationality: CustomerNationalityPoint[];
  booking_customer_gender: BookingCustomerGenderPoint[];
}

export const SAMPLE_KPI_DATA: KpiData = {
  current: {
    period: "current",
    total_bookings: 82,
    total_guests: 463,
    average_guests: 5.65,
    reservation_rate: 76.83,
    cancelled_reservations: 11,
    cancellation_rate: 13.41,
  },
  previous: {
    period: "previous",
    total_bookings: 89,
    total_guests: 364,
    average_guests: 4.09,
    reservation_rate: 71.91,
    cancelled_reservations: 8,
    cancellation_rate: 8.99,
  },
};
