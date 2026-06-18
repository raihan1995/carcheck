export type Profile = {
  id: string;
  first_name: string;
  surname: string;
  created_at: string;
};

export type VehicleReport = {
  id: string;
  user_id: string;
  registration: string;
  report_data: Record<string, unknown>;
  amount_pence: number | null;
  currency: string | null;
  stripe_checkout_session_id: string | null;
  status: string;
  purchased_at: string;
};
