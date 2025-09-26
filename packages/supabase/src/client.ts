import { createClient } from '@supabase/supabase-js';

// Environment variables that work across platforms
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Detect platform
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

// Dynamic import for AsyncStorage only when needed
let storage: any = undefined;
if (isReactNative) {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storage = AsyncStorage;
  } catch (e) {
    console.warn('AsyncStorage not available');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: !isReactNative,
  },
});

// Database types (will be generated later from Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'student' | 'pro' | 'lifetime';
          subscription_expires_at: string | null;
          storage_used_bytes: number;
          storage_limit_bytes: number;
          onboarding_completed: boolean;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'student' | 'pro' | 'lifetime';
          subscription_expires_at?: string | null;
          storage_used_bytes?: number;
          storage_limit_bytes?: number;
          onboarding_completed?: boolean;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'student' | 'pro' | 'lifetime';
          subscription_expires_at?: string | null;
          storage_used_bytes?: number;
          storage_limit_bytes?: number;
          onboarding_completed?: boolean;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          user_id: string;
          type: 'note' | 'image' | 'article' | 'video' | 'pdf' | 'quote' | 'recipe' | 'tweet' | 'product' | 'link' | 'audio';
          title: string | null;
          content: string | null;
          url: string | null;
          source_domain: string | null;
          media_url: string | null;
          thumbnail_url: string | null;
          metadata: any;
          media_metadata: any;
          ai_tags: string[];
          ai_summary: string | null;
          ai_entities: any;
          ai_colors: string[];
          ai_sentiment: number | null;
          ai_category: string | null;
          ai_processed: boolean;
          ai_processed_at: string | null;
          embedding: number[] | null;
          is_pinned: boolean;
          is_archived: boolean;
          is_favorite: boolean;
          manual_tags: string[];
          smart_space_ids: string[];
          created_at: string;
          updated_at: string;
          accessed_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'note' | 'image' | 'article' | 'video' | 'pdf' | 'quote' | 'recipe' | 'tweet' | 'product' | 'link' | 'audio';
          title?: string | null;
          content?: string | null;
          url?: string | null;
          source_domain?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: any;
          media_metadata?: any;
          ai_tags?: string[];
          ai_summary?: string | null;
          ai_entities?: any;
          ai_colors?: string[];
          ai_sentiment?: number | null;
          ai_category?: string | null;
          ai_processed?: boolean;
          ai_processed_at?: string | null;
          embedding?: number[] | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          is_favorite?: boolean;
          manual_tags?: string[];
          smart_space_ids?: string[];
          created_at?: string;
          updated_at?: string;
          accessed_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'note' | 'image' | 'article' | 'video' | 'pdf' | 'quote' | 'recipe' | 'tweet' | 'product' | 'link' | 'audio';
          title?: string | null;
          content?: string | null;
          url?: string | null;
          source_domain?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: any;
          media_metadata?: any;
          ai_tags?: string[];
          ai_summary?: string | null;
          ai_entities?: any;
          ai_colors?: string[];
          ai_sentiment?: number | null;
          ai_category?: string | null;
          ai_processed?: boolean;
          ai_processed_at?: string | null;
          embedding?: number[] | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          is_favorite?: boolean;
          manual_tags?: string[];
          smart_space_ids?: string[];
          created_at?: string;
          updated_at?: string;
          accessed_at?: string;
          deleted_at?: string | null;
        };
      };
    };
  };
};