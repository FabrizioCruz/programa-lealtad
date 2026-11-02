export interface Payment {
  id: number;
  order_id: number;
  user_id: number;
  amount: number;
  amount_mxn: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
}
