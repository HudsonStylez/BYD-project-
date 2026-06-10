export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  referral_code: string;
  referrer_id: number | null;
  membership_active: number; // 0 or 1
  membership_expiry: string | null;
  horizon_points: number;
  crypto_wallet_address: string;
  city: string;
  created_at: string;
  status?: string; // 'active' or 'blocked'
}

export interface Payment {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'membership' | 'installment' | 'expedite';
  transaction_hash: string;
  created_at: string;
}

export interface Referral {
  id: number;
  referrer_id: number;
  referred_user_id: number;
  status: 'pending' | 'paid';
  reward_amount: number;
  created_at: string;
  referred_user_name?: string;
  referred_user_email?: string;
}

export interface MapTracking {
  user_id: number;
  current_lat: number;
  current_lng: number;
  route_index: number;
  total_stops: number;
  delays_encountered: number; // bitmask or count of delays hit
  expedite_paid: number; // 0 or 1
  last_updated: string;
}

export interface Delay {
  id: number;
  name: string;
  duration_days: number;
  trigger_after_km: number;
  expedite_fee: number;
}

export interface RewardItem {
  id: number;
  name: string;
  points_cost: number;
  image_url: string;
  description: string;
  status: 'In Stock' | 'Out of Stock' | 'Backordered';
}

export interface RewardRedemption {
  id: number;
  user_id: number;
  item_name: string;
  points_spent: number;
  tracking_number: string;
  status: 'Processing' | 'Shipped' | 'Cancelled';
  created_at: string;
  username?: string; // for admin panel
}

export interface CharityCounter {
  id: number;
  current_amount: number;
  increment_per_second: number;
}

export interface AdminLog {
  id: number;
  admin_action: string;
  timestamp: string;
}

export interface SupportTicket {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
}

export interface DashboardData {
  user: User;
  activeVehicle: {
    model: string;
    expectedDeliveryDate: string;
    totalPaid: number;
    installmentCount: number;
    monthlyPayment: number;
  } | null;
  tracking: MapTracking | null;
  delays: Delay[];
  redemptions: RewardRedemption[];
  referrals: Referral[];
  referralStats: {
    code: string;
    pendingCount: number;
    paidCount: number;
    estimatedEarnings: number; // pending referral fees
    withdrawable: boolean;
  };
  leaderboard: Array<{ name: string; count: number; is_fake: number }>;
}
