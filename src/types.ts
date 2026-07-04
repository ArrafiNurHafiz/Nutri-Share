export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_donation_id: number | null;
  created_at: string;
}

export type Role = "donor" | "recipient" | "admin";
export type Status = "pending" | "verified" | "rejected";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
}

export interface DonorProfile {
  id: number;
  user_id: number;
  business_name: string;
  business_type: string;
  address: string;
  latitude: number;
  longitude: number;
  total_donations: number;
}

export interface RecipientProfile {
  id: number;
  user_id: number;
  institution_name: string;
  institution_type: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  resident_count: number;
  age_range: string;
  health_condition: string;
  daily_protein_need: number;
  daily_calorie_need: number;
  daily_iron_need: number;
  daily_vitamin_c_need: number;
  urgency_score: number;
  last_received_donation: string | null;
  document_url: string;
}

export interface AKGData {
  date: string;
  daily_needs: {
    protein: number;
    calories: number;
    iron: number;
    vitamin_c: number;
  };
  today_intake: {
    protein: number;
    calories: number;
    iron: number;
    vitamin_c: number;
  };
  percentages: {
    protein: number;
    calories: number;
    iron: number;
    vitamin_c: number;
  };
  overall_percentage: number;
  donations_today: {
    id: number;
    food_name: string;
    portion_count: number;
    protein_total: number;
    calorie_total: number;
    iron_total: number;
    vitamin_c_total: number;
    completed_at: string;
  }[];
}

export interface Donation {
  id: number;
  donor_id: number;
  donor_name?: string;
  food_name: string;
  food_type: string;
  portion_count: number;
  protein_per_portion: number;
  calorie_per_portion: number;
  valid_until: string;
  status: "active" | "claimed" | "completed" | "expired";
  rank?: number;
  ci_score?: number;
}

export interface TopsisResult {
  id: number;
  donation_id: number;
  recipient_id: number;
  institution_name?: string;
  rank_position: number;
  raw_c1: number;
  raw_c2: number;
  raw_c3: number;
  raw_c4: number;
  raw_c5: number;
  weight_c1: number;
  weight_c2: number;
  weight_c3: number;
  weight_c4: number;
  weight_c5: number;
  d_plus: number;
  d_minus: number;
  ci_score: number;
}

export interface Claim {
  id: number;
  donation_id: number;
  recipient_id: number;
  food_name?: string;
  institution_name?: string;
  status: string;
  created_at: string;
}
