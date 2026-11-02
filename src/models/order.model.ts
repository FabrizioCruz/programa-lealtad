export interface Order {
  id: number;
  status: string;
  payment_status: string;
  total: number;
  user_id: number;
  created_at: string;
}
