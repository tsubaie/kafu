export interface User {
  id: string;
  name: string;
  email: string;
  department: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Recognition {
  id: string;
  sender_id: string;
  receiver_id: string;
  credits: number;
  badge: string | null;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_department?: string;
  receiver_name?: string;
  receiver_department?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  department: string | null;
  avatar_url: string | null;
  total_credits: number;
  recognition_count: number;
}

export interface CreditBalance {
  total: number;
  used: number;
  remaining: number;
}
