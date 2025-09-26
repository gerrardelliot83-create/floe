-- Floe Database Schema
-- Ultra-minimalist personal knowledge management with AI processing

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom types
CREATE TYPE card_type AS ENUM (
  'note', 'image', 'article', 'video', 'pdf', 'quote',
  'recipe', 'tweet', 'product', 'link', 'audio'
);

CREATE TYPE subscription_tier AS ENUM ('free', 'student', 'pro', 'lifetime');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 5368709120, -- 5GB
  onboarding_completed BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{
    "theme": "system",
    "language": "en",
    "emailNotifications": true,
    "aiProcessing": true,
    "searchHistory": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cards table (main content)
CREATE TABLE public.cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  type card_type NOT NULL,
  title TEXT,
  content TEXT, -- For notes and extracted text
  url TEXT,
  source_domain TEXT,
  media_url TEXT,
  thumbnail_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  media_metadata JSONB DEFAULT '{}'::jsonb, -- dimensions, duration, size, etc.

  -- AI-generated fields
  ai_tags TEXT[] DEFAULT array[]::text[],
  ai_summary TEXT,
  ai_entities JSONB DEFAULT '{}'::jsonb,
  ai_colors TEXT[] DEFAULT array[]::text[], -- hex colors
  ai_sentiment NUMERIC(3,2), -- -1 to 1
  ai_category TEXT,
  ai_processed BOOLEAN DEFAULT false,
  ai_processed_at TIMESTAMP WITH TIME ZONE,
  embedding VECTOR(1536), -- Claude embeddings (if available) or alternative

  -- Search (computed via trigger instead of generated column)
  search_vector TSVECTOR,

  -- Organization
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  manual_tags TEXT[] DEFAULT array[]::text[],
  smart_space_ids UUID[] DEFAULT array[]::uuid[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Smart Spaces (auto-collections)
CREATE TABLE public.smart_spaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',  -- Simple text identifier for geometric icons
  color TEXT DEFAULT '#000000', -- Black for light mode, white for dark mode

  -- Rules for automatic inclusion (JSON query)
  rules JSONB NOT NULL DEFAULT '{
    "conditions": [],
    "logic": "AND"
  }'::jsonb,
  /* Example rules:
  {
    "conditions": [
      {"field": "type", "operator": "equals", "value": "image"},
      {"field": "ai_tags", "operator": "contains", "value": "design"}
    ],
    "logic": "AND"
  }
  */

  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  cards_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Highlights (for articles/PDFs)
CREATE TABLE public.highlights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  note TEXT,
  color TEXT DEFAULT '#000000',
  position JSONB, -- {start: number, end: number, page?: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- OCR Results (for images)
CREATE TABLE public.ocr_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards ON DELETE CASCADE NOT NULL UNIQUE,
  full_text TEXT,
  blocks JSONB, -- Detailed text blocks with positions
  language TEXT,
  confidence NUMERIC(3,2),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quick capture (temporary storage before processing)
CREATE TABLE public.quick_captures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  card_id UUID REFERENCES public.cards ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Search sessions (for search history)
CREATE TABLE public.search_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cards_type ON public.cards(type);
CREATE INDEX idx_cards_created_at ON public.cards(created_at DESC);
CREATE INDEX idx_cards_is_pinned ON public.cards(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_cards_ai_tags ON public.cards USING gin(ai_tags);
CREATE INDEX idx_cards_search ON public.cards USING gin(search_vector);
CREATE INDEX idx_cards_embedding ON public.cards USING ivfflat(embedding vector_cosine_ops);
CREATE INDEX idx_cards_user_created ON public.cards(user_id, created_at DESC);
CREATE INDEX idx_cards_user_updated ON public.cards(user_id, updated_at DESC);
CREATE INDEX idx_smart_spaces_user_id ON public.smart_spaces(user_id);
CREATE INDEX idx_highlights_card_id ON public.highlights(card_id);
CREATE INDEX idx_search_sessions_user_id ON public.search_sessions(user_id, created_at DESC);

-- Full-text search function
CREATE OR REPLACE FUNCTION search_cards(
  search_query TEXT,
  user_uuid UUID,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  type card_type,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.content,
    c.type,
    c.thumbnail_url,
    c.created_at,
    ts_rank(c.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM public.cards c
  WHERE
    c.user_id = user_uuid
    AND c.deleted_at IS NULL
    AND c.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT limit_count;
END;
$$;

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_cards(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.78,
  match_count INT DEFAULT 10,
  user_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  type card_type,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cards.id,
    cards.title,
    cards.content,
    cards.type,
    1 - (cards.embedding <=> query_embedding) AS similarity
  FROM cards
  WHERE cards.embedding IS NOT NULL
    AND (user_uuid IS NULL OR cards.user_id = user_uuid)
    AND cards.deleted_at IS NULL
    AND 1 - (cards.embedding <=> query_embedding) > match_threshold
  ORDER BY cards.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Smart space evaluation function
CREATE OR REPLACE FUNCTION evaluate_smart_space_rules(
  card_row public.cards,
  space_rules JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  condition JSONB;
  conditions JSONB[];
  logic TEXT;
  result BOOLEAN := false;
  condition_result BOOLEAN;
  field TEXT;
  operator TEXT;
  value TEXT;
BEGIN
  -- Extract logic and conditions
  logic := COALESCE(space_rules->>'logic', 'AND');
  conditions := ARRAY(SELECT jsonb_array_elements(space_rules->'conditions'));

  -- If no conditions, return false
  IF array_length(conditions, 1) IS NULL THEN
    RETURN false;
  END IF;

  -- Initialize result based on logic
  IF logic = 'AND' THEN
    result := true;
  ELSE
    result := false;
  END IF;

  -- Evaluate each condition
  FOREACH condition IN ARRAY conditions LOOP
    field := condition->>'field';
    operator := condition->>'operator';
    value := condition->>'value';
    condition_result := false;

    -- Evaluate condition based on field and operator
    CASE field
      WHEN 'type' THEN
        CASE operator
          WHEN 'equals' THEN condition_result := (card_row.type::text = value);
          WHEN 'not_equals' THEN condition_result := (card_row.type::text != value);
        END CASE;
      WHEN 'ai_tags' THEN
        CASE operator
          WHEN 'contains' THEN condition_result := (value = ANY(card_row.ai_tags));
          WHEN 'not_contains' THEN condition_result := (value != ALL(card_row.ai_tags));
        END CASE;
      WHEN 'ai_category' THEN
        CASE operator
          WHEN 'equals' THEN condition_result := (card_row.ai_category = value);
          WHEN 'not_equals' THEN condition_result := (card_row.ai_category != value);
        END CASE;
    END CASE;

    -- Apply logic
    IF logic = 'AND' THEN
      result := result AND condition_result;
    ELSE
      result := result OR condition_result;
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_spaces_updated_at BEFORE UPDATE ON public.smart_spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update smart space card counts
CREATE OR REPLACE FUNCTION update_smart_space_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts for all smart spaces
  UPDATE public.smart_spaces
  SET cards_count = (
    SELECT COUNT(*)
    FROM public.cards
    WHERE user_id = smart_spaces.user_id
      AND deleted_at IS NULL
      AND smart_spaces.id = ANY(cards.smart_space_ids)
  )
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_smart_space_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION update_smart_space_counts();

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.ai_tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cards_search_vector
  BEFORE INSERT OR UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Smart space array management functions
CREATE OR REPLACE FUNCTION add_card_to_smart_space(
  card_id_param UUID,
  space_id_param UUID,
  user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.cards
  SET smart_space_ids = array_append(COALESCE(smart_space_ids, ARRAY[]::uuid[]), space_id_param)
  WHERE id = card_id_param
    AND user_id = user_id_param
    AND NOT (space_id_param = ANY(COALESCE(smart_space_ids, ARRAY[]::uuid[])));
END;
$$;

CREATE OR REPLACE FUNCTION remove_card_from_smart_space(
  card_id_param UUID,
  space_id_param UUID,
  user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.cards
  SET smart_space_ids = array_remove(smart_space_ids, space_id_param)
  WHERE id = card_id_param
    AND user_id = user_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION remove_smart_space_from_all_cards(
  space_id_param UUID,
  user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.cards
  SET smart_space_ids = array_remove(smart_space_ids, space_id_param)
  WHERE user_id = user_id_param
    AND space_id_param = ANY(smart_space_ids);
END;
$$;

CREATE OR REPLACE FUNCTION batch_update_smart_space_cards(
  space_id_param UUID,
  user_id_param UUID,
  add_card_ids UUID[],
  remove_card_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add cards to space
  IF array_length(add_card_ids, 1) > 0 THEN
    UPDATE public.cards
    SET smart_space_ids = array_append(COALESCE(smart_space_ids, ARRAY[]::uuid[]), space_id_param)
    WHERE id = ANY(add_card_ids)
      AND user_id = user_id_param
      AND NOT (space_id_param = ANY(COALESCE(smart_space_ids, ARRAY[]::uuid[])));
  END IF;

  -- Remove cards from space
  IF array_length(remove_card_ids, 1) > 0 THEN
    UPDATE public.cards
    SET smart_space_ids = array_remove(smart_space_ids, space_id_param)
    WHERE id = ANY(remove_card_ids)
      AND user_id = user_id_param;
  END IF;
END;
$$;