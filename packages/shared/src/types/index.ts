export type CardType =
  | 'note'
  | 'image'
  | 'article'
  | 'video'
  | 'pdf'
  | 'quote'
  | 'recipe'
  | 'tweet'
  | 'product'
  | 'link'
  | 'audio';

export type SubscriptionTier = 'free' | 'student' | 'pro' | 'lifetime';

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  onboarding_completed: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    emailNotifications: boolean;
    aiProcessing: boolean;
    searchHistory: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  type: CardType;
  title?: string;
  content?: string;
  url?: string;
  source_domain?: string;
  media_url?: string;
  thumbnail_url?: string;
  metadata: Record<string, any>;
  media_metadata: Record<string, any>;

  // AI-generated fields
  ai_tags: string[];
  ai_summary?: string;
  ai_entities: Record<string, any>;
  ai_colors: string[];
  ai_sentiment?: number;
  ai_category?: string;
  ai_processed: boolean;
  ai_processed_at?: string;
  embedding?: number[];

  // Organization
  is_pinned: boolean;
  is_archived: boolean;
  is_favorite: boolean;
  manual_tags: string[];
  smart_space_ids: string[];

  // Timestamps
  created_at: string;
  updated_at: string;
  accessed_at: string;
  deleted_at?: string;
}

export interface SmartSpace {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  rules: {
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    logic: 'AND' | 'OR';
  };
  is_active: boolean;
  is_default: boolean;
  cards_count: number;
  created_at: string;
  updated_at: string;
}

export interface Highlight {
  id: string;
  card_id: string;
  user_id: string;
  text: string;
  note?: string;
  color: string;
  position?: {
    start: number;
    end: number;
    page?: number;
  };
  created_at: string;
}

export interface OCRResult {
  id: string;
  card_id: string;
  full_text?: string;
  blocks?: Record<string, any>;
  language?: string;
  confidence?: number;
  processed_at: string;
}

export interface QuickCapture {
  id: string;
  user_id: string;
  type: string;
  content: Record<string, any>;
  processed: boolean;
  card_id?: string;
  created_at: string;
}

export interface AIAnalysis {
  tags: string[];
  summary?: string;
  entities: Entity[];
  sentiment?: number;
  category?: string;
  colors?: string[];
  processedAt: Date;
}

export interface Entity {
  text: string;
  type: 'PERSON' | 'ORGANIZATION' | 'LOCATION' | 'DATE' | 'PRODUCT' | 'EVENT';
  confidence?: number;
}

export interface ImageAnalysis {
  objects: string[];
  scene: string;
  colors: string[];
  tags: string[];
  text?: string;
}

export interface SuggestionContext {
  type: 'search' | 'tags' | 'related';
  query?: string;
  card?: Card;
}

export interface SearchResult {
  id: string;
  title?: string;
  content?: string;
  type: CardType;
  thumbnail_url?: string;
  created_at: string;
  rank: number;
}