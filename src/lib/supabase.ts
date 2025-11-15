import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  birth_date: string;
  age: number;
  gender: 'erkek' | 'kadın' | 'diğer';
  city?: string;
  phone?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  photo_url?: string;
  bio?: string;
  interests?: string[];
  is_premium: boolean;
  is_admin?: boolean;
  daily_offers_count: number;
  last_offer_reset: string;
  free_offers_used: number;
  total_offers_sent: number;
  is_boosted?: boolean;
  boost_expires_at?: string;
  super_likes_remaining?: number;
  last_super_like_reset?: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
};

export type ActivityOffer = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  city: string;
  district?: string;
  event_date: string;
  participant_count: number;
  offer_type: 'birebir' | 'grup';
  category?: 'kahve' | 'yemek' | 'spor' | 'sinema' | 'gezi' | 'konser' | 'diger';
  image_url?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  creator?: Profile;
};

export type OfferRequest = {
  id: string;
  offer_id: string;
  requester_id: string;
  message?: string;
  suggested_date?: string;
  suggested_location?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester?: Profile;
  offer?: ActivityOffer;
};

export type Package = {
  id: string;
  user_id: string;
  package_type: 'gunluk' | 'aylik' | 'premium';
  offer_limit?: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
};

export type Offer = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'matched' | 'rejected';
  created_at: string;
  sender?: Profile;
};

export type Payment = {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};
